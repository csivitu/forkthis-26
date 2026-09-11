"use client";

import { useEffect } from "react";
import Link from "next/link";

const LOCKED_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "/resources", label: "Resources" },
  { href: "/login", label: "Log in" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => Promise<void>;
  landingOnly: boolean;
}

export function MobileMenu({ open, onClose, onLogin, landingOnly }: MobileMenuProps) {
  function openLockedSection() {
    onClose();
    window.dispatchEvent(new Event("launch-locked"));
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  return (
    <div
      id="mobile-navigation"
      className={`mobile-menu${open ? " mobile-menu--open" : ""}`}
      aria-hidden={!open}
    >
      <span className="mobile-menu__cross mobile-menu__cross--left" aria-hidden="true" />
      <span className="mobile-menu__cross mobile-menu__cross--right" aria-hidden="true" />
      <nav className="mobile-menu__links" aria-label="Mobile navigation">
        {LOCKED_LINKS.map((link) => (
          landingOnly && link.href !== "#home" ? (
            <button key={link.href} type="button" onClick={openLockedSection} tabIndex={open ? 0 : -1}>
              <span>{link.label}</span>
            </button>
          ) : link.href === "/login" ? (
            <button key={link.href} type="button" onClick={() => void onLogin()} tabIndex={open ? 0 : -1}>
              <span>{link.label}</span>
            </button>
          ) : link.href.startsWith("/") ? (
            <Link key={link.href} href={link.href} onClick={onClose} tabIndex={open ? 0 : -1}>
              <span>{link.label}</span>
            </Link>
          ) : (
            <a key={link.href} href={link.href} onClick={onClose} tabIndex={open ? 0 : -1}>
              <span>{link.label}</span>
            </a>
          )
        ))}
      </nav>
      <div className="mobile-menu__footer" aria-hidden="true">
        <span>CSI VIT</span>
        <span>FORKTHIS // 2026</span>
      </div>
    </div>
  );
}
