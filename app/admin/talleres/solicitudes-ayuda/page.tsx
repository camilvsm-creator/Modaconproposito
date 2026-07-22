import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminHelpRequestsPage, getHelpRequestStats, STATUS_LABELS, STATUS_BADGES, URGENCY_LABELS, URGENCY_BADGES, REQUESTER_TYPE_LABELS } from "@/lib/help-requests";

const SOLICITUDES_PER_PAGE = 20;

const TABS = [
  { value: "pendientes", label: "Pendientes" },
  { value: "aprobadas", label: "Aprobadas" },
] as const;

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
  const q = getStringParam(params, "q");
  if (tab) search.set("tab", tab);
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/talleres/solicitudes-ayuda?${query}` : "/admin/talleres/solicitudes-ayuda";
}

export default async function AdminSolicitudesAyudaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const tab = (getStringParam(params, "tab") || "pendientes") as "pendientes" | "aprobadas";
  const q = getStringParam(params, "q");

  const [result, stats] = await Promise.all([
    getAdminHelpRequestsPage({
      tab,
      page: getPageParam(params),
      limit: SOLICITUDES_PER_PAGE,
      q: q || undefined,
    }),
    getHelpRequestStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Aliados"
        title="Solicitudes de ayuda"
        description="Solicitudes de productos textiles recibidas desde la página pública."
        meta={`${stats.total} solicitudes`}
        navigation={{ baseHref: "/admin/talleres", baseLabel: "Aliados", currentLabel: "Solicitudes" }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{stats.total}</p>
          <p className="mt-1 text-sm text-stone-500">Total</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{stats.pending}</p>
          <p className="mt-1 text-sm text-stone-500">Pendientes</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{stats.inProcess}</p>
          <p className="mt-1 text-sm text-stone-500">En proceso</p>
        </SectionCard>
        <SectionCard className="p-4">
          <p className="text-3xl font-bold text-ink">{stats.delivered}</p>
          <p className="mt-1 text-sm text-stone-500">Entregadas</p>
        </SectionCard>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {TABS.map((t) => {
            const href = pageHref({ ...params, tab: t.value, page: undefined }, 1);
            const isActive = tab === t.value;
            return (
              <Link
                key={t.value}
                href={href}
                className={`rounded-t-lg px-5 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-[#F74897] text-white" : "bg-white text-stone-600 hover:text-stone-900"
                }`}
              >
                {t.label}
                {t.value === "pendientes" && stats.pending > 0 && (
                  <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? "bg-white text-[#F74897]" : "bg-[#F74897] text-white"
                  }`}>
                    {stats.pending}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <form action="/admin/talleres/solicitudes-ayuda" method="get" className="flex gap-3">
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, organización o ciudad" className="w-full max-w-md rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm" />
          <button className="rounded-lg bg-[#F74897] px-5 py-2.5 text-sm font-semibold text-white" type="submit">Buscar</button>
        </form>

        {result.items.length ? (
          <div className="space-y-4">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Solicitante</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Ciudad</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Urgencia</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {result.items.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 align-top text-stone-500">{r.sequentialNumber}</td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <Link href={`/admin/talleres/solicitudes-ayuda/${r.id}`} className="hover:underline">
                          <p className="font-semibold text-ink">{r.fullName}</p>
                        </Link>
                        {r.organization ? <p className="text-stone-500">{r.organization}</p> : null}
                      </td>
                      <td className="px-4 py-3 align-top text-stone-600">{REQUESTER_TYPE_LABELS[r.requesterType]}</td>
                      <td className="px-4 py-3 align-top text-stone-600">{r.city}</td>
                      <td className="px-4 py-3 align-top text-stone-600">
                        {r.products.map((p) => p.name).join(", ")}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${URGENCY_BADGES[r.urgency]}`}>
                          {URGENCY_LABELS[r.urgency]}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-stone-500">
                        {new Date(r.createdAt).toLocaleDateString("es-VE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {result.items.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/talleres/solicitudes-ayuda/${r.id}`}
                  className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3 transition hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-ink">{r.fullName}</p>
                      {r.organization ? <p className="text-stone-500">{r.organization}</p> : null}
                      <p className="text-stone-500">{r.city}</p>
                    </div>
                    <span className="text-xs text-stone-400">#{r.sequentialNumber}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${URGENCY_BADGES[r.urgency]}`}>
                      {URGENCY_LABELS[r.urgency]}
                    </span>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_BADGES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {r.products.map((p) => p.name).join(", ")}
                  </p>
                </Link>
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
          <EmptyState
            title="No hay solicitudes"
            description={tab === "pendientes" ? "No hay solicitudes pendientes." : "No hay solicitudes aprobadas."}
          />
        )}
      </div>
    </div>
  );
}
