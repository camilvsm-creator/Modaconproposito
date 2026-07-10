import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { Button } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { mockTalleresExtendidos } from "@/lib/mock-data";

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
] as const;

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
  return query ? `/admin/talleres/talleres?${query}` : "/admin/talleres/talleres";
}

export default async function AdminTalleresListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopAdminUser();
  const isPromoda = user.app_metadata?.role === "admin_talleres";
  const activeBg = isPromoda ? "bg-[#F74897]" : "bg-primary";
  const promodaBtnClass = isPromoda ? "bg-[#F74897] hover:bg-[#D6003F] focus-visible:ring-[#F74897]/30" : "";

  const params = await searchParams;
  const tab = getStringParam(params, "tab") || "postulaciones";
  const status = getStringParam(params, "status") || "all";
  const q = getStringParam(params, "q");

  const statusOptions = tab === "talleres" ? ACTIVE_STATUS_OPTIONS : POSTULATION_STATUS_OPTIONS;

  let filtered = mockTalleresExtendidos;
  if (tab === "postulaciones") {
    filtered = filtered.filter((w) => w.status === "pendiente" || w.status === "approved_pending_activation");
  } else if (tab === "talleres") {
    filtered = filtered.filter((w) => ["activo", "pausado", "rechazado"].includes(w.status));
  }
  if (status !== "all") {
    filtered = filtered.filter((w) => w.status === status);
  }
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter((w) => w.name.toLowerCase().includes(ql) || w.responsibleName.toLowerCase().includes(ql) || w.ciudad.toLowerCase().includes(ql));
  }

  const total = filtered.length;
  const page = getPageParam(params);
  const pageCount = Math.max(Math.ceil(total / WORKSHOPS_PER_PAGE), 1);
  const paged = filtered.slice((page - 1) * WORKSHOPS_PER_PAGE, page * WORKSHOPS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Promoda"
          title="Red de Talleres Voluntarios"
          meta={`${total} talleres`}
          navigation={{ baseHref: "/admin/talleres", baseLabel: "Dashboard", currentLabel: "Talleres" }}
        />

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
          <form action="/admin/talleres/talleres" method="get" className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[420px]">
            <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, responsable o ciudad" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm" />
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="tab" value={tab} />
            <button className={`rounded-lg ${activeBg} px-5 py-2.5 text-sm font-semibold text-white`} type="submit">Buscar</button>
          </form>
        </div>
      </div>

      {paged.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[1280px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Especialidades</th>
                  <th className="px-4 py-3">Producciones</th>
                  <th className="px-4 py-3">Voluntarios</th>
                  <th className="px-4 py-3">Necesidades</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {paged.map((w) => (
                  <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 align-top leading-tight">
                      <Link href={`/admin/talleres/talleres/${w.id}`} className="font-semibold text-[#F74897] hover:underline">
                        {w.name}
                      </Link>
                      <p className="text-xs text-stone-400">{w.ciudad}, {w.estado}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">{w.responsibleName}</td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[w.status] || "bg-stone-100 text-stone-600"}`}>
                        {STATUS_LABELS[w.status] || w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-600 leading-tight text-sm">{w.especialidades}</td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className="font-semibold text-ink">{w.produccionesActivas}</span>
                      <span className="text-stone-400 ml-1">activas</span>
                    </td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className="font-semibold text-ink">{w.voluntariosAsignados}</span>
                      <span className="text-stone-400 ml-1">asignados</span>
                    </td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className="font-semibold text-ink">{w.necesidadesAbiertas}</span>
                      <span className="text-stone-400 ml-1">abiertas</span>
                    </td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <Link
                        href={`/admin/talleres/talleres/${w.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#F74897] ring-1 ring-stone-300 hover:bg-stone-50 transition"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {paged.map((w) => (
              <div key={w.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-4">
                <div className="space-y-1 text-sm text-stone-700">
                  <Link href={`/admin/talleres/talleres/${w.id}`} className="font-semibold text-[#F74897] hover:underline">{w.name}</Link>
                  <p className="text-stone-600">{w.responsibleName}</p>
                  <p className="text-stone-400">{w.ciudad}, {w.estado}</p>
                  <p className="text-stone-500">{w.especialidades}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[w.status]}`}>{STATUS_LABELS[w.status]}</span>
                  <span className="text-sm text-stone-500">{w.produccionesActivas} producciones · {w.voluntariosAsignados} voluntarios · {w.necesidadesAbiertas} necesidades</span>
                </div>
                <Link
                  href={`/admin/talleres/talleres/${w.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#F74897] ring-1 ring-stone-300 hover:bg-stone-50 transition"
                >
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>

          <AdminPagination
            page={page}
            pageCount={pageCount}
            total={total}
            limit={WORKSHOPS_PER_PAGE}
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
