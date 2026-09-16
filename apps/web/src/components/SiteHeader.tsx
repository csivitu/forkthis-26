"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionQuery } from "@/hooks/use-session";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedDialog } from "@/components/ui/ThemedDialog";
import { authClient, signInWithGoogle } from "@/lib/auth-client";
import { MobileMenu } from "./landing/navigation/MobileMenu";
import { SiteScrollbar } from "./landing/navigation/SiteScrollbar";

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

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const forceTimeline = pathname !== "/";
  const session = useSessionQuery();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Sign-out failed");
    },
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData(["session"], null);
      router.replace("/");
    },
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [timelineActive, setTimelineActive] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const startLogin = useCallback(async () => {
    closeMenu();
    setLoginError(null);
    setLoginOpen(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Cannot reach the API.");
    }
  }, [closeMenu]);

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
  }, [pathname]);


  const effectiveTimeline = Boolean(forceTimeline) || timelineActive;
  const anchorPrefix = Boolean(forceTimeline) && !timelineActive ? "/" : "";
  return (
    <header
      className={`site-header${effectiveTimeline ? " site-header--timeline" : ""}${
        menuOpen ? " site-header--menu-open" : ""
      }`}
    >
      <nav className="site-nav" aria-label="Primary navigation">
        <div className="site-nav__links site-nav__links--left">
          <a href={`${anchorPrefix}#home`}>Home</a>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div className="site-nav__links site-nav__links--right">
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/resources">Resources</Link>
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

      {session.data ? (
        <button type="button" className="site-login" disabled={logout.isPending} onClick={() => logout.mutate()}>
          <NavPanelShape className="site-login__shape" />
          <span className="site-login__label">{logout.isPending ? "Logging out…" : "Logout"}</span>
        </button>
      ) : (
        <button type="button" className="site-login" onClick={() => void startLogin()}>
          <NavPanelShape className="site-login__shape" />
          <span className="site-login__label">Log in</span>
        </button>
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

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        onAuthAction={session.data ? () => { closeMenu(); logout.mutate(); } : () => void startLogin()}
        authLabel={session.data ? "Logout" : "Log in"}
        authPending={logout.isPending}
      />

      {logout.error ? (
        <ThemedDialog eyebrow="Authentication" title="Logout failed" description={logout.error.message} onClose={() => logout.reset()}>
          <button type="button" className="launch-soon__button" disabled={logout.isPending} onClick={() => logout.mutate()}>Retry</button>
        </ThemedDialog>
      ) : null}

      {loginOpen ? (
        <ThemedDialog
          eyebrow="Authentication sequence"
          title={loginError ? "Connection Failed" : "Opening Google"}
          description={loginError ?? "Preparing Google sign-in. GitHub linking follows next."}
          onClose={closeLogin}
        >
          {loginError ? (
            <button type="button" className="launch-soon__button" onClick={() => void startLogin()}>
              Retry
            </button>
          ) : null}
        </ThemedDialog>
      ) : null}

      <SiteScrollbar />
    </header>
  );
}
