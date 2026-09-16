"use client";

import { useState } from "react";
import Link from "next/link";
import { useSessionQuery } from "@/hooks/use-session";
import { useRepositories, useRepositoryIssues, usePointTransactions } from "@/hooks/use-dashboard";
import { apiErrorMessage } from "@/lib/api-client";
import Image from "next/image";

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

export default function DashboardPage() {
  const session = useSessionQuery();
  const enabled = Boolean(session.data?.user.githubId);
  const repositories = useRepositories(enabled, session.data?.user.id);
  const points = usePointTransactions(enabled, session.data?.user.id);
  const [expandedRepoId, setExpandedRepoId] = useState<string | null>(null);
  const issues = useRepositoryIssues(enabled ? expandedRepoId ?? "" : "", session.data?.user.id);

  const toggleRepoExpand = (id: string) => {
    setExpandedRepoId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start bg-black font-sans text-white overflow-x-hidden overflow-y-auto select-none">
      {/* Cockpit Bezel Outer Border Frame */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[3px] border-[#649627]/90 shadow-[inset_0_0_12px_rgba(100,150,39,0.3)]" />

      {/* Screen Canvas Container - Exact 143px left padding (from D of DASHBOARD) & 123px right padding (from Timer) */}
      <div className="relative flex flex-col items-start justify-start w-full min-h-screen pt-24 pl-6 pr-6 lg:pl-[143px] lg:pr-[123px] pb-20">

        {/* Background Glowing Particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full bg-[#464343] opacity-80 shadow-[0_0_4px_#464343]"
              style={{ top: p.top, left: p.left }}
            />
          ))}
        </div>

        {/* Header Title DASHBOARD (Letter 'D' sits exactly at 143px from left border) */}
        <div className="order-1 relative z-10 w-full flex flex-col items-start mt-2 sm:mt-4 mb-4 sm:mb-6 lg:order-none">
          <h1 className="text-[clamp(24px,7vw,42px)] sm:text-[42px] lg:text-[50px] font-extrabold tracking-[0.04em] lg:tracking-[0.1em] text-white font-[family-name:var(--font-title)] leading-none whitespace-nowrap">
            DASHBOARD
          </h1>
        </div>

        {session.isPending ? <p role="status">Loading account…</p> : null}
        {session.error ? <p role="alert">{apiErrorMessage(session.error)}</p> : null}
        {!session.isPending && !session.error && !session.data ? <Link href="/login" className="text-[#8FFE09]">Sign in to view your dashboard →</Link> : null}
        {session.data && !enabled ? <Link href="/auth/link-github" className="text-[#8FFE09]">Link GitHub to access repositories and points →</Link> : null}
        {/* Main Workspace Layout */}
        <div className="relative z-10 contents w-full lg:flex lg:flex-row lg:items-start lg:justify-start lg:gap-8">

          {/* Left Panel: Repositories Table Container (Aligned at 143px from left border) */}
          <div className="order-3 relative flex flex-col items-start w-full max-w-[568px] lg:order-1 lg:max-w-[680px] lg:w-[680px] min-h-[560px] rounded-2xl pt-6 pl-4 pr-4 pb-6 shrink-0 lg:pl-6 lg:pr-6 lg:shadow-[0_0_20px_rgba(0,0,0,0.8)] lg:backdrop-blur-sm">
            {/* Custom Sci-Fi Intersect Container SVG */}
            <svg
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-[calc(100%+110px)] h-full lg:block"
              viewBox="0 0 831 670"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 15,0 L 670,0 C 810,130 810,470 690,590 L 610,670 L 15,670 A 15,15 0 0 1 0,655 L 0,15 A 15,15 0 0 1 15,0 Z"
                fill="#9C9C9C"
                fillOpacity="0.2"
                stroke="#9C9C9C"
                strokeOpacity="0.2"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Table Header Pill */}
              <div className="relative z-10 flex w-full max-w-[568px] items-center justify-between bg-[#8CFF02]/20 rounded-[8px] h-[60px] px-4 text-sm font-normal tracking-[0.05em] text-white font-[family-name:var(--font-sixsound)] mb-5 shrink-0 lg:max-w-[505px] lg:h-[36px] lg:px-5 lg:text-sm">
              <span className="w-20 sm:w-24 shrink-0 text-left whitespace-nowrap">Sr No.</span>
              <span className="w-24 sm:w-32 shrink-0 text-left whitespace-nowrap">Repo Name</span>
              <span className="flex-1 text-center hidden sm:block whitespace-nowrap">TechStack</span>
              <span className="w-14 sm:w-16 shrink-0 text-right whitespace-nowrap">Issues</span>
            </div>

            {/* Repositories Rows List */}
            <div className="relative z-10 flex flex-col gap-5 w-full max-w-[568px] overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-[#649627]/40 lg:max-w-[505px] lg:gap-[6px]">
              {enabled && repositories.isPending ? <p role="status">Loading repositories…</p> : null}
              {repositories.error ? <p role="alert">{apiErrorMessage(repositories.error)}</p> : null}
              {repositories.data?.length === 0 ? <p>No active repositories yet.</p> : null}
              {enabled ? repositories.data?.map((repo, idx) => {
                const isExpanded = expandedRepoId === repo.id;
                return (
                  <div key={repo.id} className="flex flex-col w-full shrink-0">
                    {/* Main Row */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleRepoExpand(repo.id)}
                      className={`group relative flex items-center justify-between h-[60px] w-full px-4 bg-[#5E6458]/20 border ${
                        isExpanded
                          ? "border-[#8FFE09]"
                          : "border-transparent hover:border-[#8FFE09]/50"
                      } rounded-[14px] cursor-pointer transition-all duration-200 lg:h-[27px] lg:px-5 lg:rounded-[8px]`}
                    >
                      {/* Sr No. */}
                      <span className="w-20 sm:w-24 shrink-0 text-[10px] sm:text-xs font-medium text-white font-[family-name:var(--font-mono)] whitespace-nowrap">
                        {idx + 1}.
                      </span>

                      {/* Repo Name */}
                      <span className="w-24 sm:w-32 shrink-0 text-[10px] sm:text-xs font-medium text-white font-[family-name:var(--font-mono)] truncate group-hover:text-[#8FFE09] transition-colors whitespace-nowrap">
                        {repo.name}
                      </span>

                      {/* TechStack */}
                      <span className="flex-1 text-center text-xs font-medium text-white font-[family-name:var(--font-mono)] hidden sm:block truncate px-2 whitespace-nowrap">
                        {repo.techStack}
                      </span>

                      {/* Issues Count & Dropdown Arrow */}
                      <div className="w-14 sm:w-16 shrink-0 flex items-center justify-end gap-1.5 text-[10px] sm:text-xs font-medium text-white font-[family-name:var(--font-mono)] whitespace-nowrap">
                        <span>{repo.issueCount}</span>
                        <span
                          className={`inline-block transform transition-transform duration-200 text-white font-bold text-[10px] ${
                            isExpanded ? "rotate-90 text-[#8FFE09]" : "rotate-0"
                          }`}
                        >
                          v
                        </span>
                      </div>
                    </button>

                    {/* Accordion Issues Drawer */}
                    {isExpanded && (
                      <div className="flex flex-col w-full mt-1 p-2.5 bg-black/90 border border-[#8FFE09]/40 rounded-[8px] gap-1.5 text-[11px] font-[family-name:var(--font-mono)]">
                        <div className="text-[#8FFE09] font-semibold tracking-wider flex items-center justify-between border-b border-[#649627]/40 pb-1">
                          <span>AVAILABLE ISSUES ({repo.name}):</span>
                          <span className="text-[9px] text-white/70">
                            Stack: {repo.techStack}
                          </span>
                        </div>
                        {issues.isPending ? <p role="status">Loading issues…</p> : null}
                        {issues.error ? <p role="alert">{apiErrorMessage(issues.error)}</p> : null}
                        {issues.data?.issues.length === 0 ? <p>No issues in this repository.</p> : null}
                        {issues.data?.issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-[#8FFE09]/10 text-white/90 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 truncate mr-2">
                              <span className="text-[#8FFE09]">•</span>
                              <span className="truncate" title={issue.title}>#{issue.githubIssueNumber} {issue.title}</span>
                            </span>
                            <span className="mr-2 shrink-0 text-[9px] text-white/70">{issue.status} · {issue.difficulty} · {issue.points} pts</span>
                            <a href={`https://github.com/${repo.owner}/${repo.name}/issues/${issue.githubIssueNumber}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 text-[9px] uppercase font-bold text-black bg-[#8FFE09] rounded hover:bg-[#a5ff45] transition-colors shrink-0">
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }) : null}
            </div>
          </div>

          {/* Right Panel: Stats Cards & Countdown Timer (curving outward from the table) */}
          <div className="order-2 relative flex w-full flex-row flex-wrap items-center justify-center gap-6 pt-2 lg:order-2 lg:w-[410px] lg:flex-col lg:items-start lg:justify-start lg:-ml-[80px]">

            {/* Background Arc Curve SVG (mirrored to follow the outward layout) */}
            <svg
              className="pointer-events-none absolute -top-4 left-14 w-[280px] h-[640px] opacity-100 hidden lg:block"
              viewBox="0 0 220 640"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 40,0 C 110,213 110,427 40,640"
                stroke="#649627"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {points.error ? <p role="alert">{apiErrorMessage(points.error)}</p> : null}
            {enabled && points.isPending ? <p role="status">Loading points…</p> : null}
            {/* 1. Your Points Card (Aligned to right edge) */}
            <div className="order-2 relative flex flex-col items-center justify-center w-[230px] h-[92px] bg-black border-2 border-[#649627] p-6 shadow-[0_0_15px_rgba(100,150,39,0.25)] lg:order-none lg:ml-0 shrink-0">
              {/* 4 Acid Green Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[8px] border-r-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[8px] border-r-[8px] border-[#8FFE09]" />

              <span className="font-[family-name:var(--font-sixsound)] text-lg text-[#8FFE09] tracking-wider uppercase mb-0.5">
                Your Points
              </span>
              <span className="font-[family-name:var(--font-mono)] text-2xl font-medium text-[#8FFE09] tracking-wider">
                {points.data ? `${points.data.totalPoints}/${points.data.maxPoints}` : "—"}
              </span>
            </div>

            {/* 2. Central Sci-Fi Countdown Clock Timer (indented to follow the mirrored curve) */}
            <div className="order-1 relative flex basis-full flex-col items-center justify-center w-[350px] sm:w-[410px] h-[160px] my-2 lg:order-none lg:ml-[40px] lg:basis-auto shrink-0">
              {/* Sci-Fi Octagonal Outer Frame SVG with Top & Bottom Trapezoid Notches */}
              <svg
                className="pointer-events-none absolute inset-0 w-full h-full"
                viewBox="-34 -34 527 244"
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <radialGradient id="timer-display-gradient" cx="50%" cy="50%" r="72%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="65%" stopColor="#000000" />
                    <stop offset="100%" stopColor="#2E4612" />
                  </radialGradient>
                </defs>

                {/* Oversized black octagonal backing, exposed as a 20px outer rim */}
                <path
                  d="M 16,-18 L 162,-18 L 174,-30 L 285,-30 L 297,-18 L 443,-18 L 477,16 L 477,160 L 443,194 L 297,194 L 285,206 L 174,206 L 162,194 L 16,194 L -18,160 L -18,16 Z"
                  fill="#000000"
                />

                {/* Outer Chamfered Shell Path with Top/Bottom Tabs */}
                <path
                  d="M 40,12 L 180,12 L 192,0 L 267,0 L 279,12 L 419,12 L 447,40 L 447,136 L 419,164 L 279,164 L 267,176 L 192,176 L 180,164 L 40,164 L 12,136 L 12,40 Z"
                  fill="#000000"
                  stroke="#8FFE09"
                  strokeWidth="3.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Inner Chamfered Bezel Ring */}
                <path
                  d="M 54,26 L 188,26 L 198,16 L 261,16 L 271,26 L 405,26 L 433,54 L 433,122 L 405,150 L 271,150 L 261,160 L 198,160 L 188,150 L 54,150 L 26,122 L 26,54 Z"
                  fill="url(#timer-display-gradient)"
                  stroke="#649627"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Top Notch Inner Trapezoid Cutout Accent */}
                <polygon
                  points="202,3 257,3 251,10 208,10"
                  fill="#649627"
                  opacity="0.8"
                />

                {/* Bottom Notch Inner Trapezoid Cutout Accent */}
                <polygon
                  points="202,173 257,173 251,166 208,166"
                  fill="#649627"
                  opacity="0.8"
                />

                {/* Left Side Telemetry Block */}
                <rect x="14" y="68" width="10" height="40" rx="2" fill="#2e4612" />
                <rect x="15" y="74" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />
                <rect x="15" y="86" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />
                <rect x="15" y="98" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />

                {/* Right Side Telemetry Block */}
                <rect x="435" y="68" width="10" height="40" rx="2" fill="#2e4612" />
                <rect x="436" y="74" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />
                <rect x="436" y="86" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />
                <rect x="436" y="98" width="8" height="3" rx="1.5" fill="#8FFE09" opacity="0.4" />
              </svg>

              {/* Digital Stencil Readout */}
              <div className="relative z-10 font-[family-name:var(--font-mono)] text-sm sm:text-lg font-bold text-[#8FFE09] tracking-[2px]">
                Timer unavailable
              </div>
            </div>

            {/* 3. Issues Solved Card (Aligned to right edge) */}
            <div className="order-3 relative flex flex-col items-center justify-center w-[230px] h-[92px] bg-black border-2 border-[#649627] p-6 shadow-[0_0_15px_rgba(100,150,39,0.25)] lg:order-none lg:ml-0 shrink-0">
              {/* 4 Acid Green Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[8px] border-r-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[8px] border-r-[8px] border-[#8FFE09]" />

              <span className="font-[family-name:var(--font-sixsound)] text-lg text-[#8FFE09] tracking-wider uppercase mb-0.5">
                Issues Solved
              </span>
              <span className="font-[family-name:var(--font-mono)] text-xl sm:text-2xl font-medium text-[#8FFE09] tracking-wider">
                {points.data ? `${points.data.issuesSolved}/${points.data.totalIssues}` : "—"}
              </span>
            </div>

          </div>
        </div>

        {/* Floating Bottom Right "Report issue" Button */}
        <div className="fixed bottom-5 right-5 z-40 flex items-center">
          <a href="mailto:csi@vit.ac.in" className="relative flex items-center justify-center w-[88px] h-[48px] bg-[rgba(143,254,9,0.2)] border border-[rgba(143,254,9,0.4)] rounded-[8px] hover:bg-[rgba(143,254,9,0.35)] transition-all duration-200 shadow-[0_0_15px_rgba(143,254,9,0.25)]">
            <div className="flex flex-col text-left font-[family-name:var(--font-mono)] font-bold text-white text-[11px] leading-tight">
              <span>Report</span>
              <span>issue</span>
            </div>
            {/* Rocky mascot indicator */}
            <Image
              src="/images/rocky.png"
              alt="Rocky the turtle mascot"
              width={56}
              height={56}
              className="pointer-events-none absolute -right-5 -bottom-5 h-14 w-14 object-contain animate-bounce"
            />
            <span className="hidden">
              👾
            </span>
          </a>
        </div>

      </div>
    </div>
  );
}
