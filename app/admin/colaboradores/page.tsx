import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminCollaboratorsPage } from "@/lib/workshops";
import { formatDate } from "@/lib/utils";

const COLLABORATORS_PER_PAGE = 20;

const COLLABORATOR_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  inactivo: "Inactivo",
};

const COLLABORATOR_STATUS_BADGES: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pausado: "bg-amber-100 text-amber-700",
  inactivo: "bg-stone-100 text-stone-600",
};

const COLLABORATOR_TYPE_LABELS: Record<string, string> = {
  donador: "Donador",
  centro_telas: "Centro de telas",
  proveedor: "Proveedor",
  empresa: "Empresa",
  otro: "Otro",
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
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status");
  const type = getStringParam(params, "type");
  if (q) search.set("q", q);
  if (status && status !== "all") search.set("status", status);
  if (type && type !== "all") search.set("type", type);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/colaboradores?${query}` : "/admin/colaboradores";
}

export default async function AdminCollaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status") || "all";
  const type = getStringParam(params, "type") || "all";

  const result = await getAdminCollaboratorsPage({
    page: getPageParam(params),
    limit: COLLABORATORS_PER_PAGE,
    q,
    status,
    type,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Colaboradores"
        description="Listado de colaboradores registrados en la red."
        meta={`${result.total} colaboradores`}
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Colaboradores" }}
      />

      <form action="/admin/colaboradores" method="get" className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
        <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, contacto o email" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm" />
        <select name="status" defaultValue={status} className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700">
          <option value="all">Todos los estados</option>
          {Object.entries(COLLABORATOR_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700">
          <option value="all">Todos los tipos</option>
          {Object.entries(COLLABORATOR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="rounded-lg bg-[#F74897] px-5 py-2.5 text-sm font-semibold text-white" type="submit">Buscar</button>
      </form>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Tipo</th>
                  <th className="px-4 py-2.5">Contacto</th>
                  <th className="px-4 py-2.5">Ubicación</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5">Notas</th>
                  <th className="px-4 py-2.5">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {result.items.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5 align-top leading-tight">
                      <p className="font-semibold text-ink">{collaborator.name}</p>
                    </td>
                    <td className="px-4 py-2.5 align-top leading-tight text-stone-700">
                      {COLLABORATOR_TYPE_LABELS[collaborator.type] ?? collaborator.type}
                    </td>
                    <td className="px-4 py-2.5 align-top text-stone-700 leading-tight">
                      <p>{collaborator.contact_name ?? "—"}</p>
                      {collaborator.email ? <p className="text-sm text-stone-500">{collaborator.email}</p> : null}
                      {collaborator.phone ? <p className="text-sm text-stone-500">{collaborator.phone}</p> : null}
                    </td>
                    <td className="px-4 py-2.5 align-top text-stone-700 leading-tight">{collaborator.location ?? "—"}</td>
                    <td className="px-4 py-2.5 align-top leading-tight">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${COLLABORATOR_STATUS_BADGES[collaborator.status] ?? "bg-stone-100 text-stone-600"}`}>
                        {COLLABORATOR_STATUS_LABELS[collaborator.status] ?? collaborator.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-top text-stone-600 leading-tight">
                      <p className="max-w-xs whitespace-pre-wrap">{collaborator.notes ?? "—"}</p>
                    </td>
                    <td className="px-4 py-2.5 align-top text-stone-500 leading-tight">{formatDate(collaborator.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((collaborator) => (
              <div key={collaborator.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
                <div className="space-y-1 text-sm text-stone-700">
                  <p className="font-semibold text-ink">{collaborator.name}</p>
                  <p>{COLLABORATOR_TYPE_LABELS[collaborator.type] ?? collaborator.type}</p>
                  <p>{collaborator.contact_name ?? "—"}</p>
                  {collaborator.email ? <p className="text-stone-500">{collaborator.email}</p> : null}
                  {collaborator.phone ? <p className="text-stone-500">{collaborator.phone}</p> : null}
                  {collaborator.location ? <p className="text-stone-500">{collaborator.location}</p> : null}
                  <p className="text-stone-500">{formatDate(collaborator.created_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${COLLABORATOR_STATUS_BADGES[collaborator.status] ?? "bg-stone-100 text-stone-600"}`}>
                    {COLLABORATOR_STATUS_LABELS[collaborator.status] ?? collaborator.status}
                  </span>
                </div>
                {collaborator.notes ? <p className="text-sm text-stone-600 whitespace-pre-wrap">{collaborator.notes}</p> : null}
              </div>
            ))}
          </div>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(page) => pageHref(params, page)}
          />
        </div>
      ) : (
        <EmptyState title="No hay colaboradores registrados." description="Cuando se registren colaboradores aparecerán aquí." />
      )}
    </div>
  );
}
