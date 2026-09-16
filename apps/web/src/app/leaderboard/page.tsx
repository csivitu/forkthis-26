"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { apiErrorMessage } from "@/lib/api-client";

const LEADERBOARD_PAGE_SIZE = 10;
const PARTICLES = [
  { id: "a", top: "4%", left: "18%" },
  { id: "b", top: "3%", left: "79%" },
  { id: "c", top: "19%", left: "66%" },
  { id: "d", top: "24%", left: "97%" },
  { id: "e", top: "23%", left: "11%" },
  { id: "f", top: "20%", left: "44%" },
  { id: "g", top: "51%", left: "86%" },
  { id: "h", top: "61%", left: "73%" },
  { id: "i", top: "73%", left: "84%" },
  { id: "j", top: "83%", left: "68%" },
  { id: "k", top: "94%", left: "16%" },
  { id: "l", top: "98%", left: "81%" },
];

export default function LeaderboardPage() {
  const [page, setPage] = useState(1);
  const leaderboard = useLeaderboard(page, LEADERBOARD_PAGE_SIZE);
  const rows = leaderboard.data ?? [];

  return (
    <main className="relative flex h-dvh w-full flex-col items-center overflow-hidden bg-black px-[3vw] pb-[2dvh] pt-[clamp(4.5rem,10dvh,6rem)] text-white">
      <div className="relative flex h-full min-h-0 w-full max-w-[85rem] flex-col items-center select-none">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {PARTICLES.map((particle) => (
            <span
              key={particle.id}
              className="absolute size-[0.1875rem] rounded-full bg-[#8FFE09]/70 shadow-[0_0_0.375rem_#8FFE09]"
              style={{ top: particle.top, left: particle.left }}
            />
          ))}
        </div>

        <h1 className="page-heading relative z-10 mb-[clamp(0.75rem,2.5dvh,2rem)] mt-[1dvh] w-full whitespace-nowrap px-[2vw] text-center text-[clamp(1.75rem,8vw,3rem)] font-extrabold tracking-[clamp(0,0.4vw,0.18em)]">
          Leaderboard
        </h1>

        <section
          className="relative flex min-h-0 w-[92%] max-w-[67.5rem] flex-1 flex-col items-center px-[clamp(0.5rem,4vw,3rem)] py-[clamp(1.25rem,4dvh,3rem)]"
          aria-label="Leaderboard rankings"
        >
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 1140 760"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M32 0H200L212 12H928L940 0H1108L1140 32V150L1128 162V598L1140 610V728L1108 760H940L928 748H212L200 760H32L0 728V610L12 598V162L0 150V32Z"
              fill="none"
              stroke="#8FFE09"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative z-10 mb-[clamp(0.5rem,1.5dvh,1.5rem)] flex w-full max-w-[55rem] shrink-0 items-center justify-between px-[clamp(0.75rem,4vw,3rem)] font-[family-name:var(--font-sixsound)] text-[clamp(0.72rem,2.4vw,1rem)] font-bold uppercase tracking-[clamp(0.08em,0.5vw,0.2em)] text-[#8FFE09]">
            <span className="w-[18%] text-left">Rank</span>
            <span className="min-w-0 flex-1 text-center">Username</span>
            <span className="w-[18%] text-right">Points</span>
          </div>

          <div
            className="relative z-10 grid min-h-0 w-full max-w-[55rem] flex-1 gap-[clamp(0.2rem,0.7dvh,0.75rem)]"
            style={{ gridTemplateRows: `repeat(${Math.max(rows.length, 1)}, minmax(0, 1fr))` }}
          >
            {leaderboard.isPending ? <p className="self-center text-center" role="status">Loading rankings…</p> : null}
            {leaderboard.error ? <p className="self-center text-center text-red-300" role="alert">{apiErrorMessage(leaderboard.error)}</p> : null}
            {!leaderboard.isPending && !leaderboard.error && rows.length === 0 ? <p className="self-center text-center">No participants on this page yet.</p> : null}
            {rows.map((row) => (
              <div key={row.userId} className="group relative flex min-h-0 w-full items-center">
                <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 900 44" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M14 0H886L900 14V30L886 44H14L0 30V14Z"
                    fill={row.rank === 1 ? "#16260a" : "#000000"}
                    stroke="#8FFE09"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className="transition-colors duration-200 group-hover:fill-[#203b0b]"
                  />
                </svg>
                <div className="relative z-10 flex min-w-0 w-full items-center justify-between px-[clamp(0.75rem,4vw,3rem)] font-[family-name:var(--font-mono)] text-[clamp(0.7rem,2.5vw,1rem)] font-bold tracking-[clamp(0,0.25vw,0.08em)]">
                  <span className="w-[18%] text-left tabular-nums">{row.rank}</span>
                  <span className="min-w-0 flex-1 truncate px-1 text-center" title={row.githubUsername ?? row.name ?? "Participant"}>{row.githubUsername ?? row.name ?? "Participant"}</span>
                  <span className="w-[18%] text-right tabular-nums">{row.totalPoints.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <nav className="relative z-10 mt-[clamp(0.4rem,1dvh,0.75rem)] flex shrink-0 items-center gap-3 font-[family-name:var(--font-mono)] text-[clamp(0.6rem,1.8vw,0.75rem)]" aria-label="Leaderboard pages">
            <button type="button" disabled={page === 1 || leaderboard.isFetching} onClick={() => setPage((currentPage) => currentPage - 1)} className="text-[#8FFE09] disabled:opacity-30">← Previous</button>
            <span aria-live="polite">Page {page}</span>
            <button type="button" disabled={leaderboard.isFetching || rows.length < LEADERBOARD_PAGE_SIZE} onClick={() => setPage((currentPage) => currentPage + 1)} className="text-[#8FFE09] disabled:opacity-30">Next →</button>
          </nav>
        </section>
      </div>
    </main>
  );
}
