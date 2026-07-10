"use client";

import { useState } from "react";
import { Building2, HandHeart, Plus, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button } from "@/components/ui";
import { mockAliados } from "@/lib/mock-data";

const TIPO_ICONS: Record<string, typeof Building2> = {
  empresa: Building2,
  ong: HandHeart,
  gobierno: Building2,
  particular: Building2,
};

const TIPO_LABELS: Record<string, string> = {
  empresa: "Empresa",
  ong: "ONG",
  gobierno: "Gobierno",
  particular: "Particular",
};

export default function AdminAliadosPage() {
  const [aliados, setAliados] = useState(mockAliados);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", tipo: "empresa", tipoAyuda: "" });

  function agregarAliado() {
    if (!form.nombre || !form.tipoAyuda) return;
    const nuevo = {
      id: "al" + Date.now(),
      nombre: form.nombre,
      tipo: form.tipo as "empresa" | "ong" | "gobierno" | "particular",
      tipoAyuda: form.tipoAyuda,
      historialColaboraciones: 0,
      talleresApoyados: 0,
      ultimaColaboracion: "—",
    };
    setAliados((prev) => [nuevo, ...prev]);
    setForm({ nombre: "", tipo: "empresa", tipoAyuda: "" });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Aliados"
        description="Empresas y organizaciones colaboradoras."
        meta={`${aliados.length} aliados`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Aliados" }}
        actions={
          <Button onClick={() => setShowForm(true)} className="bg-[#F74897] hover:bg-[#D6003F] text-white">
            <Plus className="h-4 w-4" /> Nuevo aliado
          </Button>
        }
      />

      {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Nuevo aliado</h2>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-stone-100"><X className="h-5 w-5 text-stone-500" /></button>
              </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                  <option value="empresa">Empresa</option>
                  <option value="ong">ONG</option>
                  <option value="gobierno">Gobierno</option>
                  <option value="particular">Particular</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de ayuda</label>
                <input type="text" value={form.tipoAyuda} onChange={(e) => setForm({ ...form, tipoAyuda: e.target.value })} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
              </div>
              <Button onClick={agregarAliado} disabled={!form.nombre || !form.tipoAyuda} className="w-full bg-[#F74897] hover:bg-[#D6003F] text-white">Registrar</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aliados.map((a) => {
          const Icon = TIPO_ICONS[a.tipo];
          return (
            <div key={a.id} className="rounded-xl border border-stone-200 bg-white/75 p-5 space-y-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE4EC]">
                  <Icon className="h-5 w-5 text-[#F74897]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{a.nombre}</p>
                  <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600 uppercase tracking-wide">{TIPO_LABELS[a.tipo]}</span>
                </div>
              </div>
              <p className="text-sm text-stone-600">{a.tipoAyuda}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-center">
                  <p className="text-lg font-bold text-[#F74897]">{a.historialColaboraciones}</p>
                  <p className="text-xs text-stone-500">Colaboraciones</p>
                </div>
                <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-center">
                  <p className="text-lg font-bold text-[#F74897]">{a.talleresApoyados}</p>
                  <p className="text-xs text-stone-500">Talleres apoyados</p>
                </div>
              </div>
              <p className="text-xs text-stone-400">Última colaboración: {a.ultimaColaboracion}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
