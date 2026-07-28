import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AdminRowActionsClient } from "@/components/admin-row-actions";

export type AdminTab = {
  href: string;
  label: string;
  count?: number;
  active?: boolean;
};

export function AdminTabs({ tabs, className }: { tabs: AdminTab[]; className?: string }) {
  return (
    <nav aria-label="Secciones" className={cn("flex min-w-0 gap-1 overflow-x-auto border-b border-gray-200", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-t-lg px-3.5 text-sm font-semibold transition-colors",
            tab.active
              ? "bg-primary text-white"
              : "bg-gray-50 text-gray-600 hover:bg-primary-soft hover:text-primary-dark",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-sm font-bold",
                tab.active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500",
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function AdminFilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 bg-white py-1 md:flex-row md:items-center md:justify-between", className)}>
      {children}
    </div>
  );
}

export function AdminToolbar({
  filters,
  actions,
  className,
}: {
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 bg-white py-1 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="admin-toolbar-filters flex min-w-0 flex-1 flex-wrap items-center gap-3 lg:max-w-[65%] lg:flex-[0_1_65%]">{filters}</div>
      {actions ? <div className="admin-toolbar-actions flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto [&>*]:max-w-full [&>a]:w-full [&>button]:w-full [&>div]:w-full lg:[&>a]:w-auto lg:[&>button]:w-auto lg:[&>div]:w-auto">{actions}</div> : null}
    </div>
  );
}

export function AdminRecordsSummary({ total }: { total: number }) {
  return <p className="flex min-h-8 items-center text-sm font-semibold text-gray-600">Total registros: {total}</p>;
}

export function AdminTableFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("admin-table-frame overflow-x-auto bg-white", className)}>{children}</div>;
}

export function AdminStatusBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold", className)}>
      {children}
    </span>
  );
}

export function AdminRowActions({ children, label = "Acciones" }: { children: ReactNode; label?: string }) {
  return <AdminRowActionsClient label={label}>{children}</AdminRowActionsClient>;
}

export function AdminActionItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full [&_a]:block [&_a]:w-full [&_a]:rounded-md [&_a]:px-3 [&_a]:py-2 [&_a]:text-left [&_a]:text-sm [&_a]:font-medium [&_a]:text-gray-700 [&_a]:hover:bg-gray-50 [&_button]:block [&_button]:min-h-11 [&_button]:w-full [&_button]:rounded-md [&_button]:px-3 [&_button]:py-2 [&_button]:text-left [&_button]:text-sm [&_button]:font-medium [&_button]:text-gray-700 [&_button]:hover:bg-gray-50", className)}>
      {children}
    </div>
  );
}

export function AdminDetailPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("admin-detail-panel rounded-md bg-[#FCFCFC] p-5 ring-1 ring-gray-200/70 sm:p-6", className)}>{children}</section>;
}
