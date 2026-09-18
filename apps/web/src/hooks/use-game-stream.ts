"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GAME_STREAM_EVENTS,
  type GameRoundEndedDto,
  type LiveGameRoundDto,
} from "@repo/game-contracts";

/**
 * A live round, with the countdown pinned to a monotonic clock.
 *
 * `remainingAtBaseMs` and `baseTicks` are captured once when the payload
 * arrives. Every later tick is `remainingAtBaseMs - (performance.now() -
 * baseTicks)`. Deriving the countdown from `Date.now()` on each tick would
 * break on the many workshop laptops whose wall clock is minutes out of sync
 * with the server, and would jump if the OS resynced mid-question.
 */
export interface ActiveRound {
  round: LiveGameRoundDto;
  remainingAtBaseMs: number;
  baseTicks: number;
}

export interface GameStreamState {
  active: ActiveRound | null;
  result: GameRoundEndedDto | null;
  connected: boolean;
}

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 15_000;

function toActiveRound(round: LiveGameRoundDto): ActiveRound {
  const endsAt = Date.parse(round.endsAt);
  const serverNow = Date.parse(round.serverNow);
  // Both timestamps come from the server, so their difference is free of any
  // client clock error.
  const remainingAtBaseMs = Math.max(endsAt - serverNow, 0);
  return { round, remainingAtBaseMs, baseTicks: performance.now() };
}

export function remainingMs(active: ActiveRound): number {
  return Math.max(
    active.remainingAtBaseMs - (performance.now() - active.baseTicks),
    0,
  );
}

/**
 * Subscribes to the game stream while `enabled`.
 *
 * EventSource reconnects on its own, but only for clean drops; an HTTP error
 * closes it permanently, so the error path reopens it with capped backoff.
 * Workshop wifi makes this the common case, not the edge case.
 */
export function useGameStream(enabled: boolean): GameStreamState {
  const [active, setActive] = useState<ActiveRound | null>(null);
  const [result, setResult] = useState<GameRoundEndedDto | null>(null);
  const [connected, setConnected] = useState(false);

  const sourceRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  const connect = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!apiUrl) return;

    const source = new EventSource(`${apiUrl}/api/game/stream`, {
      withCredentials: true,
    });
    sourceRef.current = source;

    source.onopen = () => {
      attemptsRef.current = 0;
      setConnected(true);
    };

    source.addEventListener(GAME_STREAM_EVENTS.roundStart, (event) => {
      const round = JSON.parse((event as MessageEvent<string>).data) as
        LiveGameRoundDto;
      setResult(null);
      setActive(toActiveRound(round));
    });

    source.addEventListener(GAME_STREAM_EVENTS.roundEnd, (event) => {
      const ended = JSON.parse((event as MessageEvent<string>).data) as
        GameRoundEndedDto;
      // Keep `active` so the popup can show the reveal against the question.
      setResult(ended);
    });

    source.onerror = () => {
      setConnected(false);
      source.close();
      sourceRef.current = null;

      attemptsRef.current += 1;
      const delay = Math.min(
        RECONNECT_BASE_MS * 2 ** (attemptsRef.current - 1),
        RECONNECT_MAX_MS,
      );
      retryRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      sourceRef.current?.close();
      sourceRef.current = null;
      setConnected(false);
    };
  }, [enabled, connect]);

  return { active, result, connected };
}
