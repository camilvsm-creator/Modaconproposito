import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { SectionCard } from "@/components/ui";
import { DeleteWorkshopButton } from "@/components/delete-workshop-button";
import { GenerateAccessButton } from "@/components/generate-access-button";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminWorkshopsPage } from "@/lib/workshops";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deactivateWorkshopAction, reactivateWorkshopAction } from "@/app/admin/talleres/actions";

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
  { value: "talleres", label: "Talleres" },
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
  const q = getStringParam(params, "q");
  if (tab) search.set("tab", tab);
  if (status) search.set("status", status);
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/talleres?${query}` : "/admin/talleres";
}

export default async function AdminInicioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopAdminUser();
  const isPromoda = user.app_metadata?.role === "admin_talleres";
  const activeBg = isPromoda ? "bg-[#F74897]" : "bg-primary";

  const params = await searchParams;
  const tab = getStringParam(params, "tab") || "talleres";
  const status = getStringParam(params, "status") || "all";
  const q = getStringParam(params, "q");

  const result = await getAdminWorkshopsPage({
    page: getPageParam(params),
    limit: WORKSHOPS_PER_PAGE,
    tab: tab as "postulaciones" | "talleres",
    status: status === "all" ? undefined : status,
    q: q || undefined,
  });

  const admin = createSupabaseAdminClient();

  const [
    { count: totalTalleres },
    { count: talleresActivos },
    { count: postulacionesPendientes },
    { count: necesidadesCount },
  ] = await Promise.all([
    admin.from("workshops").select("id", { count: "exact", head: true }),
    admin.from("workshops").select("id", { count: "exact", head: true }).eq("status", "activo"),
    admin.from("workshops").select("id", { count: "exact", head: true }).in("status", ["pendiente", "approved_pending_activation"]),
    admin.from("workshop_needs").select("id", { count: "exact", head: true }).in("status", ["pendiente", "publicada"]),
  ]);

  const stats = [
    { label: "Talleres", value: totalTalleres ?? 0 },
    { label: "Activos", value: talleresActivos ?? 0 },
    { label: "Necesidades urgentes", value: necesidadesCount ?? 0 },
    { label: "Postulaciones pendientes", value: postulacionesPendientes ?? 0 },
  ];

  const statusOptions = tab === "talleres" ? ACTIVE_STATUS_OPTIONS : POSTULATION_STATUS_OPTIONS;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Inicio"
        description="Resumen general de la red de talleres."
        actions={
          <Link
            href="/admin/talleres/crear"
            className="inline-flex items-center justify-center rounded-full bg-[#F74897] px-5 py-3 text-sm font-semibold text-white hover:bg-[#D6003F] transition"
          >
            Crear taller
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <SectionCard key={stat.label} className="p-4">
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
          </SectionCard>
        ))}
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {TABS.map((t) => {
            const href = pageHref({ ...params, tab: t.value, status: undefined, page: undefined }, 1);
            const isActive = tab === t.value;
            return (
              <Link
                key={t.value}
                href={href}
                className={`rounded-t-lg px-5 py-2.5 text-sm font-semibold transition ${
                  isActive ? `${activeBg} text-white` : "bg-white text-stone-600 hover:text-stone-900"
                }`}
              >
                {t.label}
                {t.value === "postulaciones" && (postulacionesPendientes ?? 0) > 0 && (
                  <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? "bg-white text-[#F74897]" : "bg-[#F74897] text-white"
                  }`}>
                    {postulacionesPendientes}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((opt) => {
              const href = pageHref({ ...params, status: opt.value === "all" ? undefined : opt.value, page: undefined }, 1);
              const isActive = opt.value === "all" ? !status || status === "all" : status === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={href}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    isActive ? `${activeBg} text-white` : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
          <form action="/admin/talleres" method="get" className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[420px]">
            <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, responsable o ciudad" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm" />
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="tab" value={tab} />
            <button className={`rounded-lg ${activeBg} px-5 py-2.5 text-sm font-semibold text-white`} type="submit">Buscar</button>
          </form>
        </div>
      </div>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {result.items.map((w) => (
                  <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 align-top leading-tight">
                      <Link href={`/admin/talleres/listado/${w.id}`} className="font-semibold text-[#F74897] hover:underline">
                        {w.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">{w.responsible_name}</td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[w.status] || "bg-stone-100 text-stone-600"}`}>
                        {STATUS_LABELS[w.status] || w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-600 leading-tight text-sm">{w.city}, {w.state}</td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/admin/talleres/listado/${w.id}`}
                          className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#F74897] ring-1 ring-stone-300 hover:bg-stone-50 transition"
                        >
                          Detalle
                        </Link>
                        {!w.user_id && w.status !== "rechazado" && w.status !== "desactivado" && w.status !== "pendiente" && (
                          <GenerateAccessButton workshopId={w.id} workshopName={w.name} />
                        )}
                  {w.status === "desactivado" ? (
                    <form action={reactivateAction}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-600 ring-1 ring-green-300 hover:bg-green-50 transition"
                      >
                        Reactivar
                      </button>
                    </form>
                  ) : w.status === "activo" || w.status === "pausado" ? (
                    <form action={deactivateAction}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-300 hover:bg-red-50 transition"
                      >
                        Desactivar
                      </button>
                    </form>
                  ) : null}
                  {(w.status === "desactivado" || w.status === "rechazado" || w.status === "pendiente" || w.status === "approved_pending_activation") && (
                    <DeleteWorkshopButton workshopId={w.id} workshopName={w.name} />
                  )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((w) => (
              <div key={w.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-4">
                <div className="space-y-1 text-sm text-stone-700">
                  <Link href={`/admin/talleres/listado/${w.id}`} className="font-semibold text-[#F74897] hover:underline">{w.name}</Link>
                  <p className="text-stone-600">{w.responsible_name}</p>
                  <p className="text-stone-400">{w.city}, {w.state}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[w.status]}`}>{STATUS_LABELS[w.status]}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/admin/talleres/listado/${w.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#F74897] ring-1 ring-stone-300 hover:bg-stone-50 transition"
                  >
                    Ver detalle
                  </Link>
                  {!w.user_id && w.status !== "rechazado" && w.status !== "desactivado" && (
                    <GenerateAccessButton workshopId={w.id} workshopName={w.name} />
                  )}
                  {w.status === "desactivado" ? (
                    <form action={reactivateAction}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-600 ring-1 ring-green-300 hover:bg-green-50 transition"
                      >
                        Reactivar
                      </button>
                    </form>
                  ) : w.status === "activo" || w.status === "pausado" ? (
                    <form action={deactivateAction}>
                      <input type="hidden" name="id" value={w.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-300 hover:bg-red-50 transition"
                      >
                        Desactivar
                      </button>
                    </form>
                  ) : null}
                  {(w.status === "desactivado" || w.status === "rechazado" || w.status === "pendiente" || w.status === "approved_pending_activation") && (
                    <DeleteWorkshopButton workshopId={w.id} workshopName={w.name} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(p) => pageHref(params, p)}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 bg-white/75 p-12 text-center">
          <p className="text-stone-500 font-medium">No hay talleres que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
