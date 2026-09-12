"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface RepoItem {
  id: number;
  name: string;
  techStack: string[];
  issuesCount: number;
  issuesList: string[];
}

const REPOSITORIES: RepoItem[] = [
  {
    id: 1,
    name: "Repo1",
    techStack: ["Flask", "Django", "Python"],
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
    name: "Repo2",
    techStack: ["React", "Next.js", "TypeScript"],
    issuesCount: 3,
    issuesList: [
      "Hydration mismatch on dynamic theme toggle #04",
      "Optimize image loading layout shifts #08",
      "Fix state desync in real-time leaderboard #15",
    ],
  },
  {
    id: 3,
    name: "Repo3",
    techStack: ["Rust", "WebAssembly", "Solana"],
    issuesCount: 4,
    issuesList: [
      "WASM memory limit panic on large inputs #02",
      "Instruction data serialization overflow #11",
      "Account validation CPI vulnerability #18",
      "Optimize compute unit usage in swap loop #29",
    ],
  },
  {
    id: 4,
    name: "Repo4",
    techStack: ["Go", "libp2p", "Protobuf"],
    issuesCount: 2,
    issuesList: [
      "GossipSub peer routing table desync #07",
      "Stream handler deadlock under high throughput #14",
    ],
  },
  {
    id: 5,
    name: "Repo5",
    techStack: ["C++", "eBPF", "Linux"],
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
    name: "Repo6",
    techStack: ["PyTorch", "Python", "CUDA"],
    issuesCount: 1,
    issuesList: ["Tensor shape mismatch during gradient backward pass #09"],
  },
  {
    id: 7,
    name: "Repo7",
    techStack: ["Circom", "ZK-Snarks", "Node.js"],
    issuesCount: 4,
    issuesList: [
      "Constraint under-specification in merkle verifier #05",
      "Prover key generation out of memory #13",
      "Public input hash truncation vulnerability #22",
      "Optimize groth16 verification gas cost #36",
    ],
  },
  {
    id: 8,
    name: "Repo8",
    techStack: ["Solidity", "Foundry", "Hardhat"],
    issuesCount: 3,
    issuesList: [
      "Reentrancy flaw in vault withdraw function #01",
      "Oracle price manipulation vulnerability #16",
      "Delegatecall storage collision bug #27",
    ],
  },
  {
    id: 9,
    name: "Repo9",
    techStack: ["FastAPI", "Docker", "Redis"],
    issuesCount: 2,
    issuesList: [
      "Redis cluster reconnection connection pool leak #17",
      "Background worker rate limiter race condition #25",
    ],
  },
  {
    id: 10,
    name: "Repo10",
    techStack: ["Elixir", "Phoenix", "GraphQL"],
    issuesCount: 3,
    issuesList: [
      "Absinthe subscription socket disconnect #06",
      "Ecto query N+1 preloader inefficiency #20",
      "GenServer state corruption recovery bug #30",
    ],
  },
];

const PARTICLES = [
  { top: "5%", left: "14%" },
  { top: "8%", left: "82%" },
  { top: "18%", left: "42%" },
  { top: "22%", left: "95%" },
  { top: "35%", left: "6%" },
  { top: "48%", left: "88%" },
  { top: "62%", left: "12%" },
  { top: "74%", left: "78%" },
  { top: "85%", left: "38%" },
  { top: "92%", left: "91%" },
];

