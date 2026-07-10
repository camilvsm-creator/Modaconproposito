import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
  className?: string;
  label?: string;
  total?: number;
  limit?: number;
};

export function AdminPagination({
  page,
  pageCount,
  hrefForPage,
  className,
  label,
  total,
  limit,
}: Props) {
  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav className={cn("flex flex-col gap-3 border-t border-stone-200/80 pt-4 text-sm font-semibold text-stone-700 sm:flex-row sm:items-center sm:justify-between", className)}>
      <span>
        {label ? `${label} · ` : ""}Página {page} de {pageCount}
        {typeof total === "number" && typeof limit === "number" ? ` · ${Math.min(limit, Math.max(total - (page - 1) * limit, 0))} visibles de ${total}` : ""}
      </span>
      <div className="flex gap-2">
        {hasPrevious ? (
            <Link
              href={hrefForPage(page - 1)}
              className="rounded-lg bg-white px-4 py-2.5 ring-1 ring-stone-200 text-primary hover:bg-primary-soft"
            >
              Anterior
            </Link>
          ) : (
          <span className="pointer-events-none rounded-lg bg-stone-100 px-4 py-2.5 ring-1 ring-stone-200 text-stone-400">
            Anterior
          </span>
        )}
        {hasNext ? (
          <Link
            href={hrefForPage(page + 1)}
            className="rounded-lg bg-primary px-4 py-2.5 text-white ring-1 ring-stone-200 hover:bg-primary-dark"
          >
            Siguiente
          </Link>
        ) : (
          <span className="pointer-events-none rounded-lg bg-stone-100 px-4 py-2.5 ring-1 ring-stone-200 text-stone-400">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
