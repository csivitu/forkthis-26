"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SPEAKER_DESCRIPTION =
  "A tech community leader and AI and open-source advocate, Mr. Janardan Revuru brings engineering leadership experience across Dell, HPE, Nortel, Siemens, and Motorola. An Advisor to Open Source India since 2011 and co-founder of prominent developer communities, he has brought together 22K+ members through 110+ events. Currently pursuing a PhD in AI focused on multi-agent systems, he brings together industry expertise, academic insight, and a strong commitment to knowledge sharing.";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-1.74-1.74-1.74-1.74z" />
    </svg>
  );
}

export function SpeakerSection() {
  const lineRef = useRef<SVGPathElement>(null);
  const [lineProgress, setLineProgress] = useState({ len: 1000, dist: 0, x: 0, y: 12 });

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const lineLength = line.getTotalLength();
    const startPoint = line.getPointAtLength(0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 1400;

    if (reducedMotion) {
      const endPoint = line.getPointAtLength(lineLength);
      setLineProgress({ len: lineLength, dist: lineLength, x: endPoint.x, y: endPoint.y });
      return;
    }

    setLineProgress({ len: lineLength, dist: 0, x: startPoint.x, y: startPoint.y });
    let startTimestamp: number | null = null;
    let rafId = 0;

    const animate = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const rawProgress = Math.min((timestamp - startTimestamp) / duration, 1);
      const progress = 1 - Math.pow(1 - rawProgress, 3);
      const distance = progress * lineLength;
      const point = line.getPointAtLength(distance);

      setLineProgress({ len: lineLength, dist: distance, x: point.x, y: point.y });
      if (rawProgress < 1) rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="speaker" className="speaker-section" aria-labelledby="speaker-title">
      <div className="speaker-section__inner">
        <h2 id="speaker-title" className="speaker-section__title page-heading">
          Speaker
        </h2>

        <div className="speaker-section__content">
          <div className="speaker-card-frame" data-speaker-frame>
            <div className="speaker-card-frame__inner">
              <Image
                src="/images/speaker.png"
                alt="Janardan Revuru"
                fill
                sizes="(max-width: 767px) 72vw, 30vw"
                className="speaker-card-frame__image"
                priority
              />
              <div className="speaker-card-frame__caption">
                <span>Janardan</span>
                <span>Revuru</span>
                <a href="https://www.linkedin.com/in/rjanardan/" aria-label="Janardan Revuru on LinkedIn">
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="speaker-copy">
            <p className="speaker-copy__role">Director of Engineering</p>
            <p className="speaker-copy__company">@Dell Technologies</p>

            <svg
              className="speaker-copy__line"
              viewBox="0 0 1000 24"
              preserveAspectRatio="none"
              role="presentation"
              aria-hidden="true"
            >
              <path
                ref={lineRef}
                className="speaker-copy__tail"
                d="M 0 12 H 1000"
                strokeDasharray={`${lineProgress.len} ${lineProgress.len}`}
                strokeDashoffset={lineProgress.len - lineProgress.dist}
              />

              <g
                className="speaker-copy__star"
                transform={`translate(${lineProgress.x}, ${lineProgress.y})`}
              >
                <path d="M 0 -9 L 2.2 -2.2 L 9 0 L 2.2 2.2 L 0 9 L -2.2 2.2 L -9 0 L -2.2 -2.2 Z" />
              </g>
            </svg>

            <p className="speaker-copy__description">{SPEAKER_DESCRIPTION}</p>
          </div>
        </div>
      </div>
    </section>
  );
}