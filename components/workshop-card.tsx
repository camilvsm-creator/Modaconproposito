import { ArrowRight, ListChecks } from "lucide-react";
import Link from "next/link";

import { WorkshopStatusBadge } from "@/components/workshop-status-badge";
import type { Workshop } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function WorkshopCard({
  workshop,
}: {
  workshop: Workshop & { needs_count?: number };
}) {
  const name = workshop.public_name_allowed ? workshop.name : "Taller";
  const location = workshop.public_location_allowed
    ? workshop.public_location
    : null;
  const needsCount = workshop.needs_count ?? 0;

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ring-1 ring-[#FF0B55]/10 transition-colors hover:border-[#FF0B55]">
      <Link href={`/${workshop.slug}`} className="flex h-full flex-col">
        <div className="flex flex-1 flex-col p-5 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE4EC] ring-2 ring-[#FF0B55]/20">
              <img src="/workshop-icon.png" alt="" className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black leading-snug tracking-[-0.01em] text-ink">
                  {name}
                </h3>
                {workshop.status !== "activo" ? (
                  <WorkshopStatusBadge value={workshop.status} />
                ) : null}
              </div>
              {location ? (
                <p className="mt-0.5 text-sm font-semibold text-stone-500">
                  {location}
                </p>
              ) : null}
            </div>
          </div>
          {workshop.what_they_do ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
              {workshop.what_they_do}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            {needsCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE4EC] px-2.5 py-0.5 text-sm font-semibold text-[#D6003F]">
                <ListChecks className="h-3.5 w-3.5" />
                {needsCount} {needsCount === 1 ? "necesidad" : "necesidades"}
              </span>
            ) : null}
            <span className="rounded-full bg-[#FFE4EC] px-2.5 py-0.5 text-sm font-semibold text-[#D6003F]">
              {workshop.city}
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-sm font-semibold text-stone-600">
              {workshop.state}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 px-5 py-3">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-stone-400">
            {formatDate(workshop.created_at)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#FF0B55]">
            Ver taller
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}
