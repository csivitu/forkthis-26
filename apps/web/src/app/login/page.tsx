"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ParticipantStatus = {
  authenticated: boolean;
  email?: string;
  participantFound?: boolean;
};

export default function LoginPage() {
  const [status, setStatus] = useState<ParticipantStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/debug/participant-status`, {
        credentials: "include",
      });
      const data = (await response.json()) as ParticipantStatus;

      if (!response.ok && response.status !== 401) {
        throw new Error("Could not check participant status.");
      }
      setStatus(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function signInWithGoogle() {
    setError(null);
    setSigningIn(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in/social`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", callbackURL: `${window.location.origin}/login` }),
      });
      const data = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !data.url) {
        setError(data.message ?? `Google sign-in failed (${response.status}).`);
        return;
      }

      window.location.assign(data.url);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Cannot reach the API: ${requestError.message}`
          : "Cannot reach the API.",
      );
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 font-sans text-zinc-950">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Temporary auth check</p>
        <h1 className="mt-2 text-2xl font-semibold">Participant access</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in with Google to check whether your email exists in SQLite.
        </p>

        {loading ? <p className="mt-6 text-sm text-zinc-500">Checking session...</p> : null}

        {!loading && !status?.authenticated ? (
          <button
            className="mt-6 w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700"
            onClick={() => void signInWithGoogle()}
            disabled={signingIn}
          >
            {signingIn ? "Connecting..." : "Continue with Google"}
          </button>
        ) : null}

        {status?.authenticated ? (
          <div className="mt-6 space-y-3 rounded-lg bg-zinc-50 p-4 text-sm">
            <p>
              Signed in as <strong>{status.email}</strong>
            </p>
            <p className={status.participantFound ? "text-green-700" : "text-red-700"}>
              SQLite participant: <strong>{status.participantFound ? "FOUND" : "NOT FOUND"}</strong>
            </p>
            <button className="text-sm underline" onClick={() => void loadStatus()}>
              Check again
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}
