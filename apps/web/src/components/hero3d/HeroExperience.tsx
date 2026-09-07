"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HeroHud } from "./HeroHud";
import { useHeroAudio } from "./HeroAudio";
import type { PointerPosition } from "./scene/types";

const INITIAL_POINTER: PointerPosition = { x: 0, y: 0 };
type CalloutStyle = CSSProperties & {
  "--callout-reveal": number;
};

type AboutStyle = CSSProperties & {
  "--about-opacity": number;
  "--about-shift": string;
};

function HeroAboutCallouts({ progress }: { progress: number }) {
  const phase = Math.max(0, Math.min(1, (progress - 0.1) / 0.3));
  const opacity = Math.max(0, Math.min(1, phase / 0.14, (1 - phase) / 0.18));
  const firstReveal = Math.max(0, Math.min(1, phase / 0.54));
  const secondReveal = Math.max(0, Math.min(1, (phase - 0.24) / 0.54));

  return (
    <section
      className="hero-about"
      style={
        {
          "--about-opacity": opacity,
          "--about-shift": `${(1 - phase) * 28 - Math.max(0, phase - 0.8) * 70}px`,
        } as AboutStyle
      }
      aria-label="About Forkthis"
      aria-hidden={opacity < 0.01}
    >
      <h2 className="sr-only">About Forkthis</h2>
      <div
        className="hero-about__callout hero-about__callout--primary"
        style={{ "--callout-reveal": firstReveal } as CalloutStyle}
      >
        <div className="hero-about__card hero-about__card--primary">
          <p>
            Forkthis bridges the gap between learning and real-world application. Join our
            collaborative environment to tackle real projects, contribute to open-source, and build
            a standout portfolio.
          </p>
        </div>
        <svg viewBox="0 0 532 112" fill="none" aria-hidden="true">
          <defs>
            <marker
              id="about-arrow-primary"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path className="hero-about__arrowhead" d="M0 0L8 4L0 8Z" />
            </marker>
          </defs>
          <path
            className="hero-about__connector"
            pathLength="1"
            d="M522 97L412 58H334"
            markerEnd="url(#about-arrow-primary)"
          />
          <circle cx="522" cy="97" r="9" />
        </svg>
      </div>

      <div
        className="hero-about__callout hero-about__callout--schedule"
        style={{ "--callout-reveal": secondReveal } as CalloutStyle}
      >
        <div className="hero-about__card hero-about__card--schedule">
          <p>
            19th September: Git-Github Offline Workshop
            <br />
            20-21st September: Online Open Source Competition
          </p>
        </div>
        <svg viewBox="0 0 491 100" fill="none" aria-hidden="true">
          <defs>
            <marker
              id="about-arrow-schedule"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path className="hero-about__arrowhead" d="M0 0L8 4L0 8Z" />
            </marker>
          </defs>
          <path
            className="hero-about__connector"
            pathLength="1"
            d="M10 10L78 49H197"
            markerEnd="url(#about-arrow-schedule)"
          />
          <circle cx="10" cy="10" r="9" />
        </svg>
      </div>
    </section>
  );
}

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
        <HeroAboutCallouts progress={progress} />
        <h1 className="sr-only">Forkthis</h1>
      </div>
    </div>
  );
}
