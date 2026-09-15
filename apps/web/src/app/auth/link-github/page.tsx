"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemedDialog } from "@/components/ui/ThemedDialog";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import type { Session } from "@/lib/api-types";

export default function LinkGithubPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const startedLink = useRef(false);

  const linkGithub = useCallback(async () => {
    setError(null);

    try {
      const { data: session } = await apiClient.get<Session | null>("/api/auth/get-session");

      if (!session) {
        router.replace("/login");
        return;
      }

      if (session.user.githubId) {
        router.replace("/dashboard");
        return;
      }

      const { error: linkError } = await authClient.linkSocial({
        provider: "github",
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (linkError) {
        if (linkError.code === "not_a_participant") {
          setError("You're not registered as a participant.");
        } else {
          setError(linkError.message ?? "Something went wrong linking GitHub.");
        }
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Cannot reach the authentication service.",
      );
    }
  }, [router]);

  useEffect(() => {
    if (startedLink.current) return;
    startedLink.current = true;
    void linkGithub();
  }, [linkGithub]);

  const goBack = useCallback(() => router.push("/"), [router]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow="Authentication sequence"
        title={error ? "Connection Failed" : "Opening GitHub"}
        description={error ?? "Google verified. Connecting your GitHub account next."}
        onClose={goBack}
      >
        {error ? (
          <button type="button" className="launch-soon__button" onClick={() => void linkGithub()}>
            Retry
          </button>
        ) : null}
      </ThemedDialog>
    </main>
  );
}
