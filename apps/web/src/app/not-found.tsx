"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";

export default function NotFound() {
  const router = useRouter();
  const goBack = useCallback(() => router.push("/"), [router]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow="Navigation error // 404"
        title="Signal Not Found"
        description="That destination is outside the known flight path."
        onClose={goBack}
      >
        <button type="button" className="launch-soon__button" onClick={goBack}>
          Go Back
        </button>
      </ThemedDialog>
    </main>
  );
}
