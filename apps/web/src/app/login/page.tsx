"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setSigningIn(true);

    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth/link-github`,
      });

      if (signInError) {
        setError(signInError.message ?? "Google sign-in failed.");
        setSigningIn(false);
      }
      // on success, the browser navigates away to Google — nothing else runs
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Cannot reach the API: ${requestError.message}`
          : "Cannot reach the API.",
      );
      setSigningIn(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 font-sans text-zinc-950">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Participant access</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in with Google to continue.
        </p>

        <button
          className="mt-6 w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          onClick={() => void signInWithGoogle()}
          disabled={signingIn}
        >
          {signingIn ? "Connecting..." : "Continue with Google"}
        </button>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}