"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

const MOBILE_LINKS = [
  { href: "#resources", label: "Resources" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "/login", label: "Log in" },
] as const;

export function HeroHud() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);


  return (
    <header className={`site-header${menuOpen ? " site-header--menu-open" : ""}`}>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#resources">Resources</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#leaderboard">Leaderboard</a>
      </nav>

      <a className="site-login" href="/login">
        Log in
      </a>

      <div className={`mobile-header${menuOpen ? " mobile-header--open" : ""}`}>
        <a
          className="mobile-header__brand"
          href="#home"
          onClick={() => setMenuOpen(false)}
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

      <div
        id="mobile-navigation"
        className={`mobile-menu${menuOpen ? " mobile-menu--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <span className="mobile-menu__cross mobile-menu__cross--left" aria-hidden="true" />
        <span className="mobile-menu__cross mobile-menu__cross--right" aria-hidden="true" />
        <nav className="mobile-menu__links" aria-label="Mobile navigation">
          {MOBILE_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="mobile-menu__footer" aria-hidden="true">
          <span>CSI VIT</span>
          <span>FORKTHIS // 2026</span>
        </div>
      </div>

      <SiteScrollbar />
    </header>
  );
}
