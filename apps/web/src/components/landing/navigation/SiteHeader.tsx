"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { SiteScrollbar } from "./SiteScrollbar";


export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timelineActive, setTimelineActive] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const timeline = document.getElementById("timeline");
      const bounds = timeline?.getBoundingClientRect();
      const active = Boolean(bounds && bounds.top <= 1 && bounds.bottom > 1);
      setTimelineActive((current) => (current === active ? current : active));
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
    <header
      className={`site-header${timelineActive ? " site-header--timeline" : ""}${
        menuOpen ? " site-header--menu-open" : ""
      }`}
    >
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#resources">Resources</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#leaderboard">Leaderboard</a>
      </nav>

      <nav className="timeline-nav" aria-label="Timeline navigation">
        <div className="timeline-nav__links timeline-nav__links--left">
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
        </div>
        <a className="timeline-nav__brand" href="#home" aria-label="Fork This home">
          <Image
            src="/assets/nav-logo.png"
            alt=""
            width={146}
            height={21}
            priority
            className="timeline-nav__logo"
          />
        </a>
        <div className="timeline-nav__links timeline-nav__links--right">
          <a href="#leaderboard">Leaderboard</a>
          <a href="#resources">Resources</a>
        </div>
      </nav>

      <a className="site-login" href="/login">
        Log in
      </a>

      <div className={`mobile-header${menuOpen ? " mobile-header--open" : ""}`}>
        <a
          className="mobile-header__brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Fork This home"
        >
          <Image
            src="/assets/nav-logo.png"
            alt=""
            width={146}
            height={21}
            priority
            className="mobile-header__logo"
          />
        </a>
        <button
          type="button"
          className="mobile-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />

      <SiteScrollbar />
    </header>
  );
}
