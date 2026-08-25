"use client";

import { useHeroAudio } from "./HeroAudio";

interface HeroHudProps {
  onStartFlight: () => void;
}

function SignalBars({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[7, 13, 9].map((height, index) => (
        <span
          key={height}
          className={`w-0.5 bg-[#8ffe09] ${active ? "animate-pulse" : "opacity-35"}`}
          style={{ height, animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
  );
}

export function HeroHud({ onStartFlight }: HeroHudProps) {
  const { isMuted, toggleSound, playHover, playClick } = useHeroAudio();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-2 z-50 px-3 md:top-3 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playClick();
            toggleSound();
          }}
          onMouseEnter={playHover}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d12]/90 px-3 py-1.5 font-misc text-[10px] tracking-wider text-white/80 backdrop-blur-md transition-colors hover:border-[#8ffe09]/60 hover:text-white sm:text-xs"
          aria-label={isMuted ? "Enable cockpit sound" : "Mute cockpit sound"}
        >
          <SignalBars active={!isMuted} />
          <span className="hidden sm:inline">SOUND: {isMuted ? "OFF" : "ON"}</span>
        </button>

        <div className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0d0d12]/90 px-4 py-1.5 shadow-2xl backdrop-blur-md sm:px-6">
          <span className="flex size-5 items-center justify-center rounded bg-[#8ffe09] font-display text-base font-bold text-[#071100] shadow-[0_0_12px_#8ffe09]">
            F
          </span>
          <span className="font-display text-lg font-bold tracking-wider text-white">
            FORKTHIS
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick();
            onStartFlight();
          }}
          onMouseEnter={playHover}
          className="pointer-events-auto rounded-full bg-[#8ffe09] px-3 py-1.5 font-misc text-[10px] font-bold tracking-wider text-[#071100] shadow-[0_0_15px_rgb(143_254_9/50%)] transition-all hover:scale-[1.03] hover:bg-[#a5ff45] hover:shadow-[0_0_25px_rgb(143_254_9/80%)] active:scale-95 sm:px-5 sm:text-xs"
        >
          START FLIGHT
        </button>
      </div>
    </header>
  );
}
