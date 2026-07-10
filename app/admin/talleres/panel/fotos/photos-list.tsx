import { WORKSHOP_PHOTO_STATUS_LABELS, WORKSHOP_PHOTO_STATUS_TONES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/ui";
import type { WorkshopPhoto } from "@/lib/types";

export function PhotosList({ photos }: { photos: WorkshopPhoto[] }) {
  if (photos.length === 0) {
    return (
      <EmptyState
        title="Sin fotos subidas"
        description="Sube fotos del trabajo de tu taller y los productos que elaboran."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Fotos subidas</h2>
      {photos.map((photo) => {
        const statusLabel = WORKSHOP_PHOTO_STATUS_LABELS[photo.status] ?? photo.status;
        const statusTone = WORKSHOP_PHOTO_STATUS_TONES[photo.status] ?? "bg-stone-100 text-stone-700";

        return (
          <SectionCard key={photo.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-ink">{photo.title ?? "Sin título"}</h3>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", statusTone)}>
                    {statusLabel}
                  </span>
                </div>
                {photo.description ? <p className="text-sm text-stone-600">{photo.description}</p> : null}
                <p className="text-xs text-stone-400">{formatDate(photo.created_at)}</p>
              </div>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
