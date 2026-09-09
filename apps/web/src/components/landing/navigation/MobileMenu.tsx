"use client";

import { useEffect } from "react";
import Link from "next/link";

const MOBILE_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "/login", label: "Log in" },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
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
        {MOBILE_LINKS.map((link) => (
          link.href.startsWith("/") ? (
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
