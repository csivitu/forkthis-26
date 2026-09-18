"use client";

import type { TOCItemType } from "@repo/markdown/toc";
import { useEffect, useRef, useState } from "react";
import { findActiveHeadingUrl } from "@/lib/active-heading";

const HEADING_TOP_OFFSET = 112;

function headingId(url: string): string | null {
  if (!url.startsWith("#")) return null;
  return decodeURIComponent(url.slice(1));
}

function useVisibleToc(toc: TOCItemType[]): TOCItemType[] {
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const details = Array.from(
      document.querySelectorAll<HTMLDetailsElement>(".docs-markdown details"),
    );

    const update = () => {
      const visibleItems = new Set<string>();
      for (const item of toc) {
        const id = headingId(item.url);
        const heading = id ? document.getElementById(id) : null;
        let parent = heading?.parentElement;
        const ancestors: HTMLDetailsElement[] = [];
        while (parent) {
          if (parent instanceof HTMLDetailsElement) ancestors.push(parent);
          parent = parent.parentElement;
        }
        if (ancestors.length === 0 || ancestors.every((element) => element.open)) {
          visibleItems.add(item.url);
        }
      }
      setOpenItems(visibleItems);
    };

    details.forEach((element) => element.addEventListener("toggle", update));
    update();
    return () =>
      details.forEach((element) =>
        element.removeEventListener("toggle", update),
      );
  }, [toc]);

  return toc.filter((item) => item.depth <= 2 || openItems.has(item.url));
}

function useActiveHeading(toc: TOCItemType[]): string | null {
  const [activeUrl, setActiveUrl] = useState<string | null>(toc[0]?.url ?? null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const tocById = new Map(
        toc.flatMap((item) => {
          const id = headingId(item.url);
          return id ? [[id, item.url] as const] : [];
        }),
      );
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".docs-markdown h2[id], .docs-markdown h3[id]",
        ),
      ).flatMap((element) => {
        const url = tocById.get(element.id);
        return url ? [{ url, top: element.getBoundingClientRect().top }] : [];
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
  const visibleToc = useVisibleToc(toc);
  const activeUrl = useActiveHeading(visibleToc);
  if (visibleToc.length === 0) return null;

  return (
    <aside
      className="docs-outline docs-outline--desktop"
      aria-label="On this page"
    >
      <p>On this page</p>
      <div className="docs-outline__body">
        <OutlineScrollProgress />
        <OutlineLinks toc={visibleToc} activeUrl={activeUrl} />
      </div>
    </aside>
  );
}

export function DocumentationMobileOutline({ toc }: { toc: TOCItemType[] }) {
  const visibleToc = useVisibleToc(toc);
  const activeUrl = useActiveHeading(visibleToc);
  if (visibleToc.length === 0) return null;

  return (
    <details className="docs-outline-mobile">
      <summary>On this page</summary>
      <OutlineLinks toc={visibleToc} activeUrl={activeUrl} />
    </details>
  );
}
