"use client";

import React, { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

// ─── Social Media Icons ───────────────────────────────────────────────────────
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-.78-1.74-1.74-1.74z" />
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Social Links List ────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    name: "Instagram",
    handle: "@csivitu",
    url: "https://instagram.com/csivitu",
    Icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    handle: "Computer Society of India - VIT",
    url: "https://linkedin.com/company/csivitu",
    Icon: LinkedInIcon,
  },
  {
    name: "GitHub",
    handle: "www.github.com/csivitu",
    url: "https://github.com/csivitu",
    Icon: GitHubIcon,
  },
  {
    name: "X (Twitter)",
    handle: "@csivitu",
    url: "https://x.com/csivitu",
    Icon: XIcon,
  },
  {
    name: "Website",
    handle: "www.csivit.com",
    url: "https://csivit.com",
    Icon: Globe,
  },
];

export function FooterSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardFrameRef = useRef<HTMLDivElement>(null);
  const discordBoxRef = useRef<HTMLDivElement>(null);

  const leftPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [frameDim, setFrameDim] = useState({ w: 1000, h: 400 });
  const [discordDim, setDiscordDim] = useState({ w: 420, h: 220 });

  const [leftProgress, setLeftProgress] = useState({ len: 1000, dist: 0, x: 8, y: 8, opacity: 0 });
  const [rightProgress, setRightProgress] = useState({ len: 1000, dist: 0, x: 992, y: 392, opacity: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure card frame to calculate true 45° inclines and exact path lengths
  useEffect(() => {
    const cardEl = cardFrameRef.current;
    if (!cardEl) return;

    const updateDims = () => {
      const rect = cardEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameDim({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };

    updateDims();
    const ro = new ResizeObserver(() => updateDims());
    ro.observe(cardEl);
    return () => ro.disconnect();
  }, []);

  // Measure Discord box to ensure matching 45° inclines
  useEffect(() => {
    const boxEl = discordBoxRef.current;
    if (!boxEl) return;

    const updateDims = () => {
      const rect = boxEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDiscordDim({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };

    updateDims();
    const ro = new ResizeObserver(() => updateDims());
    ro.observe(boxEl);
    return () => ro.disconnect();
  }, []);

  // 45° Chamfer calculation (Δx = Δy = 24px) for outer frame paths
  const C = 24;
  const fw = frameDim.w;
  const fh = frameDim.h;
  const leftEndX = Math.round(Math.min(fw * 0.38, 360));
  const rightStartX = Math.round(Math.max(fw - Math.min(fw * 0.38, 360), fw * 0.62));

  const leftPathD = `M 8 8 L 8 ${fh - 8 - C} L ${8 + C} ${fh - 8} L ${leftEndX} ${fh - 8}`;
  const rightPathD = `M ${fw - 8} ${fh - 8} L ${fw - 8} ${8 + C} L ${fw - 8 - C} 8 L ${rightStartX} 8`;

  // Synchronized requestAnimationFrame loop driven by SVG getPointAtLength
  useEffect(() => {
    if (!isInView) return;

    const leftEl = leftPathRef.current;
    const rightEl = rightPathRef.current;
    if (!leftEl || !rightEl) return;

    const leftLen = leftEl.getTotalLength();
    const rightLen = rightEl.getTotalLength();

    const startPtLeft = leftEl.getPointAtLength(0);
    const startPtRight = rightEl.getPointAtLength(0);

    setLeftProgress({ len: leftLen, dist: 0, x: startPtLeft.x, y: startPtLeft.y, opacity: 1 });
    setRightProgress({ len: rightLen, dist: 0, x: startPtRight.x, y: startPtRight.y, opacity: 1 });

    let startTimestamp: number | null = null;
    const duration = 2400; // 2.4s

    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-out
      const p = 1 - Math.pow(1 - rawProgress, 3);

      // Left path stroke & star position
      const curLeftDist = p * leftLen;
      const ptLeft = leftEl.getPointAtLength(curLeftDist);
      setLeftProgress({
        len: leftLen,
        dist: curLeftDist,
        x: ptLeft.x,
        y: ptLeft.y,
        opacity: 1,
      });

      // Right path stroke & star position
      const curRightDist = p * rightLen;
      const ptRight = rightEl.getPointAtLength(curRightDist);
      setRightProgress({
        len: rightLen,
        dist: curRightDist,
        x: ptRight.x,
        y: ptRight.y,
        opacity: 1,
      });

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, fw, fh]);

  // Discord Box polygon path with complete 45° inclines (closed M...Z path)
  const dw = discordDim.w;
  const dh = discordDim.h;
  const pad = 1.5;
  const cCorner = 24;
  const cNotch = 16;
  const notchX = Math.max(dw - 160, Math.round(dw * 0.58));

  const discordPathD = `
    M ${pad} ${cCorner} 
    L ${cCorner} ${pad} 
    L ${notchX} ${pad} 
    L ${notchX + cNotch} ${cNotch + pad} 
    L ${dw - cCorner - pad} ${cNotch + pad} 
    L ${dw - pad} ${cNotch + cCorner} 
    L ${dw - pad} ${dh - cNotch - cCorner} 
    L ${dw - cCorner - pad} ${dh - cNotch - pad} 
    L ${notchX + cNotch} ${dh - cNotch - pad} 
    L ${notchX} ${dh - pad} 
    L ${cCorner} ${dh - pad} 
    L ${pad} ${dh - cCorner} 
    Z
  `;

  return (
    <footer
      ref={containerRef}
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden pt-16 text-white select-none sm:pt-24"
      style={{
        background:
          "linear-gradient(180deg, #000000 0%, #060e02 4%, #142803 16%, #294e06 38%, #417209 64%, #50850c 84%, #5A930D 100%)",
      }}
    >
      {/* ── 1. GET IN TOUCH SECTION WITH ANIMATED STARS & TAILS ─────────── */}
      <div
        id="contact"
        className="relative z-10 mx-auto mb-16 max-w-6xl shrink-0 px-4 sm:mb-24 sm:px-6 lg:px-8"
      >
        
        {/* Outer Frame Container */}
        <div
          ref={cardFrameRef}
          className="relative pt-10 sm:pt-12 pl-5 sm:pl-10 pr-5 sm:pr-10 pb-6 sm:pb-8 min-h-[300px] sm:min-h-[340px] md:min-h-[360px]"
        >
          
          {/* ── SVG Wireframe Overlay (Locked Tail-to-Star Animation) ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox={`0 0 ${fw} ${fh}`}
          >
            <defs>
              <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#8FFE09" floodOpacity="1" />
              </filter>
            </defs>

            {/* Left Line Tail */}
            <path
              ref={leftPathRef}
              d={leftPathD}
              fill="none"
              stroke="#8FFE09"
              strokeWidth="2.4"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={`${leftProgress.len} ${leftProgress.len}`}
              strokeDashoffset={leftProgress.len - leftProgress.dist}
              opacity={leftProgress.opacity}
            />

            {/* Left Star Head: Physically positioned at stroke tip */}
            <g
              transform={`translate(${leftProgress.x}, ${leftProgress.y})`}
              opacity={leftProgress.opacity}
              className="star-pulse-glow"
            >
              <path
                d="M 0 -9 L 2.2 -2.2 L 9 0 L 2.2 2.2 L 0 9 L -2.2 2.2 L -9 0 L -2.2 -2.2 Z"
                fill="#8FFE09"
                filter="url(#starGlow)"
              />
            </g>

            {/* Right Line Tail */}
            <path
              ref={rightPathRef}
              d={rightPathD}
              fill="none"
              stroke="#8FFE09"
              strokeWidth="2.4"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={`${rightProgress.len} ${rightProgress.len}`}
              strokeDashoffset={rightProgress.len - rightProgress.dist}
              opacity={rightProgress.opacity}
            />

            {/* Right Star Head: Physically positioned at stroke tip */}
            <g
              transform={`translate(${rightProgress.x}, ${rightProgress.y})`}
              opacity={rightProgress.opacity}
              className="star-pulse-glow"
            >
              <path
                d="M 0 -9 L 2.2 -2.2 L 9 0 L 2.2 2.2 L 0 9 L -2.2 2.2 L -9 0 L -2.2 -2.2 Z"
                fill="#8FFE09"
                filter="url(#starGlow)"
              />
            </g>
          </svg>

          {/* ── Title: GET IN TOUCH (Dynamically Sized, Zero Vertical Clipping) ── */}
          <div className="mb-6 sm:mb-8 text-left w-full pt-1.5 sm:pt-2">
            <h2 className="font-[family-name:var(--font-title)] text-[clamp(1.15rem,5.2vw,2.35rem)] font-bold tracking-[0.12em] uppercase flex items-center gap-2 sm:gap-2.5 whitespace-nowrap flex-nowrap leading-[1.2] select-none py-1">
              <span className="text-white drop-shadow-sm shrink-0 inline-block">GET IN</span>
              <span className="text-[#8FFE09] drop-shadow-[0_0_14px_rgba(143,254,9,0.7)] shrink-0 inline-block">
                TOUCH
              </span>
            </h2>
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center w-full">
            
            {/* Left Column: Social Handles */}
            <div className="lg:col-span-5 flex flex-col space-y-3.5 sm:space-y-4">
              {SOCIAL_LINKS.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3.5 text-zinc-300 hover:text-[#8FFE09] transition-all duration-200 outline-none w-fit"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white group-hover:text-[#8FFE09] transition-colors duration-200 shrink-0">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] font-mono text-xs sm:text-sm md:text-[15px] tracking-wide group-hover:translate-x-1 transition-transform duration-200 break-all text-zinc-200 group-hover:text-white">
                      {item.handle}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Right Column: Discord Box Offset Completely to the Right */}
            <div className="lg:col-span-7 flex justify-end items-center w-full">
              <div ref={discordBoxRef} className="relative w-full max-w-[420px] lg:max-w-[450px] ml-auto">
                
                {/* Symmetrical Container with 45° Incline Border & #294A03 Background */}
                <div className="relative flex w-full min-h-[220px] flex-col items-start justify-center px-4 py-6 text-left sm:min-h-[240px] sm:px-6 sm:py-8">
                  
                  {/* Symmetrical SVG Background Frame (Closed path for 100% complete seamless border) */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible drop-shadow-[0_0_20px_rgba(143,254,9,0.3)]"
                    viewBox={`0 0 ${dw} ${dh}`}
                  >
                    <path
                      d={discordPathD}
                      fill="#294A03"
                      fillOpacity="0.95"
                      stroke="#8FFE09"
                      strokeWidth="2.5"
                      strokeLinejoin="miter"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {/* Text Content in IBM Plex Mono (Fills the entire box width boldly) */}
                  <div className="relative z-10 mb-6 w-full text-left">
                    <p className="w-full text-left font-[family-name:var(--font-ibm-plex-mono)] font-mono text-sm font-medium leading-relaxed tracking-wide text-zinc-100 sm:text-base md:text-[17px]">
                      Join The Discord Channel For Competition Discussion And All Further Communication
                    </p>
                  </div>

                  {/* ── Discord Button: Three staggered chevrons ── */}
                  <div className="w-full flex justify-end relative z-10">
                    <a
                      href="https://discord.gg"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Join Discord"
                      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-lg border-2 border-[#8FFE09] bg-black px-6 py-2.5 uppercase tracking-wider transition-all duration-300 shadow-[0_0_16px_rgba(143,254,9,0.35)] hover:shadow-[0_0_28px_rgba(143,254,9,0.6)] cursor-pointer"
                    >
                      <span
                        className="absolute -inset-1 bg-[#8FFE09] -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                        aria-hidden="true"
                      />

                      <span className="relative z-10 font-[family-name:var(--font-sixsound)] text-xs font-extrabold tracking-widest text-[#8FFE09] transition-colors duration-300 group-hover:text-black sm:text-sm">
                        JOIN DISCORD
                      </span>

                      <span className="relative z-10 flex items-center gap-0 transition-transform duration-300 group-hover:translate-x-1.5">
                        <span className="h-5 w-5 bg-current text-white animate-arrow-1 group-hover:!text-black group-hover:!animate-none [clip-path:polygon(0_0,54%_0,100%_50%,54%_100%,0_100%,38%_50%)]" />
                        <span className="-ml-1 h-5 w-5 bg-current text-white animate-arrow-2 group-hover:!text-black group-hover:!animate-none [clip-path:polygon(0_0,54%_0,100%_50%,54%_100%,0_100%,38%_50%)]" />
                        <span className="-ml-1 h-5 w-5 bg-current text-white animate-arrow-3 group-hover:!text-black group-hover:!animate-none [clip-path:polygon(0_0,54%_0,100%_50%,54%_100%,0_100%,38%_50%)]" />
                      </span>
                    </a>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. "GIT. SET. FORK." CONTINUOUS MARQUEE (IN WHITE) ────────── */}
      <div
        data-nav-logo-exit
        className="w-full relative z-10 border-y border-dashed border-[#8FFE09]/60 py-3 sm:py-3.5 bg-black/40 overflow-hidden mt-6"
      >
        <div className="flex w-max animate-marquee-left">
          {/* Loop Strip 1 */}
          <div className="flex shrink-0 items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={`strip1-${i}`}
                className="font-[family-name:var(--font-title)] text-lg sm:text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              >
                GIT. SET. FORK.
              </span>
            ))}
          </div>

          {/* Loop Strip 2 (Duplicate for Seamless Infinite Marquee) */}
          <div className="flex shrink-0 items-center space-x-8 sm:space-x-12 pr-8 sm:pr-12" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={`strip2-${i}`}
                className="font-[family-name:var(--font-title)] text-lg sm:text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              >
                GIT. SET. FORK.
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. ELEGANT UNCLIPPED "FORKTHIS" BANNER & CREDITS ─────────── */}
      <div className="relative flex min-h-0 flex-1 w-full flex-col items-center justify-center overflow-hidden pt-16 pb-0 sm:pt-24 md:pt-28">

        {/* Geodesic Photo Background — prominent and clearly visible behind FORKTHIS */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/image%20398_1.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover sm:object-contain object-center pointer-events-none select-none mix-blend-screen"
          style={{ opacity: 0.85 }}
        />

        {/* FORKTHIS in Hail Mary font (#264501, dynamically responsive across mobile, tablet, and 1024px+ screens) */}
        <div className="relative z-10 flex w-full -translate-y-4 justify-center px-6 text-center select-none py-6 sm:-translate-y-6 sm:px-10 sm:py-10 md:px-16 md:py-12 lg:px-20">
          <div className="inline-flex max-w-full flex-row flex-nowrap items-center justify-center text-[#264501] font-[family-name:var(--font-title)] font-extrabold tracking-[0.04em] sm:tracking-[0.08em] md:tracking-[0.12em] lg:tracking-[0.14em] leading-none text-[clamp(2.1rem,7.8vw,7.8rem)] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] gap-3 sm:gap-5 md:gap-7 lg:gap-9 whitespace-nowrap">
            <span className="inline-block py-1">FORK</span>
            <span className="inline-block py-1">THIS</span>
          </div>
        </div>

        {/* Bottom Credits: Made with 🤍 by CSI-VIT */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-2 text-center sm:pb-3">
          <p className="m-0 font-[family-name:var(--font-ibm-plex-mono)] font-mono text-xs sm:text-sm font-semibold tracking-wider text-[#8FFE09]">
            Made with <span className="text-white drop-shadow-sm">🤍</span> by CSI-VIT
          </p>
        </div>

      </div>
    </footer>
  );
}
