"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type UploadResult = {
  added: number;
  alreadyExisted: number;
  invalid: string[];
} | { error: string };

type SessionWithRole = {
  user: { role?: string | null };
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  .replace(/\/api\/auth\/?$/, "");

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data) {
        router.replace("/login");
        return;
      }

      if ((data as typeof data & SessionWithRole).user.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    });
  }, [router]);

  async function handleUpload() {
    if (!csvFile) {
      fileInputRef.current?.click();
      return;
    }

    setUploading(true);
    setUploadResult(null);
    const form = new FormData();
    form.append("file", csvFile);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/participants/upload-csv`,
        { method: "POST", body: form, credentials: "include" },
      );
      const data = await res.json();
      setUploadResult(res.ok ? data.data : { error: data.error });
    } catch {
      setUploadResult({ error: "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-950">
      <section className="mx-auto mt-12 w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Admin dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Upload participants</h1>
        <p className="mt-1 text-sm text-zinc-500">
          CSV must have a &quot;Registration Number&quot; column, or reg numbers directly in the first column.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-600">
            {csvFile?.name ?? "No CSV selected"}
          </span>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>

        {uploadResult && !("error" in uploadResult) && (
          <p className="mt-4 text-sm text-green-700">
            Added {uploadResult.added}, {uploadResult.alreadyExisted} already existed
            {uploadResult.invalid.length > 0 &&
              `, ${uploadResult.invalid.length} invalid: ${uploadResult.invalid.slice(0, 3).join(", ")}`}
          </p>
        )}
        {"error" in (uploadResult ?? {}) && (
          <p className="mt-4 text-sm text-red-600">{(uploadResult as { error: string }).error}</p>
        )}
      </section>
    </main>
  );
}
