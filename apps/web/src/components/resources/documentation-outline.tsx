"use client";

import type { TOCItemType } from "@repo/markdown/toc";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { findActiveHeadingUrl } from "@/lib/active-heading";

const MIN_HEADING_TOP_OFFSET = 112;
const READING_LINE_RATIO = 0.33;

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
        if (
          ancestors.length === 0 ||
          ancestors.every((element) => element.open)
        ) {
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

interface OutlineTracking {
  activeUrl: string | null;
  progress: number;
}

function useOutlineTracking(toc: TOCItemType[]): OutlineTracking {
  const [tracking, setTracking] = useState<OutlineTracking>({
    activeUrl: toc[0]?.url ?? null,
    progress: 0,
  });

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
        return url && element.getClientRects().length > 0
          ? [{ url, top: element.getBoundingClientRect().top }]
          : [];
      });
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      const readingLine = Math.max(
        MIN_HEADING_TOP_OFFSET,
        window.innerHeight * READING_LINE_RATIO,
      );
      const activeUrl = findActiveHeadingUrl(headings, readingLine, atPageEnd);

      let progress = 0;
      if (atPageEnd && headings.length > 1) {
        progress = 1;
      } else if (headings.length > 1) {
        const activeIndex = Math.max(
          0,
          headings.findLastIndex((heading) => heading.top <= readingLine),
        );
        const nextHeading = headings[activeIndex + 1];
        if (nextHeading) {
          const currentTop = headings[activeIndex].top;
          const distance = nextHeading.top - currentTop;
          const sectionProgress =
            distance > 0 ? (readingLine - currentTop) / distance : 0;
          progress =
            (activeIndex + Math.max(0, Math.min(1, sectionProgress))) /
            (headings.length - 1);
        } else {
          progress = activeIndex / (headings.length - 1);
        }
      }

      setTracking((current) =>
        current.activeUrl === activeUrl && current.progress === progress
          ? current
          : { activeUrl, progress },
      );
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

  return tracking;
}

function OutlineScrollProgress({ progress }: { progress: number }) {
  return (
    <span
      className="docs-outline__progress"
      style={{ "--docs-outline-progress": progress } as CSSProperties}
      aria-hidden="true"
    >
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
  const { activeUrl, progress } = useOutlineTracking(visibleToc);
  if (visibleToc.length === 0) return null;

  return (
    <aside
      className="docs-outline docs-outline--desktop"
      aria-label="On this page"
    >
      <p>On this page</p>
      <div className="docs-outline__body">
        <OutlineScrollProgress progress={progress} />
        <OutlineLinks toc={visibleToc} activeUrl={activeUrl} />
      </div>
    </aside>
  );
}

export function DocumentationMobileOutline({ toc }: { toc: TOCItemType[] }) {
  const visibleToc = useVisibleToc(toc);
  const { activeUrl } = useOutlineTracking(visibleToc);
  if (visibleToc.length === 0) return null;

  return (
    <details className="docs-outline-mobile">
      <summary>On this page</summary>
      <OutlineLinks toc={visibleToc} activeUrl={activeUrl} />
    </details>
  );
}
