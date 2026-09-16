import type { TOCItemType } from "@repo/markdown/toc";

function OutlineLinks({ toc }: { toc: TOCItemType[] }) {
  return (
    <div className="docs-outline__links">
      {toc.map((item) => (
        <a
          key={item.url}
          href={item.url}
          className="docs-outline__link"
          style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 14}px` }}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}

export function DocumentationDesktopOutline({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;

  return (
    <aside
      className="docs-outline docs-outline--desktop"
      aria-label="On this page"
    >
      <p>On this page</p>
      <OutlineLinks toc={toc} />
    </aside>
  );
}

export function DocumentationMobileOutline({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;

  return (
    <details className="docs-outline-mobile">
      <summary>On this page</summary>
      <OutlineLinks toc={toc} />
    </details>
  );
}
