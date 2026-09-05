"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function TimelineSection() {
  const section = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = section.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const title = element.querySelector<HTMLElement>("[data-timeline-title]");
      const track = element.querySelector<HTMLElement>("[data-timeline-track]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-timeline-card]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-timeline-dot]");

      if (reducedMotion) {
        gsap.set([title, track, ...cards, ...dots], { clearProps: "all" });
        return;
      }

      gsap.set(title, { autoAlpha: 0, y: -28 });
      gsap.set(track, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(dots, { autoAlpha: 0, scale: 0.35 });
      cards.forEach((card, index) => {
        gsap.set(card, { autoAlpha: 0, x: index % 2 === 0 ? -90 : 90, scale: 0.94 });
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
        .to(title, { autoAlpha: 1, y: 0, duration: 0.12 })
        .to(track, { scaleY: 1, duration: 0.5 }, 0.06)
        .to(dots, { autoAlpha: 1, scale: 1, stagger: 0.09, duration: 0.14 }, 0.12)
        .to(cards, { autoAlpha: 1, x: 0, scale: 1, stagger: 0.11, duration: 0.24 }, 0.14)
        .to([title, track, ...dots], { autoAlpha: 0, y: -24, duration: 0.16 }, 0.82)
        .to(cards, { autoAlpha: 0, y: -46, stagger: 0.025, duration: 0.18 }, 0.82);
    }, element);

    return () => context.revert();
  }, []);

  return (
    <section ref={section} id="timeline" className="timeline-section" aria-labelledby="timeline-title">
      <div className="timeline-stage">
        <div className="timeline-stars" aria-hidden="true" />
        <h2 id="timeline-title" className="timeline-title" data-timeline-title>
          Timeline
        </h2>

        <div className="timeline-track" data-timeline-track aria-hidden="true" />
        <div className="timeline-events">
          {TIMELINE_EVENTS.map((event, index) => (
            <article
              key={event.title}
              className={`timeline-event timeline-event--${index % 2 === 0 ? "left" : "right"}`}
            >
              <span className="timeline-dot" data-timeline-dot aria-hidden="true">
                <span />
              </span>
              <div className="timeline-card" data-timeline-card>
                <div className="timeline-card__content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <time>
                    {event.date}
                    <span>{event.time}</span>
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
