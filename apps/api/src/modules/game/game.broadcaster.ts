import type { Response } from "express";
import {
  ANSWER_GRACE_MS,
  GAME_STREAM_EVENTS,
  type GameRoundEndedDto,
  type LiveGameRoundDto,
} from "@repo/game-contracts";
import logger from "../../utils/logger.util";

/**
 * In-process fan-out for Fastest Fingers First.
 *
 * This is deliberately in-memory. The API is deployed as a single container
 * (see docker-compose.yaml and .github/workflows/deploy-api.yml), so one
 * process holds every open stream and there is nothing to coordinate. If the
 * API is ever scaled to more than one replica this must move behind a shared
 * bus (Redis pub/sub or Postgres LISTEN/NOTIFY), otherwise a push only reaches
 * the participants who happen to be connected to the replica that handled it.
 */

/** Heartbeat cadence. Proxies commonly drop an idle upstream at 60s. */
const HEARTBEAT_MS = 15_000;

/**
 * How long the finished round stays queryable after its reveal, so a client
 * that reconnects moments later still learns how the round ended.
 */
const ROUND_RETENTION_MS = 60_000;

export interface LiveRound {
  roundId: string;
  questionId: string;
  prompt: string;
  options: string[];
  /** Never leaves the server until the round ends. */
  correctIndex: number;
  durationSeconds: number;
  startedAt: Date;
  endsAt: Date;
}

interface StreamClient {
  userId: string;
  res: Response;
}

const clients = new Set<StreamClient>();

let currentRound: LiveRound | null = null;
let revealTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/** Set by the controller so the broadcaster can tally answers at reveal time. */
type RoundResultLoader = (round: LiveRound) => Promise<GameRoundEndedDto>;
let loadRoundResults: RoundResultLoader | null = null;

export function onRoundReveal(loader: RoundResultLoader): void {
  loadRoundResults = loader;
}

function write(client: StreamClient, event: string, data: unknown): boolean {
  try {
    return client.res.write(
      `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
    );
  } catch (error) {
    logger.warn({ err: error }, "Dropping a dead game stream client");
    clients.delete(client);
    return false;
  }
}

function broadcast(event: string, data: unknown): void {
  for (const client of clients) write(client, event, data);
}

function toLiveDto(round: LiveRound): LiveGameRoundDto {
  return {
    roundId: round.roundId,
    questionId: round.questionId,
    prompt: round.prompt,
    options: round.options,
    durationSeconds: round.durationSeconds,
    startedAt: round.startedAt.toISOString(),
    endsAt: round.endsAt.toISOString(),
    // Re-stamped per delivery, so a late joiner measures skew against the
    // moment they actually received the payload rather than the push.
    serverNow: new Date().toISOString(),
  };
}

function ensureHeartbeat(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    if (clients.size === 0) {
      clearInterval(heartbeatTimer as ReturnType<typeof setInterval>);
      heartbeatTimer = null;
      return;
    }
    // A comment frame: valid SSE, ignored by EventSource, but it keeps the
    // socket and any intermediary proxy awake.
    for (const client of clients) {
      try {
        client.res.write(`: ping ${Date.now()}\n\n`);
      } catch {
        clients.delete(client);
      }
    }
  }, HEARTBEAT_MS);
}

/**
 * Registers one participant's stream. Returns the teardown to run when the
 * request closes.
 */
export function addClient(userId: string, res: Response): () => void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    // `no-transform` stops compression middleware from buffering the stream.
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // nginx buffers proxied responses by default, which would hold every
    // event until the connection closed. This is the opt-out.
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const client: StreamClient = { userId, res };
  clients.add(client);
  ensureHeartbeat();

  // Prime the connection immediately: without a first byte some proxies keep
  // the response buffered and the client never fires `onopen`.
  res.write(`retry: 3000\n\n`);

  // A participant who loads the page mid-round should still get the question.
  const live = getLiveRound();
  if (live) write(client, GAME_STREAM_EVENTS.roundStart, toLiveDto(live));

  logger.info({ userId, clients: clients.size }, "Game stream opened");

  return () => {
    clients.delete(client);
    logger.info({ userId, clients: clients.size }, "Game stream closed");
  };
}

export function connectedClientCount(): number {
  return clients.size;
}

/** The round currently accepting answers, or null. Excludes the grace window. */
export function getLiveRound(): LiveRound | null {
  if (!currentRound) return null;
  return Date.now() <= currentRound.endsAt.getTime() ? currentRound : null;
}

/**
 * The round answers may still be written against — the live window plus the
 * grace period. The answer endpoint uses this, never `getLiveRound`.
 */
export function getAnswerableRound(): LiveRound | null {
  if (!currentRound) return null;
  return Date.now() <= currentRound.endsAt.getTime() + ANSWER_GRACE_MS
    ? currentRound
    : null;
}

async function revealRound(round: LiveRound): Promise<void> {
  let payload: GameRoundEndedDto = {
    roundId: round.roundId,
    correctIndex: round.correctIndex,
    totalAnswers: 0,
    correctAnswers: 0,
    fastest: [],
  };
  try {
    if (loadRoundResults) payload = await loadRoundResults(round);
  } catch (error) {
    // The reveal must go out even if tallying fails — participants are
    // staring at a dead timer waiting for the answer.
    logger.error({ err: error, roundId: round.roundId }, "Round tally failed");
  }
  broadcast(GAME_STREAM_EVENTS.roundEnd, payload);
  logger.info(
    { roundId: round.roundId, answers: payload.totalAnswers },
    "Game round revealed",
  );

  setTimeout(() => {
    if (currentRound?.roundId === round.roundId) currentRound = null;
  }, ROUND_RETENTION_MS).unref?.();
}

/**
 * Makes a round live and schedules its reveal. Replaces any round still in
 * flight — an administrator pushing a new question supersedes the old one.
 */
export function startRound(round: LiveRound): void {
  if (revealTimer) clearTimeout(revealTimer);
  currentRound = round;

  broadcast(GAME_STREAM_EVENTS.roundStart, toLiveDto(round));
  logger.info(
    {
      roundId: round.roundId,
      durationSeconds: round.durationSeconds,
      clients: clients.size,
    },
    "Game round pushed",
  );

  // Reveal after the grace window so answers that landed late are counted.
  const delay = round.endsAt.getTime() - Date.now() + ANSWER_GRACE_MS;
  revealTimer = setTimeout(() => {
    revealTimer = null;
    void revealRound(round);
  }, Math.max(delay, 0));
}

/** Ends the live round early. The reveal fires immediately. */
export function endRoundNow(): LiveRound | null {
  const round = getLiveRound();
  if (!round) return null;
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  round.endsAt = new Date();
  void revealRound(round);
  return round;
}
