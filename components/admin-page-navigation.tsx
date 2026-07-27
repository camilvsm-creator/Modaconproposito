"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type AdminPageNavigationProps = {
  baseHref: string;
  baseLabel: string;
  currentLabel?: string;
  title: string;
};

export function AdminPageNavigation({ baseHref, baseLabel, currentLabel, title }: AdminPageNavigationProps) {
  const router = useRouter();
  const topBarTitle = currentLabel ?? title;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 bg-white/95 px-4 py-3 backdrop-blur-lg ring-1 ring-black/5 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {currentLabel ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-700 transition hover:bg-gray-100"
                aria-label="Volver"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">{baseLabel}</p>
              <p className="truncate text-base font-bold text-ink lg:text-lg">{topBarTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Breadcrumb" className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2 lg:text-sm lg:text-gray-500">
        <Link href={baseHref} className="font-semibold text-primary hover:text-primary-dark">
          {baseLabel}
        </Link>
        {currentLabel ? (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-600">{currentLabel}</span>
          </>
        ) : null}
      </nav>
    </>
  );
}
