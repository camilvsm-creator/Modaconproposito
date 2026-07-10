import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl", className)}>{children}</div>;
}

export function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 bg-paper shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
};

const buttonClasses = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary/30",
  secondary:
    "bg-white text-ink ring-1 ring-stone-300 hover:bg-stone-50 focus-visible:ring-black/10",
  ghost:
    "bg-transparent text-primary hover:bg-primary/5 focus-visible:ring-primary/20",
};

export function Button({
  className,
  variant = "primary",
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        buttonClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function LinkButton({
  className,
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        buttonClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function InputShell({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-base font-medium text-stone-900">{label}</span>
      {children}
      {hint ? <span className="block text-sm text-stone-500">{hint}</span> : null}
      {error ? <span className="block text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10";

export function CheckboxPill({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium transition",
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-black/10 bg-white text-slate-700 hover:border-primary/30",
      )}
    >
      {label}
    </button>
  );
}
