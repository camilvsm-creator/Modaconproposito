"use client";

import { useState, type ReactNode } from "react";

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
}: ModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={triggerVariant} size="sm" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className={cn("w-full rounded-xl bg-white p-5 shadow-xl", sizeClasses[size])}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
                {description ? <p className="mt-2 text-sm text-stone-600">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
