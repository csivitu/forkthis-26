"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const goBack = useCallback(() => router.push("/"), [router]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow={error.digest ? `System error // ${error.digest}` : "System error"}
        title="Mission Interrupted"
        description="Something failed while loading this section."
        onClose={goBack}
      >
        <button type="button" className="launch-soon__button" onClick={reset}>
          Retry
        </button>
      </ThemedDialog>
    </main>
  );
}
