"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { GameRoundEndedDto } from "@repo/game-contracts";
import { apiClient, apiErrorMessage } from "@/lib/api-client";
import { remainingMs, type ActiveRound } from "@/hooks/use-game-stream";

export interface GameQuestionPopupProps {
  active: ActiveRound;
  result: GameRoundEndedDto | null;
  onDismiss: () => void;
}

type SubmitState =
  | { status: "idle" }
  | { status: "sending"; selectedIndex: number }
  | { status: "locked"; selectedIndex: number; responseMs: number }
  | { status: "failed"; message: string };

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const formatSeconds = (ms: number): string => (ms / 1000).toFixed(1);

export function GameQuestionPopup({
  active,
  result,
  onDismiss,
}: GameQuestionPopupProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState(() => remainingMs(active));
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  const revealed = result !== null && result.roundId === active.round.roundId;

  // Drive the countdown off the monotonic base captured when the question
  // arrived, never off the wall clock.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setRemaining(remainingMs(active));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Escape only dismisses after the reveal. A question in flight must not be
  // closable by a stray keypress.
  useEffect(() => {
    if (!revealed) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [revealed, onDismiss]);

  const answer = useCallback(
    async (selectedIndex: number) => {
      if (submit.status === "sending" || submit.status === "locked") return;
      setSubmit({ status: "sending", selectedIndex });
      try {
        const response = await apiClient.post<{
          data: { responseMs: number };
        }>("/api/game/answers", {
          roundId: active.round.roundId,
          selectedIndex,
        });
        setSubmit({
          status: "locked",
          selectedIndex,
          responseMs: response.data.data.responseMs,
        });
      } catch (error) {
        setSubmit({
          status: "failed",
          message:
            error instanceof Error
              ? apiErrorMessage(error)
              : "Could not submit your answer",
        });
      }
    },
    [active.round.roundId, submit.status],
  );

  const lockedIndex =
    submit.status === "locked" || submit.status === "sending"
      ? submit.selectedIndex
      : null;
  const totalMs = active.round.durationSeconds * 1000;
  const progress = Math.max(Math.min(remaining / totalMs, 1), 0);
  const urgent = !revealed && remaining <= 5000;

  return (
    <div className="ffa" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="ffa__backdrop" />
      <div ref={panelRef} className="ffa__panel" tabIndex={-1}>
        <div className="ffa__head">
          <p className="ffa__eyebrow">Fastest Fingers First</p>
          {revealed ? (
            <p className="ffa__timer ffa__timer--done">TIME UP</p>
          ) : (
            <p
              className={`ffa__timer${urgent ? " ffa__timer--urgent" : ""}`}
              role="timer"
              aria-live="off"
            >
              {formatSeconds(remaining)}s
            </p>
          )}
        </div>

        <div className="ffa__track" aria-hidden="true">
          <div
            className={`ffa__bar${urgent ? " ffa__bar--urgent" : ""}`}
            style={{ transform: `scaleX(${revealed ? 0 : progress})` }}
          />
        </div>

        <h2 id={titleId} className="ffa__prompt">
          {active.round.prompt}
        </h2>

        <ul className="ffa__options">
          {active.round.options.map((option, index) => {
            const isChosen = lockedIndex === index;
            const isCorrect = revealed && result.correctIndex === index;
            const isWrongChoice = revealed && isChosen && !isCorrect;
            const classes = [
              "ffa__option",
              isChosen ? "ffa__option--chosen" : "",
              isCorrect ? "ffa__option--correct" : "",
              isWrongChoice ? "ffa__option--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={option}>
                <button
                  type="button"
                  className={classes}
                  disabled={revealed || submit.status !== "idle"}
                  onClick={() => void answer(index)}
                >
                  <span className="ffa__key">{OPTION_LABELS[index]}</span>
                  <span className="ffa__label">{option}</span>
                  {isCorrect ? <span className="ffa__flag">CORRECT</span> : null}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="ffa__foot">
          {submit.status === "failed" ? (
            <p className="ffa__status ffa__status--error" role="alert">
              {submit.message}
            </p>
          ) : null}

          {submit.status === "locked" && !revealed ? (
            <p className="ffa__status">
              Answer locked in {(submit.responseMs / 1000).toFixed(2)}s — waiting
              for the reveal…
            </p>
          ) : null}

          {submit.status === "idle" && !revealed ? (
            <p className="ffa__status">Pick an option. You only get one shot.</p>
          ) : null}

          {revealed ? (
            <div className="ffa__result">
              <p className="ffa__status">
                {lockedIndex === null
                  ? "You did not answer in time."
                  : lockedIndex === result.correctIndex
                    ? `Correct — answered in ${
                        submit.status === "locked"
                          ? (submit.responseMs / 1000).toFixed(2)
                          : "?"
                      }s`
                    : "Not this time."}
              </p>
              <p className="ffa__tally">
                {result.correctAnswers} of {result.totalAnswers} answered
                correctly
              </p>
              {result.fastest.length > 0 ? (
                <ol className="ffa__fastest">
                  {result.fastest.map((entry) => (
                    <li key={entry.userId}>
                      <span className="ffa__rank">{entry.rank}</span>
                      <span className="ffa__who">
                        {entry.name ?? entry.githubUsername ?? "Participant"}
                      </span>
                      <span className="ffa__ms">
                        {(entry.responseMs / 1000).toFixed(2)}s
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
              <button
                type="button"
                className="ffa__dismiss"
                onClick={onDismiss}
                autoFocus
              >
                Close
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
