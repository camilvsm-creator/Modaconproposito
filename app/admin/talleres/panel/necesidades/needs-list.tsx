"use client";

import { useState } from "react";

import { closeWorkshopNeedAction } from "@/app/admin/talleres/panel/actions";
import { Button, SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { WORKSHOP_NEED_STATUS_LABELS, WORKSHOP_NEED_STATUS_TONES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { WorkshopNeed } from "@/lib/types";

export function NeedsList({ needs, workshopId }: { needs: WorkshopNeed[]; workshopId: string }) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClose(needId: string) {
    setClosingId(needId);
    setError(null);

    const formData = new FormData();
    formData.set("id", needId);
    formData.set("workshopId", workshopId);
    const result = await closeWorkshopNeedAction(formData);

    setClosingId(null);
    if (result.error) {
      setError(result.error);
    }
  }

  if (needs.length === 0) {
    return (
      <EmptyState
        title="Sin necesidades registradas"
        description="Añade una necesidad para que la comunidad pueda ayudar a tu aliado."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Necesidades registradas</h2>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {needs.map((need) => {
        const statusLabel = WORKSHOP_NEED_STATUS_LABELS[need.status] ?? need.status;
        const statusTone = WORKSHOP_NEED_STATUS_TONES[need.status] ?? "bg-stone-100 text-stone-700";

        return (
          <SectionCard key={need.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-ink">{need.title}</h3>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold uppercase tracking-wide", statusTone)}>
                    {statusLabel}
                  </span>
                </div>
                {need.description ? <p className="text-sm text-stone-600">{need.description}</p> : null}
                {need.requested_items ? (
                  <p className="text-sm text-stone-500">
                    <span className="font-medium">Solicitan:</span> {need.requested_items}
                  </p>
                ) : null}
                <p className="text-sm text-stone-400">{formatDate(need.created_at)}</p>
              </div>
              {(need.status === "pendiente" || need.status === "publicada") && (
                <Button
                  variant="ghost"
                  onClick={() => handleClose(need.id)}
                  disabled={closingId === need.id}
                >
                  {closingId === need.id ? "Cerrando..." : "Cerrar"}
                </Button>
              )}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
