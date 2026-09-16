"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_PATH =
  "M212.294 9.27832H285.965L296.543 21.1553V196.497L284.295 207.098H212.294L202.829 216.376H93.1572L84.249 207.098H11.877L0 196.52V21.1553L10.3916 9.27832H84.249L93.1572 0H202.829L212.294 9.27832Z";

const TIMELINE_EVENTS = [
  {
    title: "Master the Basics",
    description: "Learn to branch, commit, and merge through a hands-on workshop built to get you mission-ready.",
    date: "19th September 2026",
    time: "10:00 AM onwards",
  },
  {
    title: "Speaker Session",
    description: "Industry experts share their trajectories, lessons, and what lies beyond the launchpad.",
    date: "19th September 2026",
    time: "2:00 PM onwards",
  },
  {
    title: "⁠Game on",
    description: "Enter the flight simulator where Git meets gamification. Experiment, adapt, and see how far your skills can take you.",
    date: "19th September 2026",
    time: "4:30 PM onwards",
  },
  {
    title: "Online Competition",
    description: "Houston, your move. Go head-to-head in Git challenges and navigate your way to the finish line.",
    date: "19th–21st September 2026",
    time: "10:00 PM onwards",
  },
] as const;

function CardFrame() {
  return (
    <svg
      className="timeline-card__frame"
      viewBox="0 0 297 217"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={FRAME_PATH}
        fill="#8FFE09"
        fillOpacity="0.29"
        stroke="#8FFE09"
        strokeWidth="2.3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Connector({ mirrored }: { mirrored: boolean }) {
  return (
    <svg
      className="timeline-connector"
      viewBox="0 0 175 44"
      fill="none"
      preserveAspectRatio="none"
      data-timeline-connector
      aria-hidden="true"
    >
      <g transform={mirrored ? "translate(175 0) scale(-1 1)" : undefined}>
        <path
          d="M175 1.045H108L66.264 42.348H0"
          stroke="#8FFE09"
          strokeWidth="2.09"
          vectorEffect="non-scaling-stroke"
          data-timeline-connector-path
        />
      </g>
    </svg>
  );
}

export function TimelineSection() {
  const section = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = section.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const title = element.querySelector<HTMLElement>("[data-timeline-title]");
      const track = element.querySelector<SVGElement>("[data-timeline-track]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-timeline-card]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-timeline-dot]");
      const connectors = gsap.utils.toArray<SVGElement>("[data-timeline-connector]");
      const connectorPaths = gsap.utils.toArray<SVGPathElement>("[data-timeline-connector-path]");

      if (reducedMotion) {
        gsap.set([title, track, ...cards, ...dots, ...connectors, ...connectorPaths], {
          clearProps: "all",
        });
        return;
      }

      gsap.set(title, { autoAlpha: 0, y: -24 });
      gsap.set(track, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(dots, { autoAlpha: 0, scale: 0.25 });
      gsap.set(connectors, { autoAlpha: 1 });
      connectorPaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      cards.forEach((card, index) => {
        gsap.set(card, { autoAlpha: 0, x: index % 2 === 0 ? -64 : 64, scale: 0.96 });
      });

      const animation = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      animation
        .to(title, { autoAlpha: 1, y: 0, duration: 0.1 })
        .to(track, { scaleY: 1, duration: 0.72 }, 0.04);

      cards.forEach((card, index) => {
        const dot = dots[index];
        const connectorPath = connectorPaths[index];
        if (!dot || !connectorPath) return;

        const start = 0.12 + index * 0.16;
        animation
          .to(dot, { autoAlpha: 1, scale: 1, duration: 0.04 }, start)
          .to(
            connectorPath,
            { strokeDashoffset: 0, duration: 0.09, ease: "none" },
            start + 0.04,
          )
          .to(card, { autoAlpha: 1, x: 0, scale: 1, duration: 0.1 }, start + 0.13);
      });

      animation
        .to([title, track, ...dots, ...connectors], { autoAlpha: 0, y: -20, duration: 0.15 }, 0.84)
        .to(cards, { autoAlpha: 0, y: -42, stagger: 0.02, duration: 0.16 }, 0.84);
    }, element);

    return () => context.revert();
  }, []);

  return (
    <section ref={section} id="timeline" className="timeline-section" aria-labelledby="timeline-title">
      <div className="timeline-stage">
        <div className="timeline-canvas relative z-10">
          <h2 id="timeline-title" className="timeline-title page-heading" data-timeline-title>
            Timeline
          </h2>

          <svg
            className="timeline-track"
            viewBox="0 0 3 603"
            fill="none"
            preserveAspectRatio="none"
            data-timeline-track
            aria-hidden="true"
          >
            <path d="M1.15 0V603" stroke="white" strokeWidth="2.3" strokeDasharray="13 13" />
          </svg>

          <div className="timeline-events">
            {TIMELINE_EVENTS.map((event, index) => (
              <article key={event.title} className={`timeline-event timeline-event--${index + 1}`}>
                <div className="timeline-card" data-timeline-card>
                  <CardFrame />
                  <div className="timeline-card__content">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <time>
                      {event.date}
                      <span>{event.time}</span>
                    </time>
                  </div>
                </div>
                <Connector mirrored={index % 2 === 1} />
                <span className="timeline-dot" data-timeline-dot aria-hidden="true">
                  <span />
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
