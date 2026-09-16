"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpenTextIcon, MenuIcon, XIcon } from "lucide-react";

export interface ResourceNavigationItem {
  name: string;
  url: string;
}

function NavigationLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: ResourceNavigationItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Documentation sections" className="docs-nav__links">
      {items.map((item, index) => (
        <Link
          key={item.url}
          href={item.url}
          aria-current={pathname === item.url ? "page" : undefined}
          className="docs-nav__link"
          onClick={onNavigate}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

export function ResourceNavigation({
  items,
}: {
  items: ResourceNavigationItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = (): void => setOpen(false);

  return (
    <>
      <aside className="docs-nav docs-nav--desktop">
        <p className="docs-nav__eyebrow">Navigation</p>
        <NavigationLinks items={items} pathname={pathname} onNavigate={close} />
      </aside>

      <div className="docs-nav-mobile">
        <button
          type="button"
          className="docs-nav-mobile__trigger"
          aria-expanded={open}
          aria-controls="docs-mobile-navigation"
          onClick={() => setOpen(true)}
        >
          <MenuIcon aria-hidden="true" />
          Documentation Navigation
        </button>
        {open ? (
          <>
            <button
              type="button"
              className="docs-nav-mobile__backdrop"
              aria-label="Close documentation navigation"
              onClick={close}
            />
            <aside
              id="docs-mobile-navigation"
              className="docs-nav-mobile__sheet"
              aria-label="Documentation navigation"
            >
              <div className="docs-nav-mobile__header">
                <div>
                  <p className="docs-nav__eyebrow">Navigation</p>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={close}
                >
                  <XIcon />
                </button>
              </div>
              <BookOpenTextIcon
                className="docs-nav-mobile__mark"
                aria-hidden="true"
              />
              <NavigationLinks
                items={items}
                pathname={pathname}
                onNavigate={close}
              />
            </aside>
          </>
        ) : null}
      </div>
    </>
  );
}
