"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HeroHud } from "./HeroHud";
import { useHeroAudio } from "./HeroAudio";
import type { PointerPosition } from "./scene/types";

const INITIAL_POINTER: PointerPosition = { x: 0, y: 0 };

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#070103]" />,
});

export function HeroExperience() {
  const container = useRef<HTMLDivElement>(null);
  const frameRequest = useRef<number | null>(null);
  const lastStage = useRef(1);
  const [progress, setProgress] = useState(0);
  const [pointer, setPointer] = useState(INITIAL_POINTER);
  const { playAlert, playWave } = useHeroAudio();

  const updateScroll = useCallback(() => {
    frameRequest.current = null;
    const element = container.current;
    if (!element) return;
    const travel = element.offsetHeight - window.innerHeight;
    const scrolled = -element.getBoundingClientRect().top;
    const rawProgress = travel > 0 ? Math.max(0, Math.min(1, scrolled / travel)) : 0;
    const flightProgress =
      rawProgress < 0.6
        ? (rawProgress / 0.6) * 0.72
        : 0.72 + ((rawProgress - 0.6) / 0.4) * 0.28;
    setProgress(flightProgress);
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

  const borderOpacity = Math.max(0, Math.min(1, (progress - 0.985) / 0.015));
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
      <HeroHud />
      <div className="cockpit-bezel" style={{ opacity: borderOpacity }} aria-hidden="true" />
      <span id="dashboard" className="absolute top-[28%]" aria-hidden="true" />
      <span id="leaderboard" className="absolute top-[58%]" aria-hidden="true" />
      <span id="resources" className="absolute top-[86%]" aria-hidden="true" />
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <HeroCanvas progress={progress} pointer={pointer} />
        </div>
        <h1 className="sr-only">Forkthis</h1>
      </div>
    </div>
  );
}
