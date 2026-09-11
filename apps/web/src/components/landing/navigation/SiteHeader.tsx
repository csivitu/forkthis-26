"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { SiteScrollbar } from "./SiteScrollbar";

const NAV_PANEL_PATH =
  "M 14 0 H 251 Q 265 0 265 14 L 246 58 Q 240 74.5 223 74.5 H 42 Q 25 74.5 19 58 L 0 14 Q 0 0 14 0 Z";

function NavPanelShape({ className }: { className?: string }) {
  return (
    <svg
      className={`nav-panel-shape${className ? ` ${className}` : ""}`}
      viewBox="0 0 265 74.5"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={NAV_PANEL_PATH} />
    </svg>
  );
}

const MOBILE_HEADER_PANEL_PATH = "M 0 0 H 113 Q 125 0 121 11 L 111 44 Q 107 54 97 54 H 0 Z";

function MobileHeaderPanel({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={`mobile-header__panel mobile-header__panel--${side}`}
      viewBox="0 0 125 54"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={MOBILE_HEADER_PANEL_PATH} />
    </svg>
  );
}

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
      const footerStart = document.querySelector<HTMLElement>("[data-nav-logo-exit]");
      const timelineBounds = timeline?.getBoundingClientRect();
      const footerBounds = footerStart?.getBoundingClientRect();
      const footerExitLine = window.innerHeight * 0.75;
      const active = Boolean(
        timelineBounds &&
          timelineBounds.top <= 1 &&
          (!footerBounds || footerBounds.top > footerExitLine),
      );
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
        <div className="site-nav__links site-nav__links--left">
          <a href={`${anchorPrefix}#home`}>Home</a>
          {landingOnly ? (
            <button type="button" onClick={openLockedSection}>Dashboard</button>
          ) : (
            <a href={`${anchorPrefix}#dashboard`}>Dashboard</a>
          )}
        </div>
        <div className="site-nav__links site-nav__links--right">
          {landingOnly ? (
            <>
              <button type="button" onClick={openLockedSection}>
                Leaderboard
              </button>
              <button type="button" onClick={openLockedSection}>
                Resources
              </button>
            </>
          ) : (
            <>
              <a href={`${anchorPrefix}#leaderboard`}>Leaderboard</a>
              <Link href="/resources">Resources</Link>
            </>
          )}
        </div>
      </nav>

      <div className="timeline-nav">
        <a
          className="timeline-nav__brand"
          href={`${anchorPrefix}#home`}
          aria-label="Fork This home"
        >
          <NavPanelShape />
          <Image
            src="/assets/nav-logo.svg"
            alt=""
            width={146}
            height={21}
            priority
            className="timeline-nav__logo"
          />
        </a>
      </div>

      {landingOnly ? (
        <button type="button" className="site-login" onClick={openLockedSection}>
          <NavPanelShape className="site-login__shape" />
          <span className="site-login__label">Log in</span>
        </button>
      ) : (
        <a className="site-login" href="/login">
          <NavPanelShape className="site-login__shape" />
          <span className="site-login__label">Log in</span>
        </a>
      )}

      <div className={`mobile-header${menuOpen ? " mobile-header--open" : ""}`}>
        <MobileHeaderPanel side="left" />
        <MobileHeaderPanel side="right" />
        <a
          className="mobile-header__brand"
          href={`${anchorPrefix}#home`}
          onClick={closeMenu}
          aria-label="Fork This home"
        >
          <Image
            src="/assets/nav-logo.svg"
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
