"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SPEAKER_DESCRIPTION =
  "A tech community leader and open-source advocate, Mr. Janardan Revuru brings engineering leadership experience in building enterprise products and distributed systems. An Advisor to Open Source India conference since 2011 and founder of prominent developer communities, he has brought together 22K+ members through 110+ events. Currently pursuing a PhD in AI focused on multi-agent systems, he brings together industry expertise, academic insight, and a strong commitment to knowledge sharing.";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-1.74-1.74-1.74-1.74z" />
    </svg>
  );
}

export function SpeakerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lineWidth, setLineWidth] = useState(600);
  const [lineProgress, setLineProgress] = useState({ len: 600, dist: 0, x: 0, y: 12, opacity: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = lineContainerRef.current;
    if (!el) return;

    const updateDims = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setLineWidth(Math.round(rect.width));
      }
    };

    updateDims();
    const ro = new ResizeObserver(() => updateDims());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const line = lineRef.current;
    if (!line) return;

    const lineLength = line.getTotalLength();
    const startPoint = line.getPointAtLength(0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 2000;

    if (reducedMotion) {
      const endPoint = line.getPointAtLength(lineLength);
      setLineProgress({ len: lineLength, dist: lineLength, x: endPoint.x, y: endPoint.y, opacity: 1 });
      return;
    }

    setLineProgress({ len: lineLength, dist: 0, x: startPoint.x, y: startPoint.y, opacity: 1 });
    let startTimestamp: number | null = null;
    let rafId = 0;

    const animate = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const rawProgress = Math.min((timestamp - startTimestamp) / duration, 1);
      const progress = 1 - Math.pow(1 - rawProgress, 3);
      const distance = progress * lineLength;
      const point = line.getPointAtLength(distance);

      setLineProgress({ len: lineLength, dist: distance, x: point.x, y: point.y, opacity: 1 });
      if (rawProgress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, lineWidth]);

  const cardTransform = !isInView
    ? "translateY(24px) scale(0.96) rotate(0deg)"
    : isHovered
      ? "translateY(-4px) scale(1.06) rotate(-3deg)"
      : "translateY(0) scale(1) rotate(0deg)";

  return (
    <section
      ref={sectionRef}
      id="speaker"
      className="speaker-section"
      aria-labelledby="speaker-title"
    >
      <div className="speaker-section__inner">
        <h2 id="speaker-title" className="speaker-section__title page-heading">
          Speaker
        </h2>

        <div className="speaker-section__content">
          {/* Speaker Profile Card with Snappy Mechanical Hover & Straight Normal State */}
          <div className="flex justify-center">
            <div
              className="speaker-card-frame cursor-pointer"
              data-speaker-frame
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: cardTransform,
                opacity: isInView ? 1 : 0,
                transition: isHovered
                  ? "transform 0.28s cubic-bezier(0.2, 1.4, 0.35, 1), opacity 0.5s ease-out"
                  : "transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.7s ease-out",
                transformOrigin: "center center",
                willChange: "transform, opacity",
              }}
            >
              <div className="speaker-card-frame__inner relative w-full overflow-hidden">
                <Image
                  src="/images/speaker.png"
                  alt="Janardan Revuru"
                  fill
                  sizes="(max-width: 767px) 75vw, 30vw"
                  className="speaker-card-frame__image"
                  priority
                />

                {/* Caption Bar with Top-aligned LinkedIn Logo shifted left */}
                <div
                  className="speaker-card-frame__caption !flex !flex-row !items-start !justify-between !px-[6.5%] !py-[4%] select-none"
                  style={{ minHeight: "23%" }}
                >
                  <div className="flex flex-col justify-start leading-[1.05] tracking-[0.04em]">
                    <span className="text-[clamp(1.1rem,2.4vw,1.75rem)] font-bold">Janardan</span>
                    <span className="text-[clamp(1.1rem,2.4vw,1.75rem)] font-bold">Revuru</span>
                  </div>

                  <a
                    href="https://www.linkedin.com/in/rjanardan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Janardan Revuru on LinkedIn"
                    className="!static self-start flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:text-[#8FFE09] -translate-x-1.5 sm:-translate-x-2.5 mt-[0.08em]"
                    style={{
                      width: "clamp(1.35rem, 2.9vw, 1.95rem)",
                      height: "clamp(1.35rem, 2.9vw, 1.95rem)",
                    }}
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copy and Animated SVG Line */}
          <div className="speaker-copy">
            <p className="speaker-copy__role">DIRECTOR OF ENGINEERING</p>
            <p className="speaker-copy__company">Dell Technologies, HPE, Nortel, SIEMENS, Avaya</p>

            <div ref={lineContainerRef} className="w-full">
              <svg
                className="speaker-copy__line"
                viewBox={`0 0 ${lineWidth} 24`}
                role="presentation"
                aria-hidden="true"
              >
                <defs>
                  <filter id="speakerStarGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8FFE09" floodOpacity="1" />
                  </filter>
                </defs>

                <path
                  ref={lineRef}
                  className="speaker-copy__tail"
                  d={`M 0 12 H ${lineWidth}`}
                  strokeDasharray={`${lineProgress.len} ${lineProgress.len}`}
                  strokeDashoffset={lineProgress.len - lineProgress.dist}
                  opacity={lineProgress.opacity}
                />

                <g
                  className="speaker-copy__star star-pulse-glow"
                  transform={`translate(${lineProgress.x}, ${lineProgress.y})`}
                  opacity={lineProgress.opacity}
                >
                  <path
                    d="M 0 -10.5 L 2.5 -2.5 L 10.5 0 L 2.5 2.5 L 0 10.5 L -2.5 2.5 L -10.5 0 L -2.5 -2.5 Z"
                    filter="url(#speakerStarGlow)"
                  />
                </g>
              </svg>
            </div>

            <p className="speaker-copy__description">{SPEAKER_DESCRIPTION}</p>
          </div>
        </div>
      </div>
    </section>
  );
}