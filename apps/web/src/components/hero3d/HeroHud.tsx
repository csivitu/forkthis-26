"use client";

import { useEffect, useRef } from "react";

function SiteScrollbar() {
  const thumb = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const element = thumb.current;
      const rail = element?.parentElement;
      if (!element || !rail) return;

      const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maximumScroll > 0 ? window.scrollY / maximumScroll : 0;
      const maximumTravel = rail.clientHeight - element.offsetHeight;
      element.style.transform = `translateY(${Math.max(0, Math.min(1, progress)) * maximumTravel}px)`;
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="site-scrollbar" aria-hidden="true">
      <span className="site-scrollbar__shell" />
      <span className="site-scrollbar__cap site-scrollbar__cap--start" />
      <span className="site-scrollbar__cap site-scrollbar__cap--end" />
      <span className="site-scrollbar__rail">
        <span ref={thumb} className="site-scrollbar__thumb" />
      </span>
    </div>
  );
}

export function HeroHud() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#resources">Resources</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#leaderboard">Leaderboard</a>
      </nav>

      <a className="site-login" href="/login">
        Log in
      </a>
      <SiteScrollbar />
    </header>
  );
}
