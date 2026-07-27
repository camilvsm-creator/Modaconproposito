"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ModalProps = {
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  triggerVariant?: "primary" | "secondary" | "ghost";
  triggerClassName?: string;
  size?: "md" | "lg" | "xl";
  onOpen?: () => void;
  /** Deprecated: native server action forms must stay mounted while submitting. */
  closeOnSubmit?: boolean;
};

const sizeClasses = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  triggerLabel,
  title,
  description,
  children,
  triggerVariant = "secondary",
  triggerClassName,
  size = "lg",
  onOpen,
}: ModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = `modal-title-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button type="button" variant={triggerVariant} size="sm" className={triggerClassName} onClick={() => { setOpen(true); onOpen?.(); }}>
        {triggerLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn("flex max-h-[calc(100dvh-0.5rem)] w-full flex-col overflow-hidden rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-28px_rgba(31,26,23,0.65)] ring-1 ring-gray-200 sm:max-h-[min(760px,calc(100dvh-3rem))] sm:rounded-xl sm:p-6 sm:shadow-[0_24px_70px_-38px_rgba(31,26,23,0.7)]", sizeClasses[size])}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>
                {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Cerrar
              </button>
            </div>

            <div className="admin-modal-content mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
