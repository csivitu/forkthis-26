"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "AUTH_ERROR";
  const message = searchParams.get("message") ?? "Authentication could not be completed.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 font-sans text-zinc-950">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-red-700">Authentication error</p>
        <h1 className="mt-2 text-2xl font-semibold">We could not complete sign-in</h1>
        <p className="mt-3 text-sm text-zinc-600">{message}</p>
        <p className="mt-2 text-xs text-zinc-500">Code: {error}</p>
        <Link
          className="mt-6 inline-block rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700"
          href="/login"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6" />}> 
      <AuthErrorContent />
    </Suspense>
  );
}
