"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

export interface ThemedDialogProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
}

export function ThemedDialog({
  eyebrow,
  title,
  description,
  children,
  onClose,
}: ThemedDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;

    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="launch-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="launch-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div ref={dialogRef} className="launch-soon__panel launch-modal__panel" tabIndex={-1}>
        <p className="launch-soon__eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p className="launch-soon__copy">{description}</p>
        {children}
      </div>
    </div>
  );
}
