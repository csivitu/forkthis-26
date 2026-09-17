"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export interface CopyCodeButtonProps {
  value: string;
}

export function CopyCodeButton({ value }: CopyCodeButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;

    const resetTimer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(resetTimer);
  }, [state]);

  const copyCode = (): void => {
    void navigator.clipboard.writeText(value).then(
      () => setState("copied"),
      (error: Error) => {
        console.error(`Failed to copy code block: ${error.message}`, error);
        setState("failed");
      },
    );
  };

  const label =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Failed"
        : "Copy";

  return (
    <button
      type="button"
      data-slot="markdown-copy-code"
      data-state={state}
      aria-live="polite"
      onClick={copyCode}
    >
      {label}
    </button>
  );
}
