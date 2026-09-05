"use client";

import Image from "next/image";
export function HeroHud() {
  return (
    <header className="hero-navbar">
      <nav className="hero-navbar__nav" aria-label="Primary navigation">
        <div className="hero-navbar__layout">
          <div className="hero-navbar__links hero-navbar__links--left">
            <a className="hero-nav-link" href="#home">
              Home
            </a>
            <a className="hero-nav-link" href="#dashboard">
              Dashboard
            </a>
          </div>

          <a className="hero-navbar__brand" href="#home" aria-label="Fork This home">
            <Image
              src="/assets/nav-logo.png"
              alt=""
              width={146}
              height={21}
              priority
              className="hero-navbar__brand-image"
            />
          </a>

          <div className="hero-navbar__links hero-navbar__links--right">
            <a className="hero-nav-link" href="#leaderboard">
              Leaderboard
            </a>
            <a className="hero-nav-link" href="#resources">
              Resources
            </a>
          </div>
        </div>
      </nav>

      <a className="hero-navbar__login" href="/login">
        Login
      </a>
    </header>
  );
}
