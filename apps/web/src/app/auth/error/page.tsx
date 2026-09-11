"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { ThemedDialog } from "@/components/ui/ThemedDialog";

const PARTICIPANT_ERROR_CODES = new Set(["signup_disabled", "not_a_participant"]);

function getAuthErrorContent(error: string, providerMessage: string) {
  if (PARTICIPANT_ERROR_CODES.has(error)) {
    return {
      title: "Not on Participant List",
      description:
        "You're not on the ForkThis'26 participant list. Please contact CSI-VIT if you believe this is a mistake.",
    };
  }

  return {
    title: "Sign-in Failed",
    description: providerMessage,
  };
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error") ?? "AUTH_ERROR";
  const providerMessage =
    searchParams.get("error_description") ??
    searchParams.get("message") ??
    "Authentication could not be completed.";
  const content = getAuthErrorContent(error, providerMessage);
  const goBack = useCallback(() => router.push("/"), [router]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow={`Authentication error // ${error}`}
        title={content.title}
        description={content.description}
        onClose={goBack}
      >
        <button type="button" className="launch-soon__button" onClick={goBack}>
          Go Back
        </button>
      </ThemedDialog>
    </main>
  );
}

function AuthErrorFallback() {
  const router = useRouter();
  const goBack = useCallback(() => router.push("/"), [router]);

  return (
    <main className="launch-soon">
      <ThemedDialog
        eyebrow="Authentication sequence"
        title="Reading Signal"
        description="Recovering the authentication status."
        onClose={goBack}
      >
        {null}
      </ThemedDialog>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorContent />
    </Suspense>
  );
}
