"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";
import { useSessionQuery } from "@/hooks/use-session";

function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/leaderboard";
}

function findAnchor(element: Element | null): HTMLAnchorElement | null {
  return element?.closest<HTMLAnchorElement>("a[href]") ?? null;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSessionQuery();
  const protectedRoute = isProtectedPath(pathname);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    function guardProtectedLink(event: globalThis.MouseEvent) {
      const anchor = findAnchor(event.target instanceof Element ? event.target : null);
      const href = anchor?.getAttribute("href");
      if (!href) return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin || !isProtectedPath(url.pathname)) return;
      if (session.data) return;

      event.preventDefault();
      setDialogOpen(true);
    }

    document.addEventListener("click", guardProtectedLink, true);
    return () => document.removeEventListener("click", guardProtectedLink, true);
  }, [pathname, session.data]);

  useEffect(() => {
    if (!protectedRoute || session.isPending || session.data) return;

    const frame = window.requestAnimationFrame(() => {
      setDialogOpen(true);
      router.replace("/");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [protectedRoute, router, session.data, session.isPending]);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  if (protectedRoute && !session.data) {
    return (
      <main className="launch-soon" role="status">
        Checking your session…
      </main>
    );
  }

  return (
    <>
      {children}
      {dialogOpen ? (
        <ThemedDialog
          eyebrow="Access locked"
          title="Sign in required"
          description="Please login to access this resource."
          onClose={closeDialog}
        >
          <Link href="/login" className="launch-soon__button inline-flex items-center justify-center">
            Sign in
          </Link>
        </ThemedDialog>
      ) : null}
    </>
  );
}
