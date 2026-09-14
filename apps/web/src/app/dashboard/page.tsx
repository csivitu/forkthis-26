"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/landing/navigation/SiteHeader";

export interface RepoItem {
  id: number;
  name: string;
  techStack: string;
  issuesCount: number;
  issuesList: string[];
}

const REPOSITORIES: RepoItem[] = [
  {
    id: 1,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Buffer overflow in auth middleware #12",
      "Optimize DB queries in analytics endpoint #19",
      "Memory leak during heavy payload processing #24",
      "Fix CORS preflight handling for webhooks #31",
      "Add unit tests for async queue worker #45",
    ],
  },
  {
    id: 2,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Hydration mismatch on dynamic theme toggle #04",
      "Optimize image loading layout shifts #08",
      "Fix state desync in real-time leaderboard #15",
      "Memory corruption in WASM bridge #18",
      "Add rate limiting to API endpoints #22",
    ],
  },
  {
    id: 3,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Instruction data serialization overflow #11",
      "Account validation CPI vulnerability #18",
      "Optimize compute unit usage in swap loop #29",
      "Fix deadlock in concurrent message queue #34",
      "Add integration tests for token transfer #41",
    ],
  },
  {
    id: 4,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "GossipSub peer routing table desync #07",
      "Stream handler deadlock under high throughput #14",
      "Fix connection leak on peer disconnect #19",
      "Add ping/pong keepalive to WebSocket server #25",
      "Optimize payload framing for gRPC streams #32",
    ],
  },
  {
    id: 5,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Syscall hook race condition in ring buffer #03",
      "Kernel map memory allocation failure #10",
      "Fix packet filter drop logic for TCP SYN #21",
      "Verifier rejection on multi-array access #33",
      "Add BPF CO-RE support for legacy kernels #40",
    ],
  },
  {
    id: 6,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Tensor shape mismatch during gradient backward pass #09",
      "CUDA out-of-memory error during batch training #15",
      "Fix data loader worker process stall #21",
      "Add checkpoint auto-save on interruption #28",
      "Optimize fp16 mixed precision matrix multiplication #35",
    ],
  },
  {
    id: 7,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Constraint under-specification in merkle verifier #05",
      "Prover key generation out of memory #13",
      "Public input hash truncation vulnerability #22",
      "Optimize groth16 verification gas cost #36",
      "Fix recursive proof composition stack overflow #44",
    ],
  },
  {
    id: 8,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Reentrancy flaw in vault withdraw function #01",
      "Oracle price manipulation vulnerability #16",
      "Delegatecall storage collision bug #27",
      "Fix integer overflow in reward calculation #33",
      "Add emergency pause mechanism to liquidity pool #39",
    ],
  },
  {
    id: 9,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Redis cluster connection pool leak #17",
      "Background worker rate limiter race condition #25",
      "Fix session cookie expiration timezone offset #29",
      "Optimize Docker multi-stage build image size #34",
      "Add health check endpoint for container orchestrator #42",
    ],
  },
  {
    id: 10,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Absinthe subscription socket disconnect #06",
      "Ecto query N+1 preloader inefficiency #20",
      "GenServer state corruption recovery bug #30",
      "Fix Phoenix channel broadcast latency spike #37",
      "Add telemetry supervisor metrics collector #43",
    ],
  },
  {
    id: 11,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Fix memory leak in background worker queue #12",
      "Optimize database index for audit logging #18",
      "Add OAuth2 refresh token rotation #26",
      "Fix race condition in distributed lock manager #31",
      "Add rate limiting headers to public API gateway #38",
    ],
  },
  {
    id: 12,
    name: "Repo1",
    techStack: "Flask,Django,Python",
    issuesCount: 5,
    issuesList: [
      "Fix CORS headers for embedded iframe widget #08",
      "Optimize JSON serialization speed #14",
      "Add TLS 1.3 enforcement to backend proxy #23",
      "Fix cache invalidation bug on user profile update #29",
      "Add automated database migration rollback script #35",
    ],
  },
];

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
  const [expandedRepoId, setExpandedRepoId] = useState<number | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Live timer countdown state: 11h 59m 50s = 43190s
  const [timeLeft, setTimeLeft] = useState<number>(43190);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isReportDialogOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsReportDialogOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isReportDialogOpen]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRepoExpand = (id: number) => {
    setExpandedRepoId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start bg-black font-sans text-white overflow-x-hidden overflow-y-auto select-none">
      <SiteHeader forceTimeline />

      {/* Cockpit Bezel Outer Border Frame */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[3px] border-[#649627]/90 shadow-[inset_0_0_12px_rgba(100,150,39,0.3)]" />

      {/* Screen Canvas Container - Exact 143px left padding (from D of DASHBOARD) & 123px right padding (from Timer) */}
      <div className="relative flex flex-col items-start justify-start w-full min-h-screen pt-20 pb-20 pl-6 pr-6 lg:pt-24 lg:pl-[143px] lg:pr-[123px]">
        
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
        <div className="order-1 relative z-10 -ml-5 w-[calc(100vw-8px)] max-w-none flex flex-col items-center mt-2 sm:mt-4 mb-10 sm:mb-12 lg:order-none lg:ml-0 lg:w-full lg:items-start">
          <h1 className="w-full max-w-full overflow-visible text-center text-[clamp(19px,7.5vw,48px)] sm:text-[48px] lg:text-left lg:text-[56px] font-extrabold tracking-[0] sm:tracking-[0.04em] lg:tracking-[0.1em] text-white font-[family-name:var(--font-title)] leading-none whitespace-nowrap">
            DASHBOARD
          </h1>
        </div>

        {/* Main Workspace Layout */}
        <div className="relative z-10 contents w-full lg:flex lg:flex-row lg:items-start lg:justify-start lg:gap-8">
          
          {/* Left Panel: Repositories Table Container (Aligned at 143px from left border) */}
          <div className="order-3 relative flex flex-col items-start w-full max-w-[568px] lg:order-1 lg:max-w-[680px] lg:w-[680px] min-h-[620px] rounded-2xl pt-7 pl-4 pr-4 pb-7 shrink-0 lg:pl-7 lg:pr-7 lg:min-h-[700px] lg:shadow-[0_0_20px_rgba(0,0,0,0.8)] lg:backdrop-blur-sm">
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
              <div className="relative z-10 flex w-full max-w-[568px] items-center justify-between bg-[#8CFF02]/20 rounded-[8px] h-[72px] px-4 text-lg font-normal tracking-[0.05em] text-white font-[family-name:var(--font-sixsound)] mb-6 shrink-0 lg:max-w-[505px] lg:h-[52px] lg:px-5 lg:text-xl">
              <span className="w-20 sm:w-24 shrink-0 text-left whitespace-nowrap">Sr No.</span>
              <span className="w-24 shrink-0 text-left whitespace-nowrap sm:hidden">Repo</span>
              <span className="hidden w-32 shrink-0 text-left whitespace-nowrap sm:block">Repo Name</span>
              <span className="flex-1 text-center hidden sm:block whitespace-nowrap">TechStack</span>
              <span className="w-14 sm:w-16 shrink-0 text-right whitespace-nowrap">Issues</span>
            </div>

            {/* Repositories Rows List */}
            <div className="relative z-10 flex flex-col gap-5 w-full max-w-[568px] overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-[#649627]/40 lg:max-w-[505px] lg:gap-2">
              {REPOSITORIES.map((repo, idx) => {
                const isExpanded = expandedRepoId === repo.id;
                return (
                  <div key={repo.id} className="flex flex-col w-full shrink-0">
                    {/* Main Row */}
                    <div
                      onClick={() => toggleRepoExpand(repo.id)}
                      className={`group relative flex items-center justify-between h-[72px] w-full px-4 bg-[#5E6458]/20 border ${
                        isExpanded
                          ? "border-[#8FFE09]"
                          : "border-transparent hover:border-[#8FFE09]/50"
                      } rounded-[14px] cursor-pointer transition-all duration-200 lg:h-[46px] lg:px-5 lg:rounded-[8px]`}
                    >
                      {/* Sr No. */}
                      <span className="w-20 sm:w-24 shrink-0 text-sm sm:text-base font-medium text-white font-[family-name:var(--font-mono)] whitespace-nowrap">
                        {idx + 1}.
                      </span>

                      {/* Repo Name */}
                      <span className="w-24 sm:w-32 shrink-0 text-sm sm:text-base font-medium text-white font-[family-name:var(--font-mono)] truncate group-hover:text-[#8FFE09] transition-colors whitespace-nowrap">
                        {repo.name}
                      </span>

                      {/* TechStack */}
                      <span className="flex-1 text-center text-base font-medium text-white font-[family-name:var(--font-mono)] hidden sm:block truncate px-2 whitespace-nowrap">
                        {repo.techStack}
                      </span>

                      {/* Issues Count & Dropdown Arrow */}
                      <div className="w-14 sm:w-16 shrink-0 flex items-center justify-end gap-1.5 text-sm sm:text-base font-medium text-white font-[family-name:var(--font-mono)] whitespace-nowrap">
                        <span>{repo.issuesCount}</span>
                        <span
                          className={`inline-block transform transition-transform duration-200 text-white font-bold text-[10px] ${
                            isExpanded ? "rotate-90 text-[#8FFE09]" : "rotate-0"
                          }`}
                        >
                          v
                        </span>
                      </div>
                    </div>

                    {/* Accordion Issues Drawer */}
                    {isExpanded && (
                      <div className="flex flex-col w-full mt-1 p-3 bg-black/90 border border-[#8FFE09]/40 rounded-[8px] gap-2 text-xs font-[family-name:var(--font-mono)]">
                        <div className="text-[#8FFE09] font-semibold tracking-wider flex items-center justify-between border-b border-[#649627]/40 pb-1">
                          <span>AVAILABLE ISSUES ({repo.name}):</span>
                          <span className="text-[10px] text-white/70">
                            Stack: {repo.techStack}
                          </span>
                        </div>
                        {repo.issuesList.map((issue, iIndex) => (
                          <div
                            key={iIndex}
                            className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#8FFE09]/10 text-white/90 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 truncate mr-2">
                              <span className="text-[#8FFE09]">•</span>
                              <span className="truncate">{issue}</span>
                            </span>
                            <button className="px-2 py-1 text-[10px] uppercase font-bold text-black bg-[#8FFE09] rounded hover:bg-[#a5ff45] transition-colors shrink-0">
                              Claim
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Stats Cards & Countdown Timer (curving outward from the table) */}
          <div className="order-2 relative flex w-full flex-row flex-wrap items-center justify-center gap-6 pt-2 lg:order-2 lg:w-[410px] lg:flex-col lg:items-start lg:justify-start lg:-ml-[80px]">
            
            {/* 1. Your Points Card (Aligned to right edge) */}
            <div className="order-2 relative flex flex-col items-center justify-center w-[250px] h-[108px] bg-black border-2 border-[#649627] p-6 shadow-[0_0_15px_rgba(100,150,39,0.25)] lg:order-none lg:ml-0 shrink-0">
              {/* 4 Acid Green Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[8px] border-r-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[8px] border-r-[8px] border-[#8FFE09]" />

              <span className="font-[family-name:var(--font-sixsound)] text-lg text-[#8FFE09] tracking-wider uppercase mb-0.5">
                Your Points
              </span>
              <span className="font-[family-name:var(--font-mono)] text-3xl font-medium text-[#8FFE09] tracking-wider">
                280/300
              </span>
            </div>

            {/* 2. Central Sci-Fi Countdown Clock Timer (indented to follow the mirrored curve) */}
            <div className="order-1 relative flex basis-full flex-col items-center justify-center w-[min(100%,430px)] sm:w-[430px] h-[180px] my-2 lg:order-none lg:ml-[40px] lg:basis-auto shrink-0">
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
              <div className="relative z-10 font-[family-name:var(--font-mono)] text-[clamp(2.5rem,9vw,4rem)] sm:text-[62px] font-bold text-[#8FFE09] tracking-[2px]">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* 3. Issues Solved Card (Aligned to right edge) */}
            <div className="order-3 relative flex flex-col items-center justify-center w-[250px] h-[108px] bg-black border-2 border-[#649627] p-6 shadow-[0_0_15px_rgba(100,150,39,0.25)] lg:order-none lg:ml-0 shrink-0">
              {/* 4 Acid Green Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[8px] border-r-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[8px] border-l-[8px] border-[#8FFE09]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[8px] border-r-[8px] border-[#8FFE09]" />

              <span className="font-[family-name:var(--font-sixsound)] text-lg text-[#8FFE09] tracking-wider uppercase mb-0.5">
                Issues Solved
              </span>
              <span className="font-[family-name:var(--font-mono)] text-2xl sm:text-3xl font-medium text-[#8FFE09] tracking-wider">
                7/15
              </span>
            </div>

          </div>
        </div>

        {/* Floating Bottom Right "Report issue" Button */}
        <div className="fixed bottom-5 right-5 z-40 flex items-center">
          <button
            type="button"
            onClick={() => setIsReportDialogOpen(true)}
            className="relative flex items-center justify-center w-[88px] h-[48px] bg-[rgba(143,254,9,0.2)] border border-[rgba(143,254,9,0.4)] rounded-[8px] hover:bg-[rgba(143,254,9,0.35)] transition-all duration-200 shadow-[0_0_15px_rgba(143,254,9,0.25)]"
          >
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
          </button>
        </div>

        {isReportDialogOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-issue-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsReportDialogOpen(false);
              }
            }}
          >
            <div className="relative flex aspect-square w-full max-w-[460px] flex-col justify-center border border-[#8FFE09] bg-[#050805] p-4 font-[family-name:var(--font-misc)] shadow-[0_0_30px_rgba(143,254,9,0.2)] sm:p-6">
              <div className="absolute -left-1 -top-1 h-6 w-6 border-l-4 border-t-4 border-[#8FFE09]" />
              <div className="absolute -right-1 -top-1 h-6 w-6 border-r-4 border-t-4 border-[#8FFE09]" />
              <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-[#8FFE09]" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-[#8FFE09]" />

              <div className="mb-4 flex flex-col items-center justify-center border-b border-[#649627]/50 pb-3 text-center">
                <div>
                  <p className="mb-1 text-sm uppercase tracking-[0.2em] text-[#8FFE09]">CONTACT US</p>
                  <h2 id="report-issue-title" className="text-4xl font-bold uppercase tracking-wider text-white sm:text-5xl">
                    REPORT YOUR ISSUE
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportDialogOpen(false)}
                  aria-label="Close report issue dialog"
                  className="absolute right-2 top-2 flex h-8 w-8 shrink-0 items-center justify-center border border-[#649627] text-xl text-[#8FFE09] transition-colors hover:bg-[#8FFE09] hover:text-black"
                >
                  x
                </button>
              </div>

              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setIsReportDialogOpen(false);
                }}
              >
                <p className="mx-auto max-w-[420px] text-center text-lg leading-relaxed text-white/80">
                  Reach out to our core members for any doubt clarifications on the link below
                </p>

                <div className="mt-1 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReportDialogOpen(false)}
                    className="border border-[#8FFE09]/40 bg-[#8FFE09]/20 px-6 py-3 text-lg uppercase tracking-wider text-white transition-colors hover:bg-[#8FFE09]/35 hover:text-[#8FFE09]"
                  >
                    JOIN DISCORD
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
