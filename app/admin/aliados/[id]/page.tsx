import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Modal } from "@/components/modal";
import { SectionCard, InputShell } from "@/components/ui";
import { GenerateAccessButton } from "@/components/generate-access-button";
import { deactivateWorkshopAction, reactivateWorkshopAction, updateWorkshopAction } from "@/app/admin/aliados/actions";
import { ALLY_CATEGORIES, ALLY_CATEGORY_LABELS } from "@/lib/constants";
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
  desactivado: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  approved_pending_activation: "Por activar",
  activo: "Activo",
  pausado: "Pausado",
  rechazado: "Rechazado",
  desactivado: "Desactivado",
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
  await requireWorkshopAdminUser();
  const { id } = await params;
  const sp = await searchParams;
  const activeTab = getStringParam(sp, "tab") || "general";
  const error = getStringParam(sp, "error");
  const saved = getStringParam(sp, "saved");
  const created = getStringParam(sp, "created");

  const taller = await getAdminWorkshopById(id);
  if (!taller) notFound();

  const admin = await createSupabaseServerClient();

  const [
    { count: needsCount },
    { count: photosCount },
  ] = await Promise.all([
    admin.from("assigned_tasks").select("id", { count: "exact", head: true }).eq("ally_id", id),
    admin.from("ally_photos").select("id", { count: "exact", head: true }).eq("ally_id", id),
  ]);

  const necesidades = activeTab === "necesidades" ? await getAdminWorkshopNeeds(id) : [];
  const fotos = activeTab === "fotos" ? await getAdminWorkshopPhotos(id) : [];

  const tabs = [
    { key: "general", label: "Información general" },
    { key: "editar", label: "Editar" },
    { key: "necesidades", label: `Necesidades (${needsCount ?? 0})` },
    { key: "fotos", label: `Fotos (${photosCount ?? 0})` },
  ];

  const tabHref = (tab: string) => {
    const search = new URLSearchParams();
    search.set("tab", tab);
    return `/admin/aliados/${id}?${search.toString()}`;
  };

  async function handleUpdate(formData: FormData) {
    "use server";
    const result = await updateWorkshopAction(formData);
    if (result.error) redirect(`/admin/aliados/${id}?tab=editar&error=${encodeURIComponent(result.error)}`);
    redirect(`/admin/aliados/${id}?saved=1`);
  }

  async function handleDeactivate(formData: FormData) {
    "use server";
    const result = await deactivateWorkshopAction(formData);
    if (result.error) redirect(`/admin/aliados/${id}?error=${encodeURIComponent(result.error)}`);
    redirect(`/admin/aliados/${id}?saved=1`);
  }

  async function handleReactivate(formData: FormData) {
    "use server";
    const result = await reactivateWorkshopAction(formData);
    if (result.error) redirect(`/admin/aliados/${id}?error=${encodeURIComponent(result.error)}`);
    redirect(`/admin/aliados/${id}?saved=1`);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Aliados"
        title={taller.name}
        meta={STATUS_LABELS[taller.status] || taller.status}
        actions={
          <div className="flex flex-wrap gap-2">
            {!taller.user_id && !ACTIVATION_BLOCKED_STATUSES.includes(taller.status) ? (
              <GenerateAccessButton workshopId={taller.id} workshopName={taller.name} />
            ) : null}
            {taller.status === "desactivado" ? (
              <Modal triggerLabel="Reactivar" title="Reactivar aliado" description="Confirma la reactivación de este aliado." triggerClassName="px-3 py-1.5 text-green-600 ring-1 ring-green-300 bg-white hover:bg-green-50">
                <form action={handleReactivate}>
                  <input type="hidden" name="id" value={taller.id} />
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#F74897] px-5 py-3 text-sm font-semibold text-white">Confirmar reactivacion</button>
                </form>
              </Modal>
            ) : taller.status === "activo" || taller.status === "pausado" ? (
              <Modal triggerLabel="Desactivar" title="Desactivar aliado" description="Confirma la desactivación de este aliado." triggerClassName="px-3 py-1.5 text-red-600 ring-1 ring-red-300 bg-white hover:bg-red-50">
                <form action={handleDeactivate}>
                  <input type="hidden" name="id" value={taller.id} />
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white">Confirmar desactivacion</button>
                </form>
              </Modal>
            ) : null}
            <Link href={tabHref("editar")} className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#F74897] ring-1 ring-[#F74897]/40 hover:bg-[#F74897]/5 transition">Editar</Link>
          </div>
        }
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: taller.name }}
      />

      {created ? <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">Aliado creado correctamente.</div> : null}
      {saved ? <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">Cambios guardados correctamente.</div> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="flex flex-wrap gap-0.5 border-b border-stone-200">
        {tabs.map((t) => (
          <TabButton key={t.key} href={tabHref(t.key)} active={activeTab === t.key} label={t.label} />
        ))}
      </div>

      {activeTab === "general" && (
        <SectionCard className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InputShell label="Responsable"><p className="text-sm text-stone-700">{taller.responsible_name ?? "—"}</p></InputShell>
            <InputShell label="Estado"><span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${STATUS_BADGES[taller.status]}`}>{STATUS_LABELS[taller.status]}</span></InputShell>
            <InputShell label="Categoría"><p className="text-sm text-stone-700">{ALLY_CATEGORY_LABELS[taller.category] ?? taller.category}</p></InputShell>
            <InputShell label="Usuario"><p className="text-sm text-stone-700">{taller.user_id ? "Vinculado" : "Sin usuario"}</p></InputShell>
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

      {activeTab === "editar" && (
        <SectionCard className="p-6">
          <form action={handleUpdate} className="space-y-6">
            <input type="hidden" name="id" value={taller.id} />
            <div className="grid gap-5 sm:grid-cols-2">
              <InputShell label="Nombre del aliado *"><input name="name" defaultValue={taller.name} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Categoría *">
                <select name="category" defaultValue={taller.category} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink">
                  {ALLY_CATEGORIES.map((value) => <option key={value} value={value}>{ALLY_CATEGORY_LABELS[value]}</option>)}
                </select>
              </InputShell>
              <InputShell label="Responsable *"><input name="responsibleName" defaultValue={taller.responsible_name ?? ""} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Correo electrónico *"><input name="email" type="email" defaultValue={taller.email ?? ""} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Teléfono"><input name="phone" defaultValue={taller.phone ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="WhatsApp"><input name="whatsapp" defaultValue={taller.whatsapp ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Instagram"><input name="instagram" defaultValue={taller.instagram ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Estado *"><input name="state" defaultValue={taller.state} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Ciudad *"><input name="city" defaultValue={taller.city ?? ""} required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Municipio"><input name="municipality" defaultValue={taller.municipality ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Ubicación pública"><input name="publicLocation" defaultValue={taller.public_location ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
              <InputShell label="Qué hace o aporta"><input name="whatTheyDo" defaultValue={taller.what_they_do ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
            </div>
            <InputShell label="Descripción"><textarea name="description" rows={3} defaultValue={taller.description ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
            <InputShell label="Notas admin"><textarea name="adminNotes" rows={3} defaultValue={taller.admin_notes ?? ""} className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink" /></InputShell>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"><input type="checkbox" name="publicNameAllowed" defaultChecked={taller.public_name_allowed} /> <span className="text-sm font-medium text-stone-700">Mostrar nombre público</span></label>
              <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"><input type="checkbox" name="publicLocationAllowed" defaultChecked={taller.public_location_allowed} /> <span className="text-sm font-medium text-stone-700">Mostrar ubicación pública</span></label>
              <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"><input type="checkbox" name="publicInstagramAllowed" defaultChecked={taller.public_instagram_allowed} /> <span className="text-sm font-medium text-stone-700">Mostrar Instagram</span></label>
              <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"><input type="checkbox" name="publicWhatsappAllowed" defaultChecked={taller.public_whatsapp_allowed} /> <span className="text-sm font-medium text-stone-700">Mostrar WhatsApp</span></label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D6003F] transition">Guardar cambios</button>
              <Link href={`/admin/aliados/${id}`} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 transition">Cancelar</Link>
            </div>
          </form>
        </SectionCard>
      )}

      {activeTab === "necesidades" && (
        <div className="space-y-4">
          {necesidades.length ? necesidades.map((n) => (
            <SectionCard key={n.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-ink">{n.title}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold uppercase tracking-wide ${
                  n.status === "publicada" ? "bg-green-100 text-green-700" : n.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                }`}>{n.status}</span>
              </div>
              {n.description ? <p className="text-sm text-stone-600">{n.description}</p> : null}
              {n.requested_items ? <p className="text-sm text-stone-500">Artículos solicitados: {n.requested_items}</p> : null}
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este aliado no tiene tareas registradas.</p>
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
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold uppercase tracking-wide ${
                  f.status === "aprobada" ? "bg-green-100 text-green-700" : f.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                }`}>{f.status}</span>
              </div>
              {f.description ? <p className="text-sm text-stone-600">{f.description}</p> : null}
            </SectionCard>
          )) : (
            <div className="rounded-xl border border-stone-200/80 bg-white/75 p-8 text-center">
              <p className="text-stone-500">Este aliado no tiene fotos registradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
