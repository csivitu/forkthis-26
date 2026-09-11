"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";
import { signInWithGoogle } from "@/lib/auth-client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const startedSignIn = useRef(false);

  const startSignIn = useCallback(async () => {
    setError(null);

    try {
      await signInWithGoogle();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Cannot reach the API: ${requestError.message}`
          : "Cannot reach the API.",
      );
    }
  }, []);

  useEffect(() => {
    if (startedSignIn.current) return;
    startedSignIn.current = true;
    void startSignIn();
  }, [startSignIn]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow="Authentication sequence"
        title={error ? "Connection Failed" : "Opening Google"}
        description={error ?? "Preparing Google sign-in. GitHub linking follows next."}
        onClose={() => window.history.back()}
      >
        {error ? (
          <button
            className="launch-soon__button"
            onClick={() => void startSignIn()}
          >
            Retry
          </button>
        ) : null}
      </ThemedDialog>
    </main>
  );
}
