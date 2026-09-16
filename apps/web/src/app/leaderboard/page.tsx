"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { apiErrorMessage } from "@/lib/api-client";

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
  const [page, setPage] = useState(1);
  const leaderboard = useLeaderboard(page);
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-start bg-black font-sans text-white overflow-y-auto pt-16 pb-8 sm:pt-20 sm:pb-8 px-4 sm:px-0"
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
          className="page-heading z-10 w-full px-2 text-center font-[800] tracking-[0] sm:tracking-[0.18em] text-white mt-2 mb-6 sm:mb-10 whitespace-nowrap"
        >
          LEADERBOARD       </h1>

        {/* Sci-Fi Outer Green Frame Box: Reduced width (w-[90%]) ONLY on mobile (< sm) for black margin space */}
        <div className="relative flex flex-col items-center justify-start w-[96%] sm:w-full max-w-[1160px] min-h-[560px] sm:min-h-[720px] px-2 py-5 sm:px-8 sm:py-12 md:px-12 md:py-14 my-auto">
          {/* Sci-Fi Border SVG Frame with depressed middle sections on all 4 sides */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
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
            className="relative z-10 shrink-0 mb-4 sm:mb-7 flex w-full max-w-[960px] items-center justify-between px-2 sm:px-10 md:px-12 text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-[0.08em] sm:tracking-[0.2em] text-[#8FFE09] font-[family-name:var(--font-display)]"
          >
            <span className="w-[42px] sm:w-[70px] md:w-[110px] text-left">RANK</span>
            <span className="flex-1 text-center">USERNAME</span>
            <span className="w-[52px] sm:w-[70px] md:w-[110px] text-right">POINTS</span>
          </div>

          {/* Leaderboard Rows */}
          <div className="relative z-10 flex flex-col w-full max-w-[960px] gap-2 sm:gap-4">
            {leaderboard.isPending ? <p role="status">Loading rankings…</p> : null}
            {leaderboard.error ? <p role="alert">{apiErrorMessage(leaderboard.error)}</p> : null}
            {leaderboard.data?.length === 0 ? <p>No participants on this page yet.</p> : null}
            {leaderboard.data?.map((row) => (
              <div
                key={row.userId}
                className="group relative flex h-[46px] sm:h-[58px] md:h-[64px] lg:h-[72px] w-full items-center justify-between shrink-0"
              >
                {/* Row Octagonal Shape SVG Container */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 900 44"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 14,0 L 886,0 L 900,14 L 900,30 L 886,44 L 14,44 L 0,30 L 0,14 Z"
                    fill={row.rank === 1 ? "#16260a" : "#000000"}
                    stroke="#8FFE09"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className="transition-colors duration-200 group-hover:fill-[#649627]"
                  />
                </svg>

                {/* Row Content (Ranks 1 to 10, Username, Points in pure white #FFFFFF) */}
                <div
                  className="relative z-10 flex w-full items-center justify-between px-2 sm:px-10 md:px-12 text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-normal sm:tracking-wider text-white font-[family-name:var(--font-mono)]"
                >
                  <span className="w-[42px] sm:w-[70px] md:w-[110px] text-left">{row.rank}</span>
                  <span className="flex-1 text-center truncate px-1">{row.githubUsername ?? row.name ?? "Participant"}</span>
                  <span className="w-[52px] sm:w-[70px] md:w-[110px] text-right">{row.totalPoints}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-8 flex w-full max-w-[960px] items-center justify-between text-sm">
            <button type="button" className="cursor-pointer disabled:opacity-40" disabled={page === 1 || leaderboard.isFetching} onClick={() => setPage(page - 1)}>← Previous</button>
            <span>Page {page}</span>
            <button type="button" className="cursor-pointer disabled:opacity-40" disabled={leaderboard.isFetching || !leaderboard.data || leaderboard.data.length < 25} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