export default function DashboardPage() {
  const [expandedRepoId, setExpandedRepoId] = useState<number | null>(null);

  // Live timer countdown state: 11h 59m 50s = 43190s
  const [timeLeft, setTimeLeft] = useState<number>(43190);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-black font-sans text-white overflow-x-hidden select-none">
      {/* Cockpit Bezel Outer Border Frame */}
      <div className="fixed inset-0 pointer-events-none z-50 border-[3px] border-[#649627]/40 shadow-[inset_0_0_15px_rgba(100,150,39,0.25)]" />

      {/* Main Layout Container */}
      <div className="relative flex flex-col items-center justify-start w-full max-w-[1440px] px-4 sm:px-8 pb-16 pt-4">
        {/* Background Glowing Particles & Stars */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full bg-[#8FFE09] opacity-75 shadow-[0_0_8px_#8FFE09] animate-pulse"
              style={{ top: p.top, left: p.left }}
            />
          ))}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,#8ffe09_0%,transparent_70%)] pointer-events-none" />
        </div>

        {/* Header / Navbar Section */}
        <header className="relative z-20 flex w-full items-center justify-between h-[60px] border-b border-[#649627]/30 px-2 sm:px-6 mb-6 sm:mb-10">
          {/* Left Links */}
          <div className="flex items-center gap-6 sm:gap-10 font-['Sixsound',sans-serif] text-sm sm:text-base tracking-widest uppercase text-white">
            <Link
              href="/"
              className="hover:text-[#8FFE09] transition-colors duration-150"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[#8FFE09] transition-colors duration-150"
            >
              Resources
            </Link>
          </div>

          {/* Center Brand / Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center h-[54px] px-6 bg-[#649627] rounded-b-xl clip-path-polygon shadow-[0_0_15px_rgba(143,254,9,0.3)]">
            <span className="font-['Hail_Mary_Sans',sans-serif] text-lg sm:text-xl font-bold tracking-[0.25em] text-white flex items-center gap-2">
              <span className="text-[#8FFE09]">FORK</span>THIS
            </span>
          </div>

          {/* Right Links & Login */}
          <div className="flex items-center gap-4 sm:gap-8 font-['Sixsound',sans-serif] text-sm sm:text-base tracking-widest uppercase">
            <Link
              href="/dashboard"
              className="text-[#8FFE09] border-b-2 border-[#8FFE09] pb-0.5"
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="text-white hover:text-[#8FFE09] transition-colors duration-150 hidden sm:inline"
            >
              Leaderboard
            </Link>
            <button className="px-4 py-1.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-white bg-[#8FFE09]/20 border border-[#8FFE09]/40 rounded-lg hover:bg-[#8FFE09]/40 hover:border-[#8FFE09] transition-all duration-200 shadow-[0_0_10px_rgba(143,254,9,0.2)]">
              LOG OUT
            </button>
          </div>
        </header>

        {/* Page Title Header */}
        <div className="relative z-10 w-full flex flex-col items-start mb-6 sm:mb-10 px-2 sm:px-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[0.08em] text-white font-[family-name:var(--font-title)] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            DASHBOARD
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm font-mono text-[#8FFE09]/80 tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8FFE09] animate-ping" />
            <span>SYS_STATUS: ONLINE // COMPETITION WINDOW ACTIVE // SECTOR 07</span>
          </div>
        </div>

        {/* Main Content Grid: Repositories (Left) & Stats/Timer (Right) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full px-2 sm:px-6">

          {/* Left Column: Repositories Table / Card Panel (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {/* Outer Sci-Fi Container */}
            <div className="relative flex flex-col w-full bg-[#0d0d12]/90 border border-[#649627]/60 rounded-xl p-4 sm:p-6 shadow-[0_0_25px_rgba(100,150,39,0.15)]">
              {/* Corner Sci-Fi Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#8FFE09]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#8FFE09]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#8FFE09]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#8FFE09]" />

              {/* Table Header Bar */}
              <div className="flex w-full items-center justify-between bg-[#8FFE09]/20 border border-[#8FFE09]/30 rounded-lg px-4 py-3 mb-4 text-xs sm:text-sm md:text-base font-bold tracking-wider text-white font-[family-name:var(--font-display)]">
                <span className="w-12 text-left">Sr No.</span>
                <span className="w-28 sm:w-36 text-left">Repo Name</span>
                <span className="flex-1 text-center hidden sm:block">TechStack</span>
                <span className="w-20 text-right">Issues</span>
              </div>

              {/* Repositories Rows List */}
              <div className="flex flex-col gap-2.5 w-full">
                {REPOSITORIES.map((repo, idx) => {
                  const isExpanded = expandedRepoId === repo.id;
                  return (
                    <div key={repo.id} className="flex flex-col w-full">
                      {/* Main Row Bar */}
                      <div
                        onClick={() => toggleRepoExpand(repo.id)}
                        className={`group relative flex items-center justify-between h-12 px-4 bg-[rgba(94,100,88,0.2)] border ${isExpanded
                            ? "border-[#8FFE09] bg-[#8FFE09]/10"
                            : "border-[#649627]/30 hover:border-[#8FFE09]/60 hover:bg-[rgba(94,100,88,0.35)]"
                          } rounded-lg cursor-pointer transition-all duration-200`}
                      >
                        {/* Sr No */}
                        <span className="w-12 text-xs sm:text-sm font-mono text-white/90">
                          {idx + 1}.
                        </span>

                        {/* Repo Name */}
                        <span className="w-28 sm:w-36 text-xs sm:text-sm font-mono font-semibold text-white group-hover:text-[#8FFE09] transition-colors truncate">
                          {repo.name}
                        </span>

                        {/* TechStack Tags */}
                        <div className="flex-1 justify-center gap-1.5 hidden sm:flex truncate px-2">
                          {repo.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 border border-[#649627]/40 text-white/80"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Issues Count & Dropdown Arrow */}
                        <div className="w-20 flex items-center justify-end gap-1.5 text-xs sm:text-sm font-mono text-white">
                          <span>{repo.issuesCount}</span>
                          <span
                            className={`transform transition-transform duration-200 text-[#8FFE09] font-bold ${isExpanded ? "rotate-90" : "rotate-0"
                              }`}
                          >
                            &gt;
                          </span>
                        </div>
                      </div>

                      {/* Expanded Issues Accordion Drawer */}
                      {isExpanded && (
                        <div className="flex flex-col w-full mt-1.5 p-3.5 bg-black/80 border border-[#8FFE09]/40 rounded-lg gap-2 text-xs font-mono">
                          <div className="text-[#8FFE09] font-semibold tracking-wider flex items-center justify-between border-b border-[#649627]/40 pb-1.5">
                            <span>AVAILABLE ISSUES FOR {repo.name.toUpperCase()}:</span>
                            <span className="text-[10px] text-white/60">
                              Tech: {repo.techStack.join(", ")}
                            </span>
                          </div>
                          {repo.issuesList.map((issue, iIndex) => (
                            <div
                              key={iIndex}
                              className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#8FFE09]/10 text-white/90 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-[#8FFE09]">•</span>
                                {issue}
                              </span>
                              <button className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-black bg-[#8FFE09] rounded hover:bg-[#a5ff45] transition-colors">
                                Claim Issue
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
          </div>

          {/* Right Column: Stats & Timer Widgets (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center gap-6 w-full">

            {/* 1. "Your Points" Card */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-[420px] h-[120px] bg-black border-2 border-[#649627] rounded-xl p-4 shadow-[0_0_20px_rgba(100,150,39,0.2)]">
              {/* Sci-Fi Bracket Corner Accents */}
              <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-[#8FFE09]" />
              <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-[#8FFE09]" />

              <span className="font-['Sixsound',sans-serif] text-xl sm:text-2xl text-[#8FFE09] tracking-wider uppercase mb-1">
                Your Points
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8FFE09] tracking-widest drop-shadow-[0_0_12px_#8FFE09]">
                280/300
              </span>
            </div>

            {/* 2. Central Sci-Fi Countdown Clock Timer */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-[440px] h-[190px] bg-[#030305] border-2 border-[#8FFE09] rounded-2xl p-6 shadow-[0_0_30px_rgba(143,254,9,0.25)] overflow-hidden">
              {/* Inner Octagonal Glow Ring */}
              <div className="absolute inset-2 border border-[#649627]/40 rounded-xl pointer-events-none" />

              {/* Top Telemetry Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#8FFE09] animate-ping" />
                <span className="font-mono text-xs text-[#8FFE09]/90 tracking-widest uppercase">
                  TIME REMAINING
                </span>
              </div>

              {/* Digital Timer Readout */}
              <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-black text-[#8FFE09] tracking-widest drop-shadow-[0_0_25px_#8FFE09]">
                {formatTime(timeLeft)}
              </div>

              {/* Bottom Status Ticks */}
              <div className="flex items-center gap-1.5 mt-3">
                <span className="w-3 h-1 bg-[#8FFE09]/40 rounded-full" />
                <span className="w-8 h-1 bg-[#8FFE09] rounded-full shadow-[0_0_6px_#8FFE09]" />
                <span className="w-3 h-1 bg-[#8FFE09]/40 rounded-full" />
              </div>
            </div>

            {/* 3. "Issues Solved" Card */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-[420px] h-[120px] bg-black border-2 border-[#649627] rounded-xl p-4 shadow-[0_0_20px_rgba(100,150,39,0.2)]">
              {/* Sci-Fi Bracket Corner Accents */}
              <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-[#8FFE09]" />
              <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-[#8FFE09]" />

              <span className="font-['Sixsound',sans-serif] text-xl sm:text-2xl text-[#8FFE09] tracking-wider uppercase mb-1">
                Issues Solved
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8FFE09] tracking-widest drop-shadow-[0_0_12px_#8FFE09]">
                7/15
              </span>
            </div>

          </div>
        </div>

        {/* Floating Bottom-Right "Report Issue" Action Widget */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center">
          <button className="relative group flex items-center gap-2.5 px-4 py-2.5 bg-[#8FFE09]/20 border-2 border-[#8FFE09] rounded-xl text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(143,254,9,0.3)] hover:bg-[#8FFE09]/30 hover:scale-105 transition-all duration-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8FFE09] shadow-[0_0_8px_#8FFE09] animate-pulse" />
            <div className="flex flex-col text-left leading-tight">
              <span>Report</span>
              <span className="text-[#8FFE09]">issue</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}