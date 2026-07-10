"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { mockEntregasAdmin, mockTalleresNombres, mockDestinos } from "@/lib/mock-data";

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_ruta: "bg-blue-100 text-blue-700",
  entregado: "bg-green-100 text-green-700",
};
const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_ruta: "En ruta",
  entregado: "Entregado",
};

export default function AdminEntregasPage() {
  const [entregas, setEntregas] = useState(mockEntregasAdmin);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: "", taller: "", producto: "", cantidad: 0, destino: "", estado: "pendiente" });

  function agregarEntrega() {
    if (!form.fecha || !form.taller || !form.producto || !form.cantidad || !form.destino) return;
    const nueva = {
      id: "e" + Date.now(),
      fecha: form.fecha,
      taller: form.taller,
      tallerId: "w" + (mockTalleresNombres.indexOf(form.taller) + 1),
      producto: form.producto,
      cantidad: form.cantidad,
      destino: form.destino,
      estado: form.estado as "pendiente" | "en_ruta" | "entregado",
      evidencias: [],
    };
    setEntregas((prev) => [nueva, ...prev]);
    setForm({ fecha: "", taller: "", producto: "", cantidad: 0, destino: "", estado: "pendiente" });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Entregas"
        description="Registro de entregas realizadas a los beneficiarios."
        meta={`${entregas.length} entregas`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Entregas" }}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-[#F74897] hover:bg-[#D6003F] text-white">
            <Plus className="h-4 w-4" /> Nueva entrega
          </Button>
        }
      />

      {showForm && (
        <SectionCard className="p-6 space-y-4">
          <h3 className="font-semibold text-ink">Registrar nueva entrega</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Taller</label>
              <select value={form.taller} onChange={(e) => setForm({ ...form, taller: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                <option value="">Seleccionar taller</option>
                {mockTalleresNombres.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Producto</label>
              <input type="text" value={form.producto} onChange={(e) => setForm({ ...form, producto: e.target.value })} placeholder="Ej: Sábanas" className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Cantidad</label>
              <input type="number" value={form.cantidad || ""} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Destino</label>
              <select value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                <option value="">Seleccionar destino</option>
                {mockDestinos.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Estado</label>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                <option value="pendiente">Pendiente</option>
                <option value="en_ruta">En ruta</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={agregarEntrega} className="bg-[#F74897] hover:bg-[#D6003F] text-white">Registrar</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </SectionCard>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Taller</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {entregas.map((e) => (
              <tr key={e.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-600">{e.fecha}</td>
                <td className="px-4 py-3 font-medium text-[#F74897]">{e.taller}</td>
                <td className="px-4 py-3 text-ink font-medium">{e.producto}</td>
                <td className="px-4 py-3 text-stone-700">{e.cantidad}</td>
                <td className="px-4 py-3 text-stone-600 max-w-[200px] truncate">{e.destino}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[e.estado]}`}>{ESTADO_LABELS[e.estado]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {entregas.map((e) => (
          <div key={e.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">{e.producto}</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[e.estado]}`}>{ESTADO_LABELS[e.estado]}</span>
            </div>
            <p className="text-sm text-stone-500">{e.fecha}</p>
            <p className="text-sm font-medium text-[#F74897]">{e.taller}</p>
            <p className="text-sm text-stone-600">{e.cantidad} unidades → {e.destino}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
