"use client";

import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export interface CopyCodeButtonProps {
  value: string;
}

export function CopyCodeButton({ value }: CopyCodeButtonProps) {
  const [state, setState] = useState<CopyState>("idle");

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
        ? "Copy failed"
        : "Copy code";

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
