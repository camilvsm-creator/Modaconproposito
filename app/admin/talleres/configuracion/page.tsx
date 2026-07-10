"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { mockCategoriasNecesidades, mockTiposProducto, mockEspecialidades, mockEstadosTaller, mockEstadosNecesidad } from "@/lib/mock-data";

export default function AdminConfiguracionPage() {
  const [categorias, setCategorias] = useState(mockCategoriasNecesidades);
  const [productos, setProductos] = useState(mockTiposProducto);
  const [especialidades, setEspecialidades] = useState(mockEspecialidades);
  const [nuevaCat, setNuevaCat] = useState("");
  const [nuevoProd, setNuevoProd] = useState("");
  const [nuevaEsp, setNuevaEsp] = useState("");

  function addItem(list: string[], setter: (v: string[]) => void, value: string, setValue: (v: string) => void) {
    if (!value.trim()) return;
    setter([...list, value.trim()]);
    setValue("");
  }

  function removeItem(list: string[], setter: (v: string[]) => void, index: number) {
    setter(list.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Configuración"
        description="Administra los datos generales de la plataforma."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Configuración" }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard className="p-6 space-y-4">
          <h3 className="font-semibold text-ink">Categorías de necesidades</h3>
          <div className="flex flex-wrap gap-2">
            {categorias.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE4EC] px-3 py-1.5 text-sm text-[#D6003F]">
                {c}
                <button onClick={() => removeItem(categorias, setCategorias, i)} className="hover:text-[#F74897]"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Nueva categoría" className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm" />
            <Button onClick={() => addItem(categorias, setCategorias, nuevaCat, setNuevaCat)} disabled={!nuevaCat.trim()} variant="secondary">Agregar</Button>
          </div>
        </SectionCard>

        <SectionCard className="p-6 space-y-4">
          <h3 className="font-semibold text-ink">Tipos de producto</h3>
          <div className="flex flex-wrap gap-2">
            {productos.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
                {p}
                <button onClick={() => removeItem(productos, setProductos, i)} className="hover:text-stone-500"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={nuevoProd} onChange={(e) => setNuevoProd(e.target.value)} placeholder="Nuevo producto" className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm" />
            <Button onClick={() => addItem(productos, setProductos, nuevoProd, setNuevoProd)} disabled={!nuevoProd.trim()} variant="secondary">Agregar</Button>
          </div>
        </SectionCard>

        <SectionCard className="p-6 space-y-4">
          <h3 className="font-semibold text-ink">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {especialidades.map((e, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
                {e}
                <button onClick={() => removeItem(especialidades, setEspecialidades, i)} className="hover:text-stone-500"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={nuevaEsp} onChange={(e) => setNuevaEsp(e.target.value)} placeholder="Nueva especialidad" className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm" />
            <Button onClick={() => addItem(especialidades, setEspecialidades, nuevaEsp, setNuevaEsp)} disabled={!nuevaEsp.trim()} variant="secondary">Agregar</Button>
          </div>
        </SectionCard>

        <SectionCard className="p-6 space-y-4">
          <h3 className="font-semibold text-ink">Estados del sistema</h3>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">Estados de taller</p>
            <div className="flex flex-wrap gap-2">
              {mockEstadosTaller.map((e) => (
                <span key={e} className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-600">{e.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600 mb-2">Estados de necesidad</p>
            <div className="flex flex-wrap gap-2">
              {mockEstadosNecesidad.map((e) => (
                <span key={e} className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-600">{e}</span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
