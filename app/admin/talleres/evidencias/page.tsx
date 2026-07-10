"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";

const CATEGORIAS = ["Todas", "Material recibido", "Proceso de confección", "Producto terminado", "Entrega"];

const mockEvidencias = [
  { id: "ev1", taller: "Sinors Atelier", tallerId: "w1", categoria: "Material recibido", descripcion: "Llegada de tela blanca", fecha: "2026-07-08", color: "bg-blue-100" },
  { id: "ev2", taller: "Costuras Caracas", tallerId: "w2", categoria: "Proceso de confección", descripcion: "Corte de ropa interior", fecha: "2026-07-07", color: "bg-amber-100" },
  { id: "ev3", taller: "Tejidos Maracaibo", tallerId: "w3", categoria: "Producto terminado", descripcion: "Lote de toallas finalizado", fecha: "2026-07-06", color: "bg-green-100" },
  { id: "ev4", taller: "Sinors Atelier", tallerId: "w1", categoria: "Producto terminado", descripcion: "Mascarillas empacadas", fecha: "2026-07-05", color: "bg-green-100" },
  { id: "ev5", taller: "Modistería Valencia", tallerId: "w4", categoria: "Proceso de confección", descripcion: "Confección de uniformes", fecha: "2026-07-04", color: "bg-amber-100" },
  { id: "ev6", taller: "Sinors Atelier", tallerId: "w1", categoria: "Entrega", descripcion: "Entrega de sábanas al Hospital", fecha: "2026-07-03", color: "bg-purple-100" },
  { id: "ev7", taller: "Costuras Caracas", tallerId: "w2", categoria: "Material recibido", descripcion: "Recepción de elástico", fecha: "2026-07-02", color: "bg-blue-100" },
  { id: "ev8", taller: "Tejidos Maracaibo", tallerId: "w3", categoria: "Producto terminado", descripcion: "Toallas de mano listas", fecha: "2026-07-01", color: "bg-green-100" },
];

export default function AdminEvidenciasPage() {
  const [categoria, setCategoria] = useState("Todas");

  const filtered = categoria === "Todas" ? mockEvidencias : mockEvidencias.filter((e) => e.categoria === categoria);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Evidencias"
        description="Galería de evidencias de producción y entregas."
        meta={`${mockEvidencias.length} evidencias`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Evidencias" }}
      />

      <div className="flex flex-wrap gap-3">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              categoria === cat ? "bg-[#F74897] text-white" : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((ev) => (
          <div key={ev.id} className="group rounded-xl border border-stone-200 bg-white/75 overflow-hidden transition hover:shadow-md">
            <div className={`flex aspect-[4/3] items-center justify-center ${ev.color}`}>
              <Camera className="h-10 w-10 text-stone-400/60" />
            </div>
            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <Link href={`/admin/talleres/talleres/${ev.tallerId}`} className="text-sm font-semibold text-[#F74897] hover:underline">{ev.taller}</Link>
                <span className="rounded bg-[#FFE4EC] px-2 py-0.5 text-[10px] font-semibold text-[#D6003F] uppercase tracking-wide">{ev.categoria}</span>
              </div>
              <p className="text-sm text-stone-600">{ev.descripcion}</p>
              <p className="text-xs text-stone-400">{ev.fecha}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-12 text-center">
          <p className="text-stone-500 font-medium">No hay evidencias para esta categoría.</p>
        </div>
      )}
    </div>
  );
}
