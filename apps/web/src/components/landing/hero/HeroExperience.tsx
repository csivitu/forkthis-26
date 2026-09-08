"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SiteHeader } from "../navigation/SiteHeader";
import { useHeroAudio } from "./HeroAudio";
import { ABOUT_FLIGHT_POSITION } from "./scene/spaceMath";
import type { PointerPosition } from "./scene/types";

const INITIAL_POINTER: PointerPosition = { x: 0, y: 0 };
const ABOUT_STOP_START = 0.68;

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#070103]" />,
});

export function HeroExperience() {
  const container = useRef<HTMLDivElement>(null);
  const frameRequest = useRef<number | null>(null);
  const lastStage = useRef(1);
  const [progress, setProgress] = useState(0);
  const [aboutPhase, setAboutPhase] = useState(0);
  const [flightPaused, setFlightPaused] = useState(false);
  const [pointer, setPointer] = useState(INITIAL_POINTER);
  const { playAlert, playWave } = useHeroAudio();

  const updateScroll = useCallback(() => {
    frameRequest.current = null;
    const element = container.current;
    if (!element) return;
    const travel = element.offsetHeight - window.innerHeight;
    const scrolled = -element.getBoundingClientRect().top;
    const rawProgress = travel > 0 ? Math.max(0, Math.min(1, scrolled / travel)) : 0;
    const inAboutStop = rawProgress >= ABOUT_STOP_START;
    const flightProgress =
      rawProgress < ABOUT_STOP_START
        ? (rawProgress / ABOUT_STOP_START) * ABOUT_FLIGHT_POSITION
        : ABOUT_FLIGHT_POSITION;
    const nextAboutPhase =
      rawProgress <= ABOUT_STOP_START
        ? 0
        : (rawProgress - ABOUT_STOP_START) / (1 - ABOUT_STOP_START);

    setProgress(flightProgress);
    setAboutPhase(nextAboutPhase);
    setFlightPaused(inAboutStop);
  }, []);

  useEffect(() => {
    const scheduleScrollUpdate = () => {
      if (frameRequest.current === null) {
        frameRequest.current = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleScrollUpdate);
      if (frameRequest.current !== null) window.cancelAnimationFrame(frameRequest.current);
    };
  }, [updateScroll]);

  useEffect(() => {
    const stage = progress < 0.35 ? 1 : progress < 0.75 ? 2 : 3;
    if (stage === lastStage.current) return;
    lastStage.current = stage;
    if (stage === 2) playWave();
    if (stage === 3) playAlert();
  }, [playAlert, playWave, progress]);

  const borderOpacity = Math.max(0, Math.min(1, (aboutPhase - 0.96) / 0.04));
  return (
    <div
      id="home"
      ref={container}
      className="relative h-[850vh] w-full bg-[#070103] sm:h-[1100vh]"
      onPointerMove={(event) => {
        setPointer({
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1,
        });
      }}
    >
      <SiteHeader />
      <div className="cockpit-bezel" style={{ opacity: borderOpacity }} aria-hidden="true" />
      <span id="dashboard" className="absolute top-[28%]" aria-hidden="true" />
      <span id="leaderboard" className="absolute top-[58%]" aria-hidden="true" />
      <span id="resources" className="absolute top-[86%]" aria-hidden="true" />
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroCanvas
            progress={progress}
            pointer={pointer}
            paused={flightPaused}
            aboutPhase={aboutPhase}
          />
        </div>
        <h1 className="sr-only">Forkthis</h1>
      </div>
    </div>
  );
}
