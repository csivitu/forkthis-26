"use client";

import type { TOCItemType } from "@repo/markdown/toc";
import { useEffect, useRef, useState } from "react";
import { findActiveHeadingUrl } from "@/lib/active-heading";

const HEADING_TOP_OFFSET = 112;

function headingId(url: string): string | null {
  if (!url.startsWith("#")) return null;
  return decodeURIComponent(url.slice(1));
}

function useActiveHeading(toc: TOCItemType[]): string | null {
  const [activeUrl, setActiveUrl] = useState<string | null>(toc[0]?.url ?? null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const headings = toc.flatMap((item) => {
        const id = headingId(item.url);
        const element = id ? document.getElementById(id) : null;
        return element ? [{ url: item.url, top: element.getBoundingClientRect().top }] : [];
      });
      const atPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const nextUrl = findActiveHeadingUrl(headings, HEADING_TOP_OFFSET, atPageEnd);
      setActiveUrl((currentUrl) => (currentUrl === nextUrl ? currentUrl : nextUrl));
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [toc]);

  return activeUrl;
}

function OutlineScrollProgress() {
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const element = progress.current;
      if (!element) return;

      const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;
      const value = maximumScroll > 0 ? window.scrollY / maximumScroll : 0;
      element.style.setProperty(
        "--docs-outline-progress",
        String(Math.max(0, Math.min(1, value))),
      );
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
    <span ref={progress} className="docs-outline__progress" aria-hidden="true">
      <span className="docs-outline__progress-fill" />
      <span className="docs-outline__progress-dot" />
    </span>
  );
}

function OutlineLinks({
  toc,
  activeUrl,
}: {
  toc: TOCItemType[];
  activeUrl: string | null;
}) {
  return (
    <div className="docs-outline__links">
      {toc.map((item) => (
        <a
          key={item.url}
          href={item.url}
          className="docs-outline__link"
          data-active={activeUrl === item.url}
          aria-current={activeUrl === item.url ? "location" : undefined}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}

export function DocumentationDesktopOutline({ toc }: { toc: TOCItemType[] }) {
  const activeUrl = useActiveHeading(toc);
  if (toc.length === 0) return null;

  return (
    <aside
      className="docs-outline docs-outline--desktop"
      aria-label="On this page"
    >
      <p>On this page</p>
      <div className="docs-outline__body">
        <OutlineScrollProgress />
        <OutlineLinks toc={toc} activeUrl={activeUrl} />
      </div>
    </aside>
  );
}

export function DocumentationMobileOutline({ toc }: { toc: TOCItemType[] }) {
  const activeUrl = useActiveHeading(toc);
  if (toc.length === 0) return null;

  return (
    <details className="docs-outline-mobile">
      <summary>On this page</summary>
      <OutlineLinks toc={toc} activeUrl={activeUrl} />
    </details>
  );
}
