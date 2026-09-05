"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_PATH =
  "M212.294 9.27832H285.965L296.543 21.1553V196.497L284.295 207.098H212.294L202.829 216.376H93.1572L84.249 207.098H11.877L0 196.52V21.1553L10.3916 9.27832H84.249L93.1572 0H202.829L212.294 9.27832Z";

const TIMELINE_EVENTS = [
  {
    title: "Teaching Git Basics",
    description: "Master the art of branching, committing, and merging in a hands-on open workshop.",
    date: "19th September 2026",
    time: "11:00 AM onwards",
  },
  {
    title: "Speaker Session",
    description: "Get inspired as industry experts share their Git journey and insights.",
    date: "19th September 2026",
    time: "2:00 PM onwards",
  },
  {
    title: "Introduction to Game",
    description: "Dive into the world of Git gamification, where learning meets fun.",
    date: "19th September 2026",
    time: "4:30 PM onwards",
  },
  {
    title: "Online Competition",
    description: "Compete head-to-head in Git challenges, proving your skills in real time.",
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
        <line x1="108" y1="1.045" x2="175" y2="1.045" stroke="#8FFE09" strokeWidth="2.09" />
        <line y1="42.045" x2="67" y2="42.045" stroke="#8FFE09" strokeWidth="2.09" />
        <line x1="66.264" y1="42.348" x2="107.599" y2="1.348" stroke="#8FFE09" strokeWidth="2.09" />
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
      const slider = element.querySelector<HTMLElement>("[data-timeline-slider]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-timeline-card]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-timeline-dot]");
      const connectors = gsap.utils.toArray<SVGElement>("[data-timeline-connector]");

      if (reducedMotion) {
        gsap.set([title, track, slider, ...cards, ...dots, ...connectors], { clearProps: "all" });
        return;
      }

      gsap.set(title, { autoAlpha: 0, y: -24 });
      gsap.set(track, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(slider, { autoAlpha: 0, x: 28 });
      gsap.set(dots, { autoAlpha: 0, scale: 0.25 });
      gsap.set(connectors, { autoAlpha: 0, scaleX: 0, transformOrigin: "center center" });
      cards.forEach((card, index) => {
        gsap.set(card, { autoAlpha: 0, x: index % 2 === 0 ? -80 : 80, scale: 0.95 });
      });

      const animation = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => element.style.setProperty("--timeline-progress", self.progress.toFixed(4)),
        },
      });

      animation
        .to(title, { autoAlpha: 1, y: 0, duration: 0.1 })
        .to(track, { scaleY: 1, duration: 0.42 }, 0.04)
        .to(slider, { autoAlpha: 1, x: 0, duration: 0.14 }, 0.06)
        .to(dots, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.13 }, 0.11)
        .to(connectors, { autoAlpha: 1, scaleX: 1, stagger: 0.1, duration: 0.16 }, 0.14)
        .to(cards, { autoAlpha: 1, x: 0, scale: 1, stagger: 0.1, duration: 0.22 }, 0.16)
        .to([title, track, slider, ...dots, ...connectors], { autoAlpha: 0, y: -20, duration: 0.15 }, 0.84)
        .to(cards, { autoAlpha: 0, y: -42, stagger: 0.02, duration: 0.16 }, 0.84);
    }, element);

    return () => context.revert();
  }, []);

  return (
    <section ref={section} id="timeline" className="timeline-section" aria-labelledby="timeline-title">
      <div className="timeline-stage">
        <div className="timeline-stars" aria-hidden="true" />
        <div className="timeline-canvas">
          <h2 id="timeline-title" className="timeline-title" data-timeline-title>
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

        <div className="timeline-slider" data-timeline-slider aria-hidden="true">
          <span className="timeline-slider__shell" />
          <span className="timeline-slider__rail">
            <span className="timeline-slider__thumb" />
          </span>
        </div>
      </div>
    </section>
  );
}
