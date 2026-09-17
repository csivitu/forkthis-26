"use client";


import GlareHover from "@/components/ui/GlareHover";
import { SPONSORS } from "./sponsors-data";

function LinkedInBadge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-.78-1.74-1.74-1.74z" />
    </svg>
  );
}

export function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="w-full overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
      aria-labelledby="sponsors-title"
    >
      <h2
        id="sponsors-title"
        className="relative z-10 text-center font-[family-name:var(--font-title)] text-[clamp(2rem,6vw,3.5rem)] font-bold tracking-[0.08em] uppercase text-white mb-16 sm:mb-20"
      >
        Powered By
      </h2>

      <div
  className={`relative  mx-auto grid w-full max-w-5xl gap-8 sm:gap-10 ${
    SPONSORS.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
  }`}
>
        {SPONSORS.map((sponsor) => (
          <div
    key={sponsor.name}
    className="rounded-[28px] border border-white/10 bg-[#151a10] p-4 sm:p-6"
  >
          <GlareHover
            
            background="#0b0f0c"
            borderColor="#1f2a1a"
            borderRadius="16px"
            glareColor="#8FFE09"
            glareOpacity={0.3}
            glareAngle={-30}
            glareSize={220}
            transitionDuration={700}
            style={{ width: "100%", height: "100%" }}
            className="!cursor-default !flex !flex-col !items-stretch !justify-start p-6 sm:p-8"
          >
            <span className="font-mono text-center text-xs sm:text-sm tracking-[0.25em] uppercase text-white font-semibold mb-6">
              Event Sponsor
            </span>

            <div className="relative z-[95] mx-auto mb-8 flex h-24 w-full max-w-xs items-center justify-center rounded-md bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <p className="mx-auto max-w-xl text-center font-mono text-sm sm:text-[15px] leading-relaxed text-zinc-300 mb-8">
              {sponsor.description}
            </p>

            <div className="mt-auto flex items-center justify-between pt-4">
              <a
                href={sponsor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${sponsor.name} on LinkedIn`}
                className="flex h-8 w-8 items-center justify-center rounded bg-white text-black transition-transform hover:scale-105"
              >
                <LinkedInBadge />
              </a>

              <a
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs sm:text-sm text-zinc-300 transition-colors hover:text-[#8FFE09]"
              >
                Visit Them Here →
              </a>
            </div>
                    </GlareHover>
          </div>
        ))}
      </div>
    </section >
  );
}
