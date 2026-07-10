"use client";

import { useState } from "react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { mockProduccionesAdmin, mockProductos, mockTalleresNombres, mockEstadosProduccion } from "@/lib/mock-data";

function ProgressBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-green-500" : "bg-[#F74897]"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-stone-100 text-stone-600",
  en_produccion: "bg-blue-100 text-blue-700",
  finalizado: "bg-green-100 text-green-700",
  entregado: "bg-[#FFE4EC] text-[#D6003F]",
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_produccion: "En producción",
  finalizado: "Finalizado",
  entregado: "Entregado",
};

export default function AdminProduccionesPage() {
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroTaller, setFiltroTaller] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtered = mockProduccionesAdmin.filter((p) => {
    if (filtroProducto && p.producto !== filtroProducto) return false;
    if (filtroTaller && p.taller !== filtroTaller) return false;
    if (filtroEstado && p.estado !== filtroEstado) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Producciones"
        description="Administra toda la producción de la red de talleres."
        meta={`${filtered.length} producciones`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Producciones" }}
      />

      <div className="flex flex-wrap gap-3">
        <select value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          <option value="">Todos los productos</option>
          {mockProductos.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filtroTaller} onChange={(e) => setFiltroTaller(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          <option value="">Todos los talleres</option>
          {mockTalleresNombres.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm">
          <option value="">Todos los estados</option>
          {mockEstadosProduccion.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Taller</th>
                  <th className="px-4 py-3">Solicitado</th>
                  <th className="px-4 py-3">Producido</th>
                  <th className="px-4 py-3">Avance</th>
                  <th className="px-4 py-3">Fecha límite</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-ink">{p.producto}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/talleres/listado/${p.tallerId}`} className="text-[#F74897] hover:underline font-medium">{p.taller}</Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{p.cantidadSolicitada}</td>
                    <td className="px-4 py-3 text-stone-700">{p.cantidadProducida}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <ProgressBar current={p.cantidadProducida} max={p.cantidadSolicitada} />
                    </td>
                    <td className="px-4 py-3 text-stone-600">{p.fechaLimite}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[p.estado]}`}>{ESTADO_LABELS[p.estado]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{p.producto}</p>
                    <Link href={`/admin/talleres/listado/${p.tallerId}`} className="text-sm text-[#F74897] hover:underline">{p.taller}</Link>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[p.estado]}`}>{ESTADO_LABELS[p.estado]}</span>
                </div>
                <div className="text-sm text-stone-600">
                  <span>{p.cantidadProducida} / {p.cantidadSolicitada} unidades</span>
                  <span className="mx-2 text-stone-300">·</span>
                  <span>Límite: {p.fechaLimite}</span>
                </div>
                <ProgressBar current={p.cantidadProducida} max={p.cantidadSolicitada} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-12 text-center">
          <p className="text-stone-500 font-medium">No hay producciones que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
