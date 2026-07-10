"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, SectionCard } from "@/components/ui";
import { mockAnuncios, mockTalleresNombres } from "@/lib/mock-data";

type Destinatario = "todos" | "taller_especifico" | "voluntarios" | "grupo";

const DESTINO_LABELS: Record<Destinatario, string> = {
  todos: "Todos los talleres",
  taller_especifico: "Un taller específico",
  voluntarios: "Todos los voluntarios",
  grupo: "Un grupo específico",
};

export default function AdminMensajesPage() {
  const [anuncios, setAnuncios] = useState(mockAnuncios);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [destinatarios, setDestinatarios] = useState<Destinatario>("todos");
  const [tallerEspecifico, setTallerEspecifico] = useState("");

  function enviarAnuncio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;
    const nuevo = {
      id: "an" + Date.now(),
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      destinatarios: destinatarios,
      tallerEspecifico: destinatarios === "taller_especifico" ? tallerEspecifico : undefined,
      fecha: new Date().toISOString().slice(0, 10),
      leidos: 0,
      total: destinatarios === "taller_especifico" ? 1 : 18,
    };
    setAnuncios((prev) => [nuevo, ...prev]);
    setTitulo("");
    setContenido("");
    setTallerEspecifico("");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Mensajes"
        description="Centro de comunicación con talleres y voluntarios."
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Mensajes" }}
      />

      <SectionCard className="p-6 space-y-4">
        <h2 className="font-semibold text-ink">Nuevo anuncio</h2>
        <form onSubmit={enviarAnuncio} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Destinatarios</label>
              <select value={destinatarios} onChange={(e) => setDestinatarios(e.target.value as Destinatario)} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                <option value="todos">Todos los talleres</option>
                <option value="taller_especifico">Un taller específico</option>
                <option value="voluntarios">Todos los voluntarios</option>
              </select>
            </div>
            {destinatarios === "taller_especifico" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Taller</label>
                <select value={tallerEspecifico} onChange={(e) => setTallerEspecifico(e.target.value)} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                  <option value="">Seleccionar taller</option>
                  {mockTalleresNombres.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Asunto</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mensaje</label>
            <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} rows={4} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm" />
          </div>
          <Button type="submit" disabled={!titulo.trim() || !contenido.trim()} className="bg-[#F74897] hover:bg-[#D6003F] text-white">
            <Send className="h-4 w-4" /> Enviar anuncio
          </Button>
        </form>
      </SectionCard>

      <div className="space-y-4">
        <h2 className="font-semibold text-ink">Anuncios enviados</h2>
        {anuncios.map((a) => (
          <SectionCard key={a.id} className="p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{a.titulo}</p>
                <p className="mt-1 text-sm text-stone-600">{a.contenido}</p>
              </div>
              <span className="shrink-0 rounded bg-[#FFE4EC] px-2.5 py-1 text-[11px] font-semibold text-[#D6003F]">
                {DESTINO_LABELS[a.destinatarios]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>{a.fecha}</span>
              <span>·</span>
              <span>{a.leidos} / {a.total} leídos</span>
              {a.tallerEspecifico && <><span>·</span><span className="text-stone-500">Para: {a.tallerEspecifico}</span></>}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
