"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LinkGithubPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: session } = await authClient.getSession();

      if (!session) {
        router.replace("/login");
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
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 font-sans text-zinc-950">
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : (
        <p className="text-sm text-zinc-500">Connecting your GitHub account…</p>
      )}
    </main>
  );
}