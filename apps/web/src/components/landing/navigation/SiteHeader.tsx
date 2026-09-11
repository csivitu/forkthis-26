"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { SiteScrollbar } from "./SiteScrollbar";

function openLockedSection() {
  window.dispatchEvent(new Event("launch-locked"));
}

export function SiteHeader({ forceTimeline }: { forceTimeline?: boolean } = {}) {
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


  const effectiveTimeline = Boolean(forceTimeline) || timelineActive;
  const anchorPrefix = Boolean(forceTimeline) && !timelineActive ? "/" : "";
  const landingOnly = process.env.NEXT_PUBLIC_LAUNCH_MODE === "landing-only";

  return (
    <header
      className={`site-header${effectiveTimeline ? " site-header--timeline" : ""}${
        menuOpen ? " site-header--menu-open" : ""
      }`}
    >
      <nav className="site-nav" aria-label="Primary navigation">
        {landingOnly ? (
          <>
            <button type="button" onClick={openLockedSection}>Resources</button>
            <button type="button" onClick={openLockedSection}>Dashboard</button>
            <button type="button" onClick={openLockedSection}>Leaderboard</button>
          </>
        ) : (
          <>
            <Link href="/resources">Resources</Link>
            <a href="#dashboard">Dashboard</a>
            <a href="#leaderboard">Leaderboard</a>
          </>
        )}
      </nav>

      <nav className="timeline-nav" aria-label="Timeline navigation">
        <div className="timeline-nav__links timeline-nav__links--left">
          <a href={`${anchorPrefix}#home`}>Home</a>
          {landingOnly ? (
            <button type="button" onClick={openLockedSection}>Dashboard</button>
          ) : (
            <a href={`${anchorPrefix}#dashboard`}>Dashboard</a>
          )}
        </div>
        <a className="timeline-nav__brand" href={`${anchorPrefix}#home`} aria-label="Fork This home">
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
          {landingOnly ? (
            <>
              <button type="button" onClick={openLockedSection}>Leaderboard</button>
              <button type="button" onClick={openLockedSection}>Resources</button>
            </>
          ) : (
            <>
              <a href={`${anchorPrefix}#leaderboard`}>Leaderboard</a>
              <Link href="/resources">Resources</Link>
            </>
          )}
        </div>
      </nav>

      {landingOnly ? (
        <button type="button" className="site-login" onClick={openLockedSection}>
          Log in
        </button>
      ) : (
        <a className="site-login" href="/login">
          Log in
        </a>
      )}

      <div className={`mobile-header${menuOpen ? " mobile-header--open" : ""}`}>
        <a
          className="mobile-header__brand"
          href={`${anchorPrefix}#home`}
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

      <MobileMenu open={menuOpen} onClose={closeMenu} landingOnly={landingOnly} />

      <SiteScrollbar />
    </header>
  );
}
