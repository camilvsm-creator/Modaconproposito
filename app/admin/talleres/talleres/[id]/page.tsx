import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard, InputShell } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { mockTalleresExtendidos, mockProduccionesAdmin, mockVoluntariosAdmin, mockNecesidadesUrgentes } from "@/lib/mock-data";

const STATUS_BADGES: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
  pausado: "bg-stone-100 text-stone-600",
  rechazado: "bg-red-100 text-red-700",
  approved_pending_activation: "bg-blue-100 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  approved_pending_activation: "Por activar",
  activo: "Activo",
  pausado: "Pausado",
  rechazado: "Rechazado",
};

function TabButton({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-[#F74897] text-white" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      {label}
    </Link>
  );
}

function ProgressBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-[#F74897] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function AdminTallerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopAdminUser();
  const { id } = await params;
  const sp = await searchParams;
  const activeTab = getStringParam(sp, "tab") || "general";

  const taller = mockTalleresExtendidos.find((w) => w.id === id);
  if (!taller) notFound();

  const producciones = mockProduccionesAdmin.filter((p) => p.tallerId === id);
  const voluntarios = mockVoluntariosAdmin.filter((v) => v.tallerId === id);
  const necesidades = mockNecesidadesUrgentes.filter((n) => n.tallerId === id);

  const tabs = [
    { key: "general", label: "Información general" },
    { key: "producciones", label: `Producciones (${producciones.length})` },
    { key: "necesidades", label: `Necesidades (${necesidades.length})` },
    { key: "voluntarios", label: `Voluntarios (${voluntarios.length})` },
    { key: "historial", label: "Historial" },
  ];

  const tabHref = (tab: string) => {
    const search = new URLSearchParams();
    search.set("tab", tab);
    return `/admin/talleres/talleres/${id}?${search.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Talleres"
        title={taller.name}
        meta={STATUS_LABELS[taller.status] || taller.status}
        navigation={{ baseHref: "/admin/talleres/talleres", baseLabel: "Talleres", currentLabel: taller.name }}
      />

      <div className="flex flex-wrap gap-0.5 border-b border-stone-200">
        {tabs.map((t) => (
          <TabButton key={t.key} href={tabHref(t.key)} active={activeTab === t.key} label={t.label} />
        ))}
      </div>

      {activeTab === "general" && (
        <SectionCard className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InputShell label="Responsable"><p className="text-sm text-stone-700">{taller.responsibleName}</p></InputShell>
            <InputShell label="Estado"><span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[taller.status]}`}>{STATUS_LABELS[taller.status]}</span></InputShell>
            <InputShell label="Ubicación"><p className="text-sm text-stone-700">{taller.ciudad}, {taller.estado}</p></InputShell>
            <InputShell label="Especialidades"><p className="text-sm text-stone-700">{taller.especialidades}</p></InputShell>
            <InputShell label="Email"><p className="text-sm text-stone-700">contacto@{taller.name.toLowerCase().replace(/\s+/g, "")}.com</p></InputShell>
            <InputShell label="WhatsApp"><p className="text-sm text-stone-700">+58 412 123 4567</p></InputShell>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-center">
              <p className="text-2xl font-bold text-[#F74897]">{taller.produccionesActivas}</p>
              <p className="mt-1 text-sm text-stone-500">Producciones activas</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-center">
              <p className="text-2xl font-bold text-[#F74897]">{taller.voluntariosAsignados}</p>
              <p className="mt-1 text-sm text-stone-500">Voluntarios asignados</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-center">
              <p className="text-2xl font-bold text-[#F74897]">{taller.necesidadesAbiertas}</p>
              <p className="mt-1 text-sm text-stone-500">Necesidades abiertas</p>
            </div>
          </div>
          <div>
            <InputShell label="Notas internas">
              <p className="text-sm text-stone-500 italic">Sin notas registradas.</p>
            </InputShell>
          </div>
        </SectionCard>
      )}

      {activeTab === "producciones" && (
        <div className="space-y-4">
          {producciones.length ? producciones.map((p) => (
            <SectionCard key={p.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{p.producto}</p>
                  <p className="text-sm text-stone-500">Límite: {p.fechaLimite}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  p.estado === "finalizado" || p.estado === "entregado" ? "bg-green-100 text-green-700" : p.estado === "en_produccion" ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-600"
                }`}>{p.estado.replace("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">{p.cantidadProducida} / {p.cantidadSolicitada} unidades</span>
              </div>
              <ProgressBar current={p.cantidadProducida} max={p.cantidadSolicitada} />
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este taller no tiene producciones registradas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "necesidades" && (
        <div className="space-y-4">
          {necesidades.length ? necesidades.map((n) => (
            <SectionCard key={n.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${n.prioridad === "alta" ? "bg-red-500" : n.prioridad === "media" ? "bg-amber-500" : "bg-green-500"}`} />
                <p className="font-semibold text-ink">{n.categoria}</p>
                <span className="rounded bg-[#FFE4EC] px-2 py-0.5 text-[11px] font-semibold text-[#D6003F]">{n.prioridad}</span>
              </div>
              <p className="text-sm text-stone-600">{n.descripcion}</p>
              <p className="text-xs text-stone-400">Publicada: {n.fechaPublicacion}</p>
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este taller no tiene necesidades abiertas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "voluntarios" && (
        <div className="space-y-4">
          {voluntarios.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Especialidad</th>
                    <th className="px-4 py-3">Disponibilidad</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {voluntarios.map((v) => (
                    <tr key={v.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-ink">{v.nombre}</td>
                      <td className="px-4 py-3 text-stone-600">{v.especialidad}</td>
                      <td className="px-4 py-3 text-stone-600">{v.disponibilidad}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          v.estado === "confirmado" ? "bg-green-100 text-green-700" : v.estado === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                        }`}>{v.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este taller no tiene voluntarios asignados.</p>
              <p className="mt-1 text-sm text-stone-400">Puedes asignar voluntarios desde la sección <Link href="/admin/talleres/voluntarios" className="text-[#F74897] hover:underline">Voluntarios</Link>.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "historial" && (
        <SectionCard className="p-6 space-y-4">
          <p className="text-ink font-semibold">Actividad del taller</p>
          <div className="space-y-3">
            {[
              { fecha: "2026-07-08 09:30", evento: "Actualizó su perfil" },
              { fecha: "2026-07-05 14:00", evento: "Publicó necesidad: Tela blanca" },
              { fecha: "2026-07-01 11:00", evento: "Inició producción: Sábanas individuales" },
              { fecha: "2026-06-28 16:30", evento: "Se le asignó voluntario: María González" },
              { fecha: "2026-06-20 10:00", evento: "Taller aprobado y activado" },
              { fecha: "2026-06-15 08:00", evento: "Taller registrado en la plataforma" },
            ].map((h, i) => (
              <div key={i} className="flex items-start gap-4 border-l-2 border-[#FFE4EC] pl-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-700">{h.evento}</p>
                  <p className="text-xs text-stone-400">{h.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
