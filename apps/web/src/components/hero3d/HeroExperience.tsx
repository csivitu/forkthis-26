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
  const { playAlert, playWave, playClick } = useHeroAudio();

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

  const startFlight = useCallback(() => {
    const element = container.current;
    if (!element) return;
    const travel = element.offsetHeight - window.innerHeight;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(1, travel * 0.16),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <div
      ref={container}
      className="relative h-[850vh] w-full bg-[#070103] sm:h-[1100vh]"
      onPointerMove={(event) => {
        setPointer({
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1,
        });
      }}
    >
      <HeroHud onStartFlight={startFlight} />
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <HeroCanvas progress={progress} pointer={pointer} />
        </div>

        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
          style={{
            opacity: Math.max(0, 1 - progress / 0.12),
            transform: `translateY(${-progress * 140}px)`,
            pointerEvents: progress < 0.1 ? "auto" : "none",
          }}
        >
          <div className="flex flex-col items-center">
            <p className="mb-3 font-mono text-[10px] tracking-[0.42em] text-[#8ffe09] sm:text-xs">
              CSI PRESENTS // GITHUB WORKSHOP 2026
            </p>
            <h1 className="glow-acid font-display text-[clamp(5rem,17vw,16rem)] font-bold leading-[0.72] tracking-[-0.055em] text-white sm:text-[clamp(7rem,14vw,16rem)]">
              FORKTHIS
            </h1>
            <p className="mt-6 font-misc text-xs tracking-[0.28em] text-white/70 sm:text-sm">
              FORK. BUILD. COLLABORATE. SHIP.
            </p>
            <button
              type="button"
              onClick={() => {
                playClick();
                startFlight();
              }}
              className="mt-7 rounded-full bg-[#8ffe09] px-7 py-3 font-misc text-xs font-bold tracking-[0.18em] text-[#071100] shadow-[0_0_28px_rgb(143_254_9/50%)] transition-transform hover:scale-105"
            >
              ENTER THE COCKPIT
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-4 z-20 hidden items-center md:flex">
          <div className="h-40 w-px bg-white/10">
            <div
              className="w-px bg-[#8ffe09] shadow-[0_0_8px_#8ffe09]"
              style={{ height: `${Math.max(2, progress * 100)}%` }}
            />
          </div>
          <span className="ml-3 font-mono text-[9px] tracking-[0.25em] text-white/45 [writing-mode:vertical-rl]">
            FLIGHT VECTOR {Math.round(progress * 100).toString().padStart(3, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
