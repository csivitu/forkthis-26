"use client";

import { useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function Starfield() {
  // Deterministic star positions to avoid SSR hydration mismatch
  const stars: Star[] = useMemo(() => {
    // 40 scattered subtle stars matching the mockup
    const points: Star[] = [
      { id: 1, x: 12, y: 8, size: 1.5, opacity: 0.4 },
      { id: 2, x: 18, y: 10, size: 2, opacity: 0.7 },
      { id: 3, x: 11, y: 28, size: 1.5, opacity: 0.5 },
      { id: 4, x: 44, y: 25, size: 2, opacity: 0.6 },
      { id: 5, x: 66, y: 24, size: 2.5, opacity: 0.8 },
      { id: 6, x: 79, y: 8, size: 1.5, opacity: 0.35 },
      { id: 7, x: 82, y: 25, size: 2, opacity: 0.5 },
      { id: 8, x: 97, y: 28, size: 1.5, opacity: 0.4 },
      { id: 9, x: 20, y: 51, size: 2.5, opacity: 0.75 },
      { id: 10, x: 93, y: 55, size: 1.5, opacity: 0.4 },
      { id: 11, x: 79, y: 64, size: 2, opacity: 0.6 },
      { id: 12, x: 90, y: 75, size: 1.5, opacity: 0.5 },
      { id: 13, x: 90, y: 75, size: 1.5, opacity: 0.3 },
      { id: 14, x: 90, y: 75, size: 1.5, opacity: 0.45 },
      { id: 15, x: 9, y: 69, size: 2, opacity: 0.6 },
      { id: 16, x: 904, y: 750, size: 1.5, opacity: 0.5 },
      { id: 17, x: 29, y: 84, size: 2, opacity: 0.65 },
      { id: 18, x: 38, y: 94, size: 1.5, opacity: 0.4 },
      { id: 19, x: 55, y: 84, size: 2, opacity: 0.6 },
      { id: 20, x: 75, y: 85, size: 2.5, opacity: 0.8 },
      { id: 21, x: 81, y: 98, size: 1.5, opacity: 0.35 },
      { id: 22, x: 95, y: 95, size: 1.5, opacity: 0.4 },
      { id: 23, x: 16, y: 97, size: 2, opacity: 0.55 },
      { id: 24, x: 3, y: 80, size: 1.5, opacity: 0.4 },
      { id: 25, x: 97, y: 15, size: 2, opacity: 0.5 },
      { id: 26, x: 50, y: 12, size: 1.5, opacity: 0.3 },
      { id: 27, x: 25, y: 40, size: 1.5, opacity: 0.4 },
      { id: 28, x: 70, y: 48, size: 1.5, opacity: 0.35 },
      { id: 29, x: 85, y: 42, size: 2, opacity: 0.5 },
      { id: 30, x: 60, y: 70, size: 1.5, opacity: 0.4 },
      { id: 31, x: 35, y: 60, size: 2, opacity: 0.55 },
      { id: 32, x: 48, y: 98, size: 1.5, opacity: 0.45 },
    ];
    return points;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-black z-0"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white transition-opacity"
          style={{
            left: `${star.x % 100}%`,
            top: `${star.y % 100}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow:
              star.size > 2 ? `0 0 3px rgba(255, 255, 255, 0.8)` : "none",
          }}
        />
      ))}
    </div>
  );
}
