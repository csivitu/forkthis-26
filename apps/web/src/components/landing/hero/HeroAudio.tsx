"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface HeroAudioValue {
  isMuted: boolean;
  toggleSound: () => void;
  playHover: () => void;
  playClick: () => void;
  playAlert: () => void;
  playWave: () => void;
}

const EFFECTS = [
  "/audio/hover-1.webm",
  "/audio/hover-2.webm",
  "/audio/hover-3.webm",
  "/audio/hover-4.webm",
  "/audio/cleared.webm",
  "/audio/alert-open.webm",
  "/audio/alert-entrance.webm",
  "/audio/wave.webm",
] as const;

const HeroAudioContext = createContext<HeroAudioValue | null>(null);

export function HeroAudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const ambience = useRef<HTMLAudioElement | null>(null);
  const cache = useRef(new Map<string, HTMLAudioElement>());

  useEffect(() => {
    const audioCache = cache.current;
    const background = new Audio("/audio/hero-ambient.webm");
    background.loop = true;
    background.volume = 0.35;
    ambience.current = background;

    EFFECTS.forEach((url) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audioCache.set(url, audio);
    });

    const registerInteraction = () => setHasInteracted(true);
    window.addEventListener("pointerdown", registerInteraction, { once: true });
    window.addEventListener("keydown", registerInteraction, { once: true });

    return () => {
      background.pause();
      background.src = "";
      audioCache.forEach((audio) => {
        audio.src = "";
      });
      audioCache.clear();
      window.removeEventListener("pointerdown", registerInteraction);
      window.removeEventListener("keydown", registerInteraction);
    };
  }, []);

  useEffect(() => {
    const background = ambience.current;
    if (!background) return;
    if (!isMuted && hasInteracted) void background.play().catch(() => undefined);
    else background.pause();
  }, [hasInteracted, isMuted]);

  const toggleSound = useCallback(() => {
    setIsMuted((muted) => !muted);
    setHasInteracted(true);
  }, []);

  const playEffect = useCallback(
    (urls: readonly string[], volume: number) => {
      if (isMuted) return;
      const url = urls[Math.floor(Math.random() * urls.length)];
      const source = url ? cache.current.get(url) : undefined;
      if (!source) return;
      const audio = source.cloneNode() as HTMLAudioElement;
      audio.volume = volume;
      void audio.play().catch(() => undefined);
    },
    [isMuted],
  );

  const playHover = useCallback(
    () => playEffect(EFFECTS.slice(0, 4), 0.25),
    [playEffect],
  );
  const playClick = useCallback(
    () => playEffect(["/audio/cleared.webm"], 0.4),
    [playEffect],
  );
  const playAlert = useCallback(
    () => playEffect(["/audio/alert-open.webm", "/audio/alert-entrance.webm"], 0.5),
    [playEffect],
  );
  const playWave = useCallback(
    () => playEffect(["/audio/wave.webm"], 0.4),
    [playEffect],
  );

  return (
    <HeroAudioContext.Provider
      value={{ isMuted, toggleSound, playHover, playClick, playAlert, playWave }}
    >
      {children}
    </HeroAudioContext.Provider>
  );
}

export function useHeroAudio() {
  const audio = useContext(HeroAudioContext);
  if (!audio) throw new Error("useHeroAudio must be used inside HeroAudioProvider");
  return audio;
}
