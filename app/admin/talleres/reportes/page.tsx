"use client";

import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { mockDashboardStats, mockProgresoProductos, mockNecesidadesCriticas } from "@/lib/mock-data";

export default function AdminReportesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Reportes"
        description="Estadísticas generales de la plataforma."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Reportes" }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => alert("Exportando a Excel... (mock)")}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="secondary" onClick={() => alert("Exportando a CSV... (mock)")}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" onClick={() => alert("Exportando a PDF... (mock)")}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">—</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Total prendas confeccionadas</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">—</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Total sábanas</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">—</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Total toallas</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">{mockDashboardStats.talleresActivos}</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Talleres activos</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">{mockDashboardStats.totalVoluntarios}</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Total voluntarios</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
            <BarChart3 className="h-5 w-5 text-[#F74897]" />
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">—</p>
          <p className="mt-1 text-sm font-medium text-stone-600">Materiales recibidos</p>
        </div>
      </div>

      <SectionCard className="p-6 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Distribución por tipo de producto</p>
        <div className="space-y-3">
          {[
            { label: "Ropa interior", pct: 40, color: "bg-[#F74897]" },
            { label: "Sábanas", pct: 25, color: "bg-[#D6003F]" },
            { label: "Toallas", pct: 20, color: "bg-[#F74897]/60" },
            { label: "Mascarillas", pct: 10, color: "bg-stone-400" },
            { label: "Otros", pct: 5, color: "bg-stone-300" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-28 text-sm text-stone-700">{item.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-semibold text-stone-500">{item.pct}%</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="p-6 space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Progreso por tipo de producto</p>
        <div className="space-y-5">
          {mockProgresoProductos.map((p) => (
            <div key={p.producto}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-ink">{p.producto}</span>
                <span className="text-stone-500">{p.totalProducido} / {p.totalRequerido}</span>
              </div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full rounded-full ${p.porcentaje >= 100 ? "bg-green-500" : p.porcentaje >= 50 ? "bg-[#F74897]" : "bg-amber-500"}`}
                  style={{ width: `${p.porcentaje}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-stone-400">{p.talleresActivos} talleres activos</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="p-6 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Necesidades críticas del momento</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {mockNecesidadesCriticas.map((nc) => (
            <div key={nc.recurso} className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <p className="font-semibold text-red-800">{nc.recurso}</p>
              <p className="mt-0.5 text-sm text-red-600">
                {nc.tipo === "material" ? "Material" : "Voluntarios"} — {nc.talleresQueLoNecesitan} talleres lo necesitan
              </p>
              <p className="text-sm text-red-500">Requerido: {nc.cantidadRequerida}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
