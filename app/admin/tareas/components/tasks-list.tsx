"use client";

import { useState } from "react";

import { closeWorkshopNeedAction } from "@/app/admin/ally-actions";
import { Button } from "@/components/ui";
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
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">Necesidades registradas</h2>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-3">Necesidad</th>
              <th className="px-4 py-3">Elementos solicitados</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {needs.map((need) => {
              const statusLabel = WORKSHOP_NEED_STATUS_LABELS[need.status] ?? need.status;
              const statusTone = WORKSHOP_NEED_STATUS_TONES[need.status] ?? "bg-gray-100 text-gray-700";
              return (
                <tr key={need.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{need.title}</p>
                    {need.description ? <p className="mt-1 max-w-md text-sm text-gray-600">{need.description}</p> : null}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{need.requested_items ?? "-"}</td>
                  <td className="px-4 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", statusTone)}>{statusLabel}</span></td>
                  <td className="px-4 py-4 text-gray-500">{formatDate(need.created_at)}</td>
                  <td className="px-4 py-4 text-right">
                    {(need.status === "pendiente" || need.status === "publicada") ? (
                      <Button variant="ghost" size="sm" onClick={() => handleClose(need.id)} disabled={closingId === need.id}>
                        {closingId === need.id ? "Cerrando..." : "Cerrar"}
                      </Button>
                    ) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
