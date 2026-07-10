"use client";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import type { Voluntario } from "@/lib/types";

const mockVoluntarios: Voluntario[] = [
  { id: "1", nombre: "María González", especialidad: "Costura", disponibilidad: "Fines de semana", estado: "confirmado" },
  { id: "2", nombre: "Carlos Pérez", especialidad: "Patronista", disponibilidad: "Lunes a viernes", estado: "pendiente" },
  { id: "3", nombre: "Ana Rodríguez", especialidad: "Corte", disponibilidad: "Flexible", estado: "confirmado" },
  { id: "4", nombre: "Luis Martínez", especialidad: "Transporte", disponibilidad: "Sábados", estado: "finalizado" },
];

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  finalizado: "Finalizado",
};

const estadoTones: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  confirmado: "bg-success-soft text-success",
  finalizado: "bg-stone-200 text-stone-600",
};

export default function VoluntariosPage() {
  const voluntarios = mockVoluntarios;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Voluntarios"
        description="Voluntarios asignados al taller por el equipo de Promoda."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Voluntarios" }}
      />

      {voluntarios.length === 0 ? (
        <EmptyState
          title="Sin voluntarios"
          description="Cuando te asignen voluntarios, aparecerán aquí."
        />
      ) : (
        <div className="space-y-3">
          {voluntarios.map((v) => {
            const tone = estadoTones[v.estado] ?? "bg-stone-100 text-stone-700";
            return (
              <SectionCard key={v.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-semibold text-ink">{v.nombre}</h3>
                    <p className="text-sm text-stone-600">{v.especialidad}</p>
                    <p className="text-sm text-stone-400">Disponibilidad: {v.disponibilidad}</p>
                  </div>
                  <span className={"inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold uppercase tracking-wide " + tone}>
                    {estadoLabels[v.estado]}
                  </span>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
