"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";

const LANDING_ONLY_MODE = "landing-only";
const LAUNCH_LOCKED_EVENT = "launch-locked";
const ALLOWED_HASHES = new Set(["", "#home", "#faqs"]);

function isLandingOnlyMode(mode: string | undefined) {
  return mode === LANDING_ONLY_MODE;
}

function isAllowedLandingHref(href: string, origin: string) {
  const url = new URL(href, origin);

  if (url.origin !== origin || url.pathname !== "/") return false;

  return ALLOWED_HASHES.has(url.hash);
}

function findAnchor(element: Element | null) {
  return element?.closest("a[href]");
}

function ComingSoonMessage({ onBack }: { onBack: () => void }) {
  return (
    <section className="launch-soon" aria-labelledby="launch-soon-title">
      <div className="launch-soon__panel">
        <p className="launch-soon__eyebrow">Access locked</p>
        <h1 id="launch-soon-title">Coming Soon</h1>
        <p className="launch-soon__copy">
          This section is still preparing for launch. Check back soon.
        </p>
        <button type="button" className="launch-soon__button" onClick={onBack}>
          Go Back
        </button>
      </div>
    </section>
  );
}

export function LaunchGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const landingOnly = isLandingOnlyMode(process.env.NEXT_PUBLIC_LAUNCH_MODE);

  useEffect(() => {
    if (!landingOnly || pathname !== "/") return;

    function openModal() {
      setModalOpen(true);
    }

    function blockLockedLinks(event: globalThis.MouseEvent) {
      const anchor = findAnchor(event.target instanceof Element ? event.target : null);
      const href = anchor?.getAttribute("href");

      if (!href || isAllowedLandingHref(href, window.location.origin)) return;

      event.preventDefault();
      openModal();
    }

    document.addEventListener("click", blockLockedLinks, true);
    window.addEventListener(LAUNCH_LOCKED_EVENT, openModal);

    return () => {
      document.removeEventListener("click", blockLockedLinks, true);
      window.removeEventListener(LAUNCH_LOCKED_EVENT, openModal);
    };
  }, [landingOnly, pathname]);

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  if (landingOnly && pathname !== "/") {
    return <ComingSoonMessage onBack={goBack} />;
  }

  return (
    <>
      {children}
      {modalOpen ? (
        <ThemedDialog
          eyebrow="Access locked"
          title="Coming Soon"
          description="This section is still preparing for launch. Check back soon."
          onClose={closeModal}
        >
          <button type="button" className="launch-soon__button" onClick={closeModal}>
            Go Back
          </button>
        </ThemedDialog>
      ) : null}
    </>
  );
}
