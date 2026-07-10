"use client";

import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button } from "@/components/ui";
import { mockDashboardStats } from "@/lib/mock-data";

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

      <div className="rounded-xl border border-stone-200/80 bg-white/75 p-5 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Distribución por tipo de producto</p>
        <div className="mt-4 space-y-3">
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
      </div>
    </div>
  );
}
