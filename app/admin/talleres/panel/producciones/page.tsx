"use client";

import { useState } from "react";

import { Button, Container, SectionCard } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import type { Produccion } from "@/lib/types";

const mockProducciones: Produccion[] = [
  {
    id: "1",
    nombre: "Sábanas",
    cantidadSolicitada: 50,
    cantidadProducida: 20,
    estado: "en_produccion",
    fechaLimite: "2026-08-15",
  },
  {
    id: "2",
    nombre: "Ropa interior",
    cantidadSolicitada: 100,
    cantidadProducida: 100,
    estado: "finalizado",
    fechaLimite: "2026-07-01",
  },
  {
    id: "3",
    nombre: "Toallas",
    cantidadSolicitada: 30,
    cantidadProducida: 0,
    estado: "pendiente",
    fechaLimite: "2026-09-01",
  },
  {
    id: "4",
    nombre: "Mascarillas",
    cantidadSolicitada: 200,
    cantidadProducida: 150,
    estado: "entregado",
    fechaLimite: "2026-06-30",
  },
];

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_produccion: "En producción",
  finalizado: "Finalizado",
  entregado: "Entregado",
};

const estadoTones: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  en_produccion: "bg-blue-100 text-blue-700",
  finalizado: "bg-success-soft text-success",
  entregado: "bg-stone-200 text-stone-600",
};

export default function ProduccionesPage() {
  const [producciones, setProducciones] = useState<Produccion[]>(mockProducciones);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  function agregarProduccion(e: React.FormEvent) {
    e.preventDefault();
    const nueva: Produccion = {
      id: String(Date.now()),
      nombre,
      cantidadSolicitada: Number(cantidad),
      cantidadProducida: 0,
      estado: "pendiente",
      fechaLimite,
    };
    setProducciones([nueva, ...producciones]);
    setNombre("");
    setCantidad("");
    setFechaLimite("");
    setShowForm(false);
  }

  function avanzarEstado(id: string) {
    setProducciones((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const order = ["pendiente", "en_produccion", "finalizado", "entregado"];
        const idx = order.indexOf(p.estado);
        if (idx >= order.length - 1) return p;
        return { ...p, estado: order[idx + 1] as Produccion["estado"] };
      }),
    );
  }

  function actualizarAvance(id: string, cantidad: number) {
    setProducciones((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newCantidad = Math.min(cantidad, p.cantidadSolicitada);
        return { ...p, cantidadProducida: newCantidad };
      }),
    );
  }

  return (
    <Container>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Producciones</h1>
            <p className="mt-1 text-sm text-stone-500">Gestiona las confecciones activas del taller.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nueva producción"}
          </Button>
        </div>

        {showForm && (
          <SectionCard className="p-4">
            <form onSubmit={agregarProduccion} className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-semibold text-stone-600">Producto</label>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="w-28">
                <label className="mb-1 block text-xs font-semibold text-stone-600">Cantidad</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>
              <div className="w-40">
                <label className="mb-1 block text-xs font-semibold text-stone-600">Fecha límite</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Crear</Button>
            </form>
          </SectionCard>
        )}

        {producciones.length === 0 ? (
          <EmptyState
            title="Sin producciones"
            description="Crea tu primera producción para empezar a gestionar las confecciones."
          />
        ) : (
          <div className="space-y-3">
            {producciones.map((p) => {
              const pct = p.cantidadSolicitada > 0 ? Math.round((p.cantidadProducida / p.cantidadSolicitada) * 100) : 0;
              const tone = estadoTones[p.estado] ?? "bg-stone-100 text-stone-700";
              const barColor = pct >= 100 ? "bg-green-500" : pct > 0 ? "bg-[#F74897]" : "bg-stone-200";
              return (
                <SectionCard key={p.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink">{p.nombre}</h3>
                        <span className={"inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide " + tone}>
                          {estadoLabels[p.estado]}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500">
                        {p.cantidadProducida} / {p.cantidadSolicitada} producidos
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                        <div className={"h-full rounded-full transition-all " + barColor} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-stone-400">Límite: {p.fechaLimite}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {p.estado !== "entregado" && (
                        <Button variant="secondary" onClick={() => avanzarEstado(p.id)}>
                          {p.estado === "pendiente" ? "Iniciar" : p.estado === "en_produccion" ? "Finalizar" : "Entregar"}
                        </Button>
                      )}
                      {p.estado === "en_produccion" && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={p.cantidadSolicitada}
                            defaultValue={p.cantidadProducida}
                            className="w-16 rounded border border-stone-300 px-2 py-1 text-xs"
                            onBlur={(e) => actualizarAvance(p.id, Number(e.target.value))}
                          />
                          <span className="text-xs text-stone-400">uds</span>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
