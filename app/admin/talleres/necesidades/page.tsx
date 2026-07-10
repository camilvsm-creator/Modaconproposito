"use client";

import { useState } from "react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button } from "@/components/ui";
import { mockNecesidadesUrgentes, mockCategoriasNecesidades } from "@/lib/mock-data";

const STATUS_OPTIONS = ["Todas", "pendiente", "publicada", "cubierta", "cerrada"] as const;
const STATUS_LABELS: Record<string, string> = { todas: "Todas", pendiente: "Pendiente", publicada: "Publicada", cubierta: "Cubierta", cerrada: "Cerrada" };
const STATUS_STYLES: Record<string, string> = { pendiente: "bg-amber-100 text-amber-700", publicada: "bg-blue-100 text-blue-700", cubierta: "bg-green-100 text-green-700", cerrada: "bg-stone-100 text-stone-600" };
const PRIORITY_STYLES: Record<string, string> = { alta: "bg-red-100 text-red-700", media: "bg-amber-100 text-amber-700", baja: "bg-green-100 text-green-700" };

const PRIORITY_OPTIONS = ["Todas", "alta", "media", "baja"];

const extendedNeeds = mockNecesidadesUrgentes.map((n, i) => ({
  ...n,
  status: i < 2 ? "pendiente" as const : i < 4 ? "publicada" as const : i < 5 ? "cubierta" as const : "cerrada" as const,
}));

export default function AdminNecesidadesPage() {
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");

  const filtered = extendedNeeds.filter((n) => {
    if (filtroStatus !== "Todas" && n.status !== filtroStatus) return false;
    if (filtroCategoria !== "Todas" && n.categoria !== filtroCategoria) return false;
    if (filtroPrioridad !== "Todas" && n.prioridad !== filtroPrioridad) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Necesidades"
        description="Administra las necesidades de los talleres."
        meta={`${extendedNeeds.length} necesidades`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Necesidades" }}
      />

      <div className="flex flex-wrap gap-3">
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          <option value="Todas">Todas las categorías</option>
          {mockCategoriasNecesidades.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p === "Todas" ? "Todas las prioridades" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
              <tr>
                <th className="px-4 py-3">Taller</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/talleres/listado/${n.tallerId}`} className="font-semibold text-[#F74897] hover:underline">{n.taller}</Link>
                  </td>
                  <td className="px-4 py-3"><span className="rounded bg-[#FFE4EC] px-2 py-0.5 text-xs font-medium text-[#D6003F]">{n.categoria}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[n.prioridad]}`}>{n.prioridad}</span></td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{n.descripcion}</td>
                  <td className="px-4 py-3 text-stone-600">{n.fechaPublicacion}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[n.status]}`}>{STATUS_LABELS[n.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" className="rounded-full bg-[#F74897] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#D6003F]">Aprobar</button>
                      <button type="button" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50">Editar</button>
                      <button type="button" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50">Cerrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-12 text-center">
          <p className="text-stone-500 font-medium">No hay necesidades que coincidan con los filtros.</p>
        </div>
      )}

      <div className="grid gap-3 md:hidden">
        {filtered.map((n) => (
          <div key={n.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Link href={`/admin/talleres/listado/${n.tallerId}`} className="font-semibold text-[#F74897] hover:underline text-sm">{n.taller}</Link>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[n.status]}`}>{STATUS_LABELS[n.status]}</span>
            </div>
            <p className="font-semibold text-ink">{n.descripcion}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-[#FFE4EC] px-2 py-0.5 text-xs font-medium text-[#D6003F]">{n.categoria}</span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[n.prioridad]}`}>{n.prioridad}</span>
            </div>
            <p className="text-xs text-stone-400">{n.fechaPublicacion}</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className="rounded-full bg-[#F74897] px-3 py-1.5 text-xs font-semibold text-white">Aprobar</button>
              <button type="button" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300">Editar</button>
              <button type="button" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-300">Cerrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
