"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import type { Entrega } from "@/lib/types";

const mockEntregas: Entrega[] = [
  { id: "1", producto: "Mascarillas", cantidad: 50, fecha: "2026-07-01", estado: "Entregado", observaciones: "Lote completo entregado a Promoda." },
  { id: "2", producto: "Ropa interior", cantidad: 30, fecha: "2026-07-15", estado: "En proceso", observaciones: "Pendiente de coordinar recolección." },
];

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>(mockEntregas);
  const [showForm, setShowForm] = useState(false);
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");

  function agregarEntrega(e: React.FormEvent) {
    e.preventDefault();
    const nueva: Entrega = {
      id: String(Date.now()),
      producto,
      cantidad: Number(cantidad),
      fecha,
      estado: "Pendiente",
      observaciones,
    };
    setEntregas([nueva, ...entregas]);
    setProducto("");
    setCantidad("");
    setFecha("");
    setObservaciones("");
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Entregas"
        description="Registro de productos entregados a Promoda o a beneficiarios."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Entregas" }}
        actions={<Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancelar" : "Registrar entrega"}</Button>}
      />

      {showForm && (
        <SectionCard className="p-4">
          <form onSubmit={agregarEntrega} className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-sm font-semibold text-stone-600">Producto</label>
              <input className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" value={producto} onChange={(e) => setProducto(e.target.value)} required />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-semibold text-stone-600">Cantidad</label>
              <input type="number" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            </div>
            <div className="w-36">
              <label className="mb-1 block text-sm font-semibold text-stone-600">Fecha</label>
              <input type="date" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-sm font-semibold text-stone-600">Observaciones</label>
              <input className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
            <Button type="submit">Registrar</Button>
          </form>
        </SectionCard>
      )}

      {entregas.length === 0 ? (
        <EmptyState
          title="Sin entregas"
          description="Registra las entregas de productos para llevar el control."
        />
      ) : (
        <div className="space-y-3">
          {entregas.map((e) => (
            <SectionCard key={e.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{e.producto}</h3>
                    <span className="inline-flex rounded-full bg-success-soft px-2.5 py-0.5 text-sm font-semibold uppercase tracking-wide text-success">
                      {e.estado}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">Cantidad: {e.cantidad}</p>
                  <p className="text-sm text-stone-400">Fecha: {e.fecha}</p>
                  {e.observaciones ? <p className="text-sm text-stone-500">{e.observaciones}</p> : null}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
