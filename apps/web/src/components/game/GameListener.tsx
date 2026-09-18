"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStream } from "@/hooks/use-game-stream";
import { useSessionQuery } from "@/hooks/use-session";
import { playChime, startTitleFlash, stopTitleFlash } from "@/lib/game-alert";
import { GameQuestionPopup } from "./GameQuestionPopup";

/**
 * Site-wide listener for Fastest Fingers First.
 *
 * Mounted in the root layout as a sibling of `AuthGate` rather than inside it:
 * AuthGate returns an early "Checking your session…" branch for protected
 * routes, which would unmount the stream — and drop the participant's
 * connection — exactly while they navigate between Dashboard and Leaderboard.
 */
export function GameListener() {
  const session = useSessionQuery();
  const signedIn = Boolean(session.data);
  const { active, result } = useGameStream(signedIn);

  const [dismissedRoundId, setDismissedRoundId] = useState<string | null>(null);
  const announcedRoundRef = useRef<string | null>(null);

  // Fire the attention cues once per round, and only when the participant is
  // not already looking at the page.
  useEffect(() => {
    if (!active) return;
    if (announcedRoundRef.current === active.round.roundId) return;
    announcedRoundRef.current = active.round.roundId;

    playChime();
    if (document.hidden) startTitleFlash();
  }, [active]);

  // Stop flashing the moment they come back to the tab.
  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) stopTitleFlash();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopTitleFlash();
    };
  }, []);

  const dismiss = useCallback(() => {
    if (active) setDismissedRoundId(active.round.roundId);
    stopTitleFlash();
  }, [active]);

  if (!signedIn || !active) return null;
  if (dismissedRoundId === active.round.roundId) return null;

  return (
    <GameQuestionPopup active={active} result={result} onDismiss={dismiss} />
  );
}
