import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTabs, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { LinkButton, compactInputClassName } from "@/components/ui";
import { GenerateAccessButton } from "@/components/generate-access-button";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { ALLY_CATEGORIES, ALLY_CATEGORY_LABELS } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminWorkshopsPage } from "@/lib/workshops";
import { deactivateWorkshopAction, reactivateWorkshopAction } from "@/app/admin/aliados/actions";

async function deactivateAction(formData: FormData) {
  "use server";
  await deactivateWorkshopAction(formData);
}

async function reactivateAction(formData: FormData) {
  "use server";
  await reactivateWorkshopAction(formData);
}

const WORKSHOPS_PER_PAGE = 15;

const TABS = [
  { value: "postulaciones", label: "Postulaciones" },
  { value: "aliados", label: "Aliados" },
] as const;

const POSTULATION_STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "pendiente", label: "Pendiente" },
  { value: "approved_pending_activation", label: "Aprobado pendiente activación" },
] as const;

const ACTIVE_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "pausado", label: "Pausado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "desactivado", label: "Desactivado" },
] as const;

const STATUS_BADGES: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
  pausado: "bg-gray-100 text-gray-600",
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

function canGenerateAccessLink(workshop: { user_id: string | null; status: string }) {
  return !workshop.user_id && !ACTIVATION_BLOCKED_STATUSES.includes(workshop.status);
}

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  const tab = getStringParam(params, "tab");
  const status = getStringParam(params, "status");
  const category = getStringParam(params, "category");
  const q = getStringParam(params, "q");
  if (tab) search.set("tab", tab);
  if (status) search.set("status", status);
  if (category) search.set("category", category);
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/aliados?${query}` : "/admin/aliados";
}

export default async function AdminAliadosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const tab = getStringParam(params, "tab") || "aliados";
  const status = getStringParam(params, "status") || "all";
  const category = getStringParam(params, "category") || "all";
  const q = getStringParam(params, "q");

  const result = await getAdminWorkshopsPage({
    page: getPageParam(params),
    limit: WORKSHOPS_PER_PAGE,
    tab: tab as "postulaciones" | "aliados",
    status: status === "all" ? undefined : status,
    category: category === "all" ? undefined : category,
    q: q || undefined,
  });
  let postulationsCount = tab === "postulaciones" ? result.total : 0;
  if (tab !== "postulaciones") {
    const admin = await createSupabaseServerClient();
    const { count } = await admin
      .from("allies")
      .select("id", { count: "exact", head: true })
      .in("status", ["pendiente", "approved_pending_activation"]);
    postulationsCount = count ?? 0;
  }

  const statusOptions = tab === "aliados" ? ACTIVE_STATUS_OPTIONS : POSTULATION_STATUS_OPTIONS;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Aliados"
        description="Gestiona las postulaciones, accesos y estados de los aliados de la red."
      />

      <div className="space-y-5">
        <AdminTabs
          tabs={TABS.map((t) => ({
            href: pageHref({ ...params, tab: t.value, status: undefined, page: undefined }, 1),
            label: t.label,
            count: t.value === "postulaciones" ? postulationsCount : undefined,
            active: tab === t.value,
          }))}
        />

        <AdminToolbar
          filters={
            <AutoSubmitFilterForm
              id="allies-filter"
              action="/admin/aliados"
              method="get"
              className="grid w-full min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(140px,180px)_minmax(140px,180px)]"
            >
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Buscar por nombre, responsable, ciudad o correo"
                aria-label="Buscar aliados"
                autoComplete="off"
                enterKeyHint="search"
                className={`${compactInputClassName} min-w-0 w-full`}
              />
              <select name="status" defaultValue={status} className={compactInputClassName}>
                {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select name="category" defaultValue={category} className={compactInputClassName}>
                <option value="all">Todas las categorías</option>
                {ALLY_CATEGORIES.map((value) => <option key={value} value={value}>{ALLY_CATEGORY_LABELS[value]}</option>)}
              </select>
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="tab" value={tab} />
            </AutoSubmitFilterForm>
          }
          actions={<LinkButton href="/admin/aliados/crear">Crear aliado</LinkButton>}
        />
      </div>

      <AdminRecordsSummary total={result.total} />

      {result.items.length ? (
        <div className="space-y-4">
          <AdminTableFrame>
            <table className="admin-mobile-cards min-w-[900px] w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[16%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[16%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td data-mobile="primary" data-mobile-label="Aliado" className="px-4 py-3 align-top leading-tight">
                      <Link href={`/admin/aliados/${w.id}`} className="font-semibold text-[#F74897] hover:underline">
                        {w.name}
                      </Link>
                    </td>
                    <td data-mobile-label="Categoría" className="px-4 py-3 align-top leading-tight">
                      <span className="inline-flex rounded-md bg-[#FFE4EC] px-2.5 py-1 text-sm font-semibold text-[#D6003F]">
                        {ALLY_CATEGORY_LABELS[w.category] ?? w.category}
                      </span>
                    </td>
                    <td data-mobile-label="Responsable" className="px-4 py-3 align-top text-gray-700 leading-tight">{w.responsible_name ?? "—"}</td>
                    <td data-mobile-label="Estado" className="px-4 py-3 align-top leading-tight">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-sm font-semibold ${STATUS_BADGES[w.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[w.status] || w.status}
                      </span>
                    </td>
                    <td data-mobile-label="Ubicación" className="px-4 py-3 align-top text-gray-600 leading-tight text-sm">{w.city ?? "—"}, {w.state}</td>
                    <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right align-top leading-tight">
                      <AdminRowActions>
                        <Link
                          href={`/admin/aliados/${w.id}`}
                          className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Detalle
                        </Link>
                        {canGenerateAccessLink(w) && (
                          <AdminActionItem><GenerateAccessButton workshopId={w.id} workshopName={w.name} /></AdminActionItem>
                        )}
                  {w.status === "desactivado" ? (
                    <AdminActionItem>
                      <form action={reactivateAction}>
                        <input type="hidden" name="id" value={w.id} />
                        <button type="submit" className="text-green-700">Reactivar</button>
                      </form>
                    </AdminActionItem>
                  ) : w.status === "activo" || w.status === "pausado" ? (
                    <AdminActionItem>
                      <form action={deactivateAction}>
                        <input type="hidden" name="id" value={w.id} />
                        <button type="submit" className="text-red-700">Desactivar</button>
                      </form>
                    </AdminActionItem>
                  ) : null}
                      </AdminRowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(p) => pageHref(params, p)}
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center">
          <p className="text-gray-500 font-medium">No hay aliados que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
