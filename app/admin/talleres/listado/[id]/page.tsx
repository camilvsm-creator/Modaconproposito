import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard, InputShell } from "@/components/ui";
import { GenerateAccessButton } from "@/components/generate-access-button";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { getAdminWorkshopById, getAdminWorkshopNeeds, getAdminWorkshopPhotos } from "@/lib/workshops";

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

const ACTIVATION_BLOCKED_STATUSES = ["pendiente", "rechazado", "desactivado"];

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

  const taller = await getAdminWorkshopById(id);
  if (!taller) notFound();

  const admin = await createSupabaseServerClient();

  const [
    { count: needsCount },
    { count: photosCount },
  ] = await Promise.all([
    admin.from("workshop_needs").select("id", { count: "exact", head: true }).eq("workshop_id", id),
    admin.from("workshop_photos").select("id", { count: "exact", head: true }).eq("workshop_id", id),
  ]);

  const necesidades = activeTab === "necesidades" ? await getAdminWorkshopNeeds(id) : [];
  const fotos = activeTab === "fotos" ? await getAdminWorkshopPhotos(id) : [];

  const tabs = [
    { key: "general", label: "Información general" },
    { key: "necesidades", label: `Necesidades (${needsCount ?? 0})` },
    { key: "fotos", label: `Fotos (${photosCount ?? 0})` },
  ];

  const tabHref = (tab: string) => {
    const search = new URLSearchParams();
    search.set("tab", tab);
    return `/admin/talleres/listado/${id}?${search.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Aliados"
        title={taller.name}
        meta={STATUS_LABELS[taller.status] || taller.status}
        actions={
          !taller.user_id && !ACTIVATION_BLOCKED_STATUSES.includes(taller.status) ? (
            <GenerateAccessButton workshopId={taller.id} workshopName={taller.name} />
          ) : null
        }
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Inicio", currentLabel: taller.name }}
      />

      <div className="flex flex-wrap gap-0.5 border-b border-stone-200">
        {tabs.map((t) => (
          <TabButton key={t.key} href={tabHref(t.key)} active={activeTab === t.key} label={t.label} />
        ))}
      </div>

      {activeTab === "general" && (
        <SectionCard className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InputShell label="Responsable"><p className="text-sm text-stone-700">{taller.responsible_name ?? "—"}</p></InputShell>
            <InputShell label="Estado"><span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[taller.status]}`}>{STATUS_LABELS[taller.status]}</span></InputShell>
            <InputShell label="Ubicación"><p className="text-sm text-stone-700">{taller.city ?? "—"}, {taller.state}</p></InputShell>
            <InputShell label="Email"><p className="text-sm text-stone-700">{taller.email ?? "—"}</p></InputShell>
            <InputShell label="WhatsApp"><p className="text-sm text-stone-700">{taller.whatsapp || "—"}</p></InputShell>
            <InputShell label="Instagram"><p className="text-sm text-stone-700">{taller.instagram || "—"}</p></InputShell>
          </div>
          <div>
            <InputShell label="Descripción">
              <p className="text-sm text-stone-700">{taller.description || "Sin descripción."}</p>
            </InputShell>
          </div>
          <div>
            <InputShell label="Qué hacen">
              <p className="text-sm text-stone-700">{taller.what_they_do || "—"}</p>
            </InputShell>
          </div>
        </SectionCard>
      )}

      {activeTab === "necesidades" && (
        <div className="space-y-4">
          {necesidades.length ? necesidades.map((n) => (
            <SectionCard key={n.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-ink">{n.title}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  n.status === "publicada" ? "bg-green-100 text-green-700" : n.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                }`}>{n.status}</span>
              </div>
              {n.description ? <p className="text-sm text-stone-600">{n.description}</p> : null}
              {n.requested_items ? <p className="text-sm text-stone-500">Artículos solicitados: {n.requested_items}</p> : null}
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este taller no tiene necesidades registradas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "fotos" && (
        <div className="space-y-4">
          {fotos.length ? fotos.map((f) => (
            <SectionCard key={f.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-ink">{f.title || "Sin título"}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  f.status === "aprobada" ? "bg-green-100 text-green-700" : f.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                }`}>{f.status}</span>
              </div>
              {f.description ? <p className="text-sm text-stone-600">{f.description}</p> : null}
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este taller no tiene fotos registradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
