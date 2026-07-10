"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Button } from "@/components/ui";
import { mockVoluntariosAdmin, mockTalleresNombres, mockEspecialidades } from "@/lib/mock-data";

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  confirmado: "bg-green-100 text-green-700",
  finalizado: "bg-stone-100 text-stone-600",
};

export default function AdminVoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState(mockVoluntariosAdmin);
  const [showAsignar, setShowAsignar] = useState(false);
  const [selectedVoluntario, setSelectedVoluntario] = useState("");
  const [selectedTaller, setSelectedTaller] = useState("");

  function asignarVoluntario() {
    if (!selectedVoluntario || !selectedTaller) return;
    setVoluntarios((prev) =>
      prev.map((v) =>
        v.id === selectedVoluntario
          ? { ...v, tallerAsignado: selectedTaller, tallerId: "w" + (mockTalleresNombres.indexOf(selectedTaller) + 1), estado: "confirmado" as const }
          : v,
      ),
    );
    setSelectedVoluntario("");
    setSelectedTaller("");
    setShowAsignar(false);
  }

  const sinAsignar = voluntarios.filter((v) => !v.tallerAsignado);
  const asignados = voluntarios.filter((v) => v.tallerAsignado);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Voluntarios"
        description="Administra los voluntarios de la red de talleres."
        meta={`${voluntarios.length} voluntarios`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Voluntarios" }}
        actions={
          sinAsignar.length > 0 ? (
            <Button onClick={() => setShowAsignar(true)} className="bg-[#F74897] hover:bg-[#D6003F] text-white">
              <UserPlus className="h-4 w-4" /> Asignar voluntario
            </Button>
          ) : undefined
        }
      />

      {showAsignar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAsignar(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">Asignar voluntario</h2>
                <button type="button" onClick={() => setShowAsignar(false)} className="rounded-lg p-1 hover:bg-stone-100"><X className="h-5 w-5 text-stone-500" /></button>
              </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Voluntario</label>
                <select value={selectedVoluntario} onChange={(e) => setSelectedVoluntario(e.target.value)} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                  <option value="">Seleccionar voluntario</option>
                  {sinAsignar.map((v) => <option key={v.id} value={v.id}>{v.nombre} — {v.especialidad}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Taller</label>
                <select value={selectedTaller} onChange={(e) => setSelectedTaller(e.target.value)} className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm">
                  <option value="">Seleccionar taller</option>
                  {mockTalleresNombres.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Button onClick={asignarVoluntario} disabled={!selectedVoluntario || !selectedTaller} className="w-full bg-[#F74897] hover:bg-[#D6003F] text-white">
                Asignar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Especialidad</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Disponibilidad</th>
              <th className="px-4 py-3">Taller asignado</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {voluntarios.map((v) => (
              <tr key={v.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-ink">{v.nombre}</td>
                <td className="px-4 py-3 text-stone-600">{v.especialidad}</td>
                <td className="px-4 py-3 text-stone-600">{v.ciudad}</td>
                <td className="px-4 py-3 text-stone-600">{v.disponibilidad}</td>
                <td className="px-4 py-3">
                  {v.tallerAsignado ? (
                    <Link href={`/admin/talleres/listado/${v.tallerId}`} className="text-[#F74897] hover:underline font-medium">{v.tallerAsignado}</Link>
                  ) : (
                    <span className="text-stone-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[v.estado]}`}>{v.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {voluntarios.map((v) => (
          <div key={v.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">{v.nombre}</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ESTADO_STYLES[v.estado]}`}>{v.estado}</span>
            </div>
            <p className="text-sm text-stone-600">{v.especialidad} · {v.ciudad}</p>
            <p className="text-sm text-stone-500">{v.disponibilidad}</p>
            {v.tallerAsignado ? (
              <Link href={`/admin/talleres/listado/${v.tallerId}`} className="text-sm text-[#F74897] hover:underline">Taller: {v.tallerAsignado}</Link>
            ) : (
              <p className="text-sm text-stone-400">Sin asignar</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
