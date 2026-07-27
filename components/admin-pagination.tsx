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
    <nav className={cn("flex w-full items-center justify-center gap-2 pt-4 text-sm font-semibold text-gray-700", className)} aria-label="Paginación">
      <div className="flex w-full items-center justify-center gap-2 sm:max-w-md">
        {hasPrevious ? (
          <Link
            href={hrefForPage(page - 1)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-gray-50 px-3 py-2.5 text-primary hover:bg-primary-soft sm:flex-none sm:px-4"
          >
            Anterior
          </Link>
        ) : (
          <span className="pointer-events-none inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-gray-50 px-3 py-2.5 text-gray-400 sm:flex-none sm:px-4">
            Anterior
          </span>
        )}
        <span className="min-w-[108px] shrink-0 text-center">Página {page} de {pageCount}</span>
        {hasNext ? (
          <Link
            href={hrefForPage(page + 1)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary px-3 py-2.5 text-white hover:bg-primary-dark sm:flex-none sm:px-4"
          >
            Siguiente
          </Link>
        ) : (
          <span className="pointer-events-none inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-gray-50 px-3 py-2.5 text-gray-400 sm:flex-none sm:px-4">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
