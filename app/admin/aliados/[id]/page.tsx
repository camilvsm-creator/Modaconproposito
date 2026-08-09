import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTabs } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { Modal } from "@/components/modal";
import { SectionCard, InputShell, compactInputClassName } from "@/components/ui";
import { GenerateAccessButton } from "@/components/generate-access-button";
import { deactivateWorkshopAction, reactivateWorkshopAction, updateWorkshopAction } from "@/app/admin/aliados/actions";
import { ALLY_CATEGORIES, ALLY_CATEGORY_LABELS } from "@/lib/constants";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { getAdminWorkshopById, getAdminWorkshopNeedsPage, getAdminWorkshopPhotosPage } from "@/lib/workshops";
import { AllyAvatarForm } from "@/components/ally-avatar-form";

const STATUS_BADGES: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
  pausado: "bg-gray-100 text-gray-600",
  rechazado: "bg-red-100 text-red-700",
  approved_pending_activation: "bg-blue-100 text-blue-700",
  desactivado: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente de aprobación",
  approved_pending_activation: "Postulación aprobada",
  activo: "Cuenta activa",
  pausado: "Cuenta pausada",
  rechazado: "Postulación rechazada",
  desactivado: "Aliado desactivado",
};

const ACTIVATION_BLOCKED_STATUSES = ["rechazado", "desactivado"];

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
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

  const relatedPage = getPageParam(sp);
  const necesidadesResult = activeTab === "necesidades"
    ? await getAdminWorkshopNeedsPage({ allyId: id, page: relatedPage, limit: 20 })
    : null;
  const fotosResult = activeTab === "fotos"
    ? await getAdminWorkshopPhotosPage({ allyId: id, page: relatedPage, limit: 20 })
    : null;
  const necesidades = necesidadesResult?.items ?? [];
  const fotos = fotosResult?.items ?? [];

  const tabs = [
    { key: "general", label: "Información general" },
    { key: "editar", label: "Editar" },
    { key: "necesidades", label: "Necesidades", count: needsCount ?? 0 },
    { key: "fotos", label: "Fotos", count: photosCount ?? 0 },
  ];

  const tabHref = (tab: string) => {
    const search = new URLSearchParams();
    search.set("tab", tab);
    return `/admin/aliados/${id}?${search.toString()}`;
  };

  const relatedPageHref = (tab: string, page: number) => {
    const search = new URLSearchParams();
    search.set("tab", tab);
    if (page > 1) search.set("page", String(page));
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
          <AdminRowActions>
            {!taller.user_id && !ACTIVATION_BLOCKED_STATUSES.includes(taller.status) ? (
              <AdminActionItem>
                <GenerateAccessButton
                  workshopId={taller.id}
                  workshopName={taller.name}
                  triggerLabel={taller.status === "pendiente" ? "Aprobar y generar acceso" : "Volver a generar acceso"}
                />
              </AdminActionItem>
            ) : null}
            {taller.status === "desactivado" ? (
              <AdminActionItem><Modal triggerLabel="Reactivar" title="Reactivar aliado" description="Confirma la reactivación de este aliado." triggerClassName="text-green-700">
                <form action={handleReactivate}>
                  <input type="hidden" name="id" value={taller.id} />
                  <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white">Confirmar reactivación</button>
                </form>
              </Modal></AdminActionItem>
            ) : taller.status === "activo" || taller.status === "pausado" ? (
              <AdminActionItem><Modal triggerLabel="Desactivar" title="Desactivar aliado" description="Confirma la desactivación de este aliado." triggerClassName="text-danger">
                <form action={handleDeactivate}>
                  <input type="hidden" name="id" value={taller.id} />
                  <button type="submit" className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white">Confirmar desactivación</button>
                </form>
              </Modal></AdminActionItem>
            ) : null}
            <AdminActionItem><Link href={tabHref("editar")} className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Editar</Link></AdminActionItem>
          </AdminRowActions>
        }
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: taller.name }}
      />

      {created ? <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">Aliado creado correctamente.</div> : null}
      {saved ? <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">Cambios guardados correctamente.</div> : null}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      <AdminTabs tabs={tabs.map((t) => ({ href: tabHref(t.key), label: t.label, count: "count" in t ? t.count : undefined, active: activeTab === t.key }))} />

      {activeTab === "general" && (
        <div className="space-y-6">
        <AllyAvatarForm workshop={taller} />
        <SectionCard className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InputShell label="Responsable"><p className="text-sm text-gray-700">{taller.responsible_name ?? "—"}</p></InputShell>
            <InputShell label="Estado"><span className={`inline-block rounded-md px-2.5 py-1 text-sm font-semibold ${STATUS_BADGES[taller.status]}`}>{STATUS_LABELS[taller.status]}</span></InputShell>
            <InputShell label="Categoría"><p className="text-sm text-gray-700">{ALLY_CATEGORY_LABELS[taller.category] ?? taller.category}</p></InputShell>
            <InputShell label="Acceso">
              <p className="text-sm font-semibold text-gray-700">
                {taller.user_id
                  ? "Usuario creado"
                  : taller.status === "approved_pending_activation"
                    ? "Usuario por crear"
                    : "Sin usuario"}
              </p>
            </InputShell>
            <InputShell label="Ubicación"><p className="text-sm text-gray-700">{taller.city ?? "—"}, {taller.state}</p></InputShell>
            <InputShell label="Email"><p className="text-sm text-gray-700">{taller.email ?? "—"}</p></InputShell>
            <InputShell label="WhatsApp"><p className="text-sm text-gray-700">{taller.whatsapp || "—"}</p></InputShell>
            <InputShell label="Instagram"><p className="text-sm text-gray-700">{taller.instagram || "—"}</p></InputShell>
          </div>
          <div>
            <InputShell label="Descripción">
              <p className="text-sm text-gray-700">{taller.description || "Sin descripción."}</p>
            </InputShell>
          </div>
          <div>
            <InputShell label="Qué hacen">
              <p className="text-sm text-gray-700">{taller.what_they_do || "—"}</p>
            </InputShell>
          </div>
        </SectionCard>
        </div>
      )}

      {activeTab === "editar" && (
        <SectionCard className="p-6">
          <form action={handleUpdate} className="space-y-6">
            <input type="hidden" name="id" value={taller.id} />
            <div className="grid gap-5 sm:grid-cols-2">
              <InputShell label="Nombre del aliado *"><input name="name" defaultValue={taller.name} required className={compactInputClassName} /></InputShell>
              <InputShell label="Categoría *">
                <select name="category" defaultValue={taller.category} required className={compactInputClassName}>
                  {ALLY_CATEGORIES.map((value) => <option key={value} value={value}>{ALLY_CATEGORY_LABELS[value]}</option>)}
                </select>
              </InputShell>
              <InputShell label="Responsable *"><input name="responsibleName" defaultValue={taller.responsible_name ?? ""} required className={compactInputClassName} /></InputShell>
              <InputShell label="Correo electrónico *"><input name="email" type="email" defaultValue={taller.email ?? ""} required className={compactInputClassName} /></InputShell>
              <InputShell label="Teléfono"><input name="phone" defaultValue={taller.phone ?? ""} className={compactInputClassName} /></InputShell>
              <InputShell label="WhatsApp"><input name="whatsapp" defaultValue={taller.whatsapp ?? ""} className={compactInputClassName} /></InputShell>
              <InputShell label="Instagram"><input name="instagram" defaultValue={taller.instagram ?? ""} className={compactInputClassName} /></InputShell>
              <InputShell label="Estado *"><input name="state" defaultValue={taller.state} required className={compactInputClassName} /></InputShell>
              <InputShell label="Ciudad *"><input name="city" defaultValue={taller.city ?? ""} required className={compactInputClassName} /></InputShell>
              <InputShell label="Municipio"><input name="municipality" defaultValue={taller.municipality ?? ""} className={compactInputClassName} /></InputShell>
              <InputShell label="Ubicación pública"><input name="publicLocation" defaultValue={taller.public_location ?? ""} className={compactInputClassName} /></InputShell>
              <InputShell label="Qué hace o aporta"><input name="whatTheyDo" defaultValue={taller.what_they_do ?? ""} className={compactInputClassName} /></InputShell>
            </div>
            <InputShell label="Descripción"><textarea name="description" rows={3} defaultValue={taller.description ?? ""} className={compactInputClassName} /></InputShell>
            <InputShell label="Notas admin"><textarea name="adminNotes" rows={3} defaultValue={taller.admin_notes ?? ""} className={compactInputClassName} /></InputShell>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"><input type="checkbox" name="publicNameAllowed" defaultChecked={taller.public_name_allowed} /> <span className="text-sm font-medium text-gray-700">Mostrar nombre público</span></label>
              <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"><input type="checkbox" name="publicLocationAllowed" defaultChecked={taller.public_location_allowed} /> <span className="text-sm font-medium text-gray-700">Mostrar ubicación pública</span></label>
              <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"><input type="checkbox" name="publicInstagramAllowed" defaultChecked={taller.public_instagram_allowed} /> <span className="text-sm font-medium text-gray-700">Mostrar Instagram</span></label>
              <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"><input type="checkbox" name="publicWhatsappAllowed" defaultChecked={taller.public_whatsapp_allowed} /> <span className="text-sm font-medium text-gray-700">Mostrar WhatsApp</span></label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">Guardar cambios</button>
              <Link href={`/admin/aliados/${id}`} className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200">Cancelar</Link>
            </div>
          </form>
        </SectionCard>
      )}

      {activeTab === "necesidades" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Necesidades registradas</h2>
          {necesidadesResult ? <AdminRecordsSummary total={necesidadesResult.total} /> : null}
          {necesidades.length ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Necesidad</th><th className="px-4 py-3">Solicitado</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-gray-200">{necesidades.map((need) => <tr key={need.id} className="align-top hover:bg-gray-50"><td className="px-4 py-4"><p className="font-semibold text-ink">{need.title}</p>{need.description ? <p className="mt-1 text-sm text-gray-500">{need.description}</p> : null}</td><td className="px-4 py-4 text-gray-600">{need.requested_items ?? "-"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${need.status === "publicada" ? "bg-green-100 text-green-700" : need.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{need.status}</span></td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-gray-500">Este aliado no tiene tareas registradas.</p>}
          {necesidades.length && necesidadesResult ? <AdminPagination page={necesidadesResult.page} pageCount={necesidadesResult.pageCount} total={necesidadesResult.total} limit={necesidadesResult.limit} hrefForPage={(page) => relatedPageHref("necesidades", page)} /> : null}
        </div>
      )}


      {activeTab === "fotos" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Fotos</h2>
          {fotosResult ? <AdminRecordsSummary total={fotosResult.total} /> : null}
          {fotos.length ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Título</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fecha</th></tr></thead><tbody className="divide-y divide-gray-200">{fotos.map((photo) => <tr key={photo.id} className="align-top hover:bg-gray-50"><td className="px-4 py-4 font-semibold text-ink">{photo.title || "Sin título"}</td><td className="px-4 py-4 text-gray-600">{photo.description || "-"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${photo.status === "aprobada" ? "bg-green-100 text-green-700" : photo.status === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{photo.status}</span></td><td className="px-4 py-4 text-gray-500">{formatDateTime(photo.created_at)}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-gray-500">Este aliado no tiene fotos registradas.</p>}
          {fotos.length && fotosResult ? <AdminPagination page={fotosResult.page} pageCount={fotosResult.pageCount} total={fotosResult.total} limit={fotosResult.limit} hrefForPage={(page) => relatedPageHref("fotos", page)} /> : null}
        </div>
      )}
    </div>
  );
}
