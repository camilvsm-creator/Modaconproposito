"use client";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import type { Material } from "@/lib/types";

const mockMateriales: Material[] = [
  { id: "1", produccionId: "1", nombre: "Tela", cantidadRequerida: 100, cantidadDisponible: 40, estado: "bajo" },
  { id: "2", produccionId: "1", nombre: "Hilo", cantidadRequerida: 20, cantidadDisponible: 20, estado: "completo" },
  { id: "3", produccionId: "1", nombre: "Elástico", cantidadRequerida: 50, cantidadDisponible: 5, estado: "urgente" },
  { id: "4", produccionId: "3", nombre: "Cierres", cantidadRequerida: 30, cantidadDisponible: 30, estado: "completo" },
];

const estadoTones: Record<string, string> = {
  completo: "bg-success-soft text-success",
  bajo: "bg-warning-soft text-warning",
  urgente: "bg-danger-soft text-danger",
};

const estadoLabels: Record<string, string> = {
  completo: "Completo",
  bajo: "Bajo",
  urgente: "Urgente",
};

export default function MaterialesPage() {
  const materiales = mockMateriales;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Materiales"
        description="Control de insumos disponibles para cada producción."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Materiales" }}
      />

      {materiales.length === 0 ? (
        <EmptyState
          title="Sin materiales"
          description="Los materiales necesarios para tus producciones aparecerán aquí."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materiales.map((m) => {
            const tone = estadoTones[m.estado] ?? "bg-stone-100 text-stone-700";
            const pct = m.cantidadRequerida > 0 ? Math.round((m.cantidadDisponible / m.cantidadRequerida) * 100) : 0;
            const barColor = m.estado === "completo" ? "bg-green-500" : m.estado === "bajo" ? "bg-amber-500" : "bg-red-500";
            return (
              <SectionCard key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink">{m.nombre}</h3>
                  <span className={"inline-flex shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold uppercase tracking-wide " + tone}>
                    {estadoLabels[m.estado]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {m.cantidadDisponible} / {m.cantidadRequerida} disponibles
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div className={"h-full rounded-full " + barColor} style={{ width: `${pct}%` }} />
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
