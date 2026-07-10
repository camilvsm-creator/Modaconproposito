import { Package } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { mockMaterialesConsolidados } from "@/lib/mock-data";

export default async function AdminMaterialesPage() {
  await requireWorkshopAdminUser();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Materiales"
        description="Vista consolidada de los materiales solicitados por los talleres."
        meta={`${mockMaterialesConsolidados.length} materiales`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Materiales" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockMaterialesConsolidados.map((m) => (
          <SectionCard key={m.id} className="p-5 space-y-4 transition hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
              <Package className="h-5 w-5 text-[#F74897]" />
            </div>
            <div>
              <p className="font-semibold text-ink">{m.nombre}</p>
              <p className="mt-1 text-sm text-stone-500">
                Solicitado por <span className="font-semibold text-ink">{m.talleresSolicitantes}</span> talleres
              </p>
            </div>
            <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
              <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">Cantidad requerida</p>
              <p className="text-lg font-bold text-[#F74897]">{m.cantidadRequerida} <span className="text-sm font-medium text-stone-500">{m.unidad}</span></p>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
