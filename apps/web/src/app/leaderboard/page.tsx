import React from "react";
import { Orbitron, JetBrains_Mono } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-orbitron",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
}

const leaderboardData: LeaderboardEntry[] = Array.from(
  { length: 10 },
  (_, i): LeaderboardEntry => ({
    rank: i + 1,
    username: "username1",
    points: 2450,
  })
);

// Faint background particles matching design screenshot
const PARTICLES = [
  { top: "4%", left: "18%" },
  { top: "3%", left: "79%" },
  { top: "19%", left: "66%" },
  { top: "24%", left: "97%" },
  { top: "23%", left: "11%" },
  { top: "20%", left: "44%" },
  { top: "51%", left: "86%" },
  { top: "61%", left: "73%" },
  { top: "73%", left: "84%" },
  { top: "83%", left: "68%" },
  { top: "94%", left: "16%" },
  { top: "98%", left: "81%" },
];

export default function LeaderboardPage() {
  return (
    <div
      className={`${orbitron.variable} ${jetbrainsMono.variable} flex min-h-screen w-full flex-col items-center justify-start bg-black font-sans text-white overflow-y-auto py-4 sm:py-8 px-4 sm:px-0`}
    >
      {/* Screen Container */}
      <div className="relative flex flex-col items-center justify-start w-full max-w-[1360px] pb-10 sm:pb-16 select-none">
        {/* Background glowing particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full bg-[#8FFE09] opacity-75 shadow-[0_0_6px_#8FFE09]"
              style={{ top: p.top, left: p.left }}
            />
          ))}
        </div>

        {/* LEΔDERBOΔRD Header Title */}
        <h1
          className="z-10 text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-[800] tracking-[0.18em] text-white mt-2 mb-4 sm:mt-4 sm:mb-8"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          LE<span className="inline-block text-white">Δ</span>DERBO<span className="inline-block text-white">Δ</span>RD
        </h1>

        {/* Sci-Fi Outer Green Frame Box: Reduced width (w-[90%]) ONLY on mobile (< sm) for black margin space */}
        <div className="relative flex flex-col items-center justify-start w-[90%] sm:w-full max-w-[1080px] min-h-[500px] sm:min-h-[640px] px-2 py-5 sm:px-8 sm:py-10 md:px-12 md:py-12 my-auto">
          {/* Sci-Fi Border SVG Frame with depressed middle sections on all 4 sides */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1140 760"
            preserveAspectRatio="none"
          >
            <path
              d="M 32,0 L 200,0 L 212,12 L 928,12 L 940,0 L 1108,0 L 1140,32 L 1140,150 L 1128,162 L 1128,598 L 1140,610 L 1140,728 L 1108,760 L 940,760 L 928,748 L 212,748 L 200,760 L 32,760 L 0,728 L 0,610 L 12,598 L 12,162 L 0,150 L 0,32 Z"
              fill="none"
              stroke="#8FFE09"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Column Headers */}
          <div
            className="relative z-10 shrink-0 mb-3 sm:mb-6 flex w-full max-w-[880px] items-center justify-between px-3 sm:px-10 md:px-12 text-[11px] sm:text-sm md:text-base font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#8FFE09]"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <span className="w-[36px] sm:w-[60px] md:w-[100px] text-left">RANK</span>
            <span className="flex-1 text-center">USERNAME</span>
            <span className="w-[44px] sm:w-[60px] md:w-[100px] text-right">POINTS</span>
          </div>

          {/* Leaderboard Rows */}
          <div className="relative z-10 flex flex-col w-full max-w-[880px] gap-2 sm:gap-3">
            {leaderboardData.map((row, idx) => (
              <div
                key={idx}
                className="group relative flex h-[34px] sm:h-[42px] md:h-[48px] w-full items-center justify-between shrink-0 cursor-pointer"
              >
                {/* Row Octagonal Shape SVG Container */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 900 44"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 14,0 L 886,0 L 900,14 L 900,30 L 886,44 L 14,44 L 0,30 L 0,14 Z"
                    fill={idx === 0 ? "#16260a" : "#000000"}
                    stroke="#8FFE09"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className="transition-colors duration-200 group-hover:fill-[#649627]"
                  />
                </svg>

                {/* Row Content (Ranks 1 to 10, Username, Points in pure white #FFFFFF) */}
                <div
                  className="relative z-10 flex w-full items-center justify-between px-3 sm:px-10 md:px-12 text-xs sm:text-sm md:text-base font-bold tracking-wider text-white"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="w-[36px] sm:w-[60px] md:w-[100px] text-left">{row.rank}</span>
                  <span className="flex-1 text-center truncate px-1">{row.username}</span>
                  <span className="w-[44px] sm:w-[60px] md:w-[100px] text-right">{row.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}