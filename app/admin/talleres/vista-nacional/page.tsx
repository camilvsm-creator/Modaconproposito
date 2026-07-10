import { AlertTriangle, Scissors } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { mockProgresoProductos, mockNecesidadesCriticas } from "@/lib/mock-data";

function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm font-medium text-ink shrink-0">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-[#F74897]" : "bg-amber-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-semibold text-stone-600">{pct}%</span>
    </div>
  );
}

export default async function AdminVistaNacionalPage() {
  await requireWorkshopAdminUser();

  const totalRequeridoGlobal = mockProgresoProductos.reduce((s, p) => s + p.totalRequerido, 0);
  const totalProducidoGlobal = mockProgresoProductos.reduce((s, p) => s + p.totalProducido, 0);
  const pctGlobal = totalRequeridoGlobal > 0 ? Math.round((totalProducidoGlobal / totalRequeridoGlobal) * 100) : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Vista Nacional"
        description="Monitoreo del estado general de la producción en toda la red."
        meta={`${pctGlobal}% global`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Vista Nacional" }}
      />

      <SectionCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Progreso global</p>
            <p className="text-3xl font-bold text-[#F74897] mt-1">{pctGlobal}%</p>
            <p className="text-sm text-stone-500">{totalProducidoGlobal} / {totalRequeridoGlobal} unidades producidas</p>
          </div>
          <div className="h-20 w-20 rounded-full border-4 border-[#FFE4EC] flex items-center justify-center">
            <span className="text-xl font-bold text-[#F74897]">{pctGlobal}%</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Progreso por tipo de producto</h2>
        <div className="space-y-5">
          {mockProgresoProductos.map((p) => (
            <div key={p.producto}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-ink">{p.producto}</span>
                <span className="text-stone-500">{p.totalProducido} / {p.totalRequerido}</span>
              </div>
              <ProgressBar pct={p.porcentaje} label="" />
              <p className="mt-0.5 text-xs text-stone-400">{p.talleresActivos} talleres activos</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Necesidades críticas del momento</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {mockNecesidadesCriticas.map((nc) => (
            <div key={nc.recurso} className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <div className="flex items-start gap-3">
                {nc.tipo === "material" ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <Scissors className="h-4 w-4 text-red-600" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-red-800">{nc.recurso}</p>
                  <p className="mt-0.5 text-sm text-red-600">
                    {nc.tipo === "material" ? "Material" : "Voluntarios"} — {nc.talleresQueLoNecesitan} talleres lo necesitan
                  </p>
                  <p className="text-sm text-red-500">Requerido: {nc.cantidadRequerida}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
