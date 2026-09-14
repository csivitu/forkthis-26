"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  githubUsername?: string | null;
  githubId?: string | null;
  role?: string | null;
};

type SessionState = {
  user: DashboardUser;
};

export default function DashboardPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authClient.getSession().then(({ data }) => {
      if (!active) return;
      setSession((data as SessionState | null) ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center">Loading account...</main>;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p>You are not signed in.</p>
        <Link className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white" href="/login">
          Return to login
        </Link>
      </main>
    );
  }

  const user = session.user;
  const githubLinked = Boolean(user.githubUsername || user.githubId);

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <section className="mx-auto mt-12 w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Temporary dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Account details</h1>

        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">Name</dt>
            <dd>{user.name ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Email</dt>
            <dd>{user.email ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Role</dt>
            <dd>{user.role ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">GitHub username</dt>
            <dd>{user.githubUsername ?? "Not linked"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">GitHub ID</dt>
            <dd>{user.githubId ?? "Not linked"}</dd>
          </div>
        </dl>

        <p className={`mt-6 text-sm ${githubLinked ? "text-green-700" : "text-amber-700"}`}>
          {githubLinked ? "GitHub account linked." : "GitHub account is not linked."}
        </p>
      </section>

    </main>
  );
}
