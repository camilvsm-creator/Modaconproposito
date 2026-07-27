import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminToolbar } from "@/components/admin-data-ui";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { compactInputClassName } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminCollaboratorsPage } from "@/lib/workshops";
import { formatDate } from "@/lib/utils";
import { CollaboratorCreateButton, CollaboratorEditButton } from "./components/collaborator-admin-actions";
import { updateCollaboratorStatusAction } from "./actions";

const COLLABORATORS_PER_PAGE = 20;

const COLLABORATOR_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  inactivo: "Inactivo",
};

const COLLABORATOR_STATUS_BADGES: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pausado: "bg-amber-100 text-amber-700",
  inactivo: "bg-gray-100 text-gray-600",
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
      />

      <AdminToolbar
        filters={
        <AutoSubmitFilterForm action="/admin/colaboradores" method="get" className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, contacto o email" className={compactInputClassName} />
        <select name="status" defaultValue={status} className={compactInputClassName}>
          <option value="all">Todos los estados</option>
          {Object.entries(COLLABORATOR_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} className={compactInputClassName}>
          <option value="all">Todos los tipos</option>
          {Object.entries(COLLABORATOR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        </AutoSubmitFilterForm>
        }
        actions={<CollaboratorCreateButton />}
      />

      <AdminRecordsSummary total={result.total} />

      {result.items.length ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[1040px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Tipo</th>
                  <th className="px-4 py-2.5">Contacto</th>
                  <th className="px-4 py-2.5">Ubicación</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5">Notas</th>
                  <th className="px-4 py-2.5">Registro</th>
                  <th className="px-4 py-2.5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-gray-50 transition-colors">
                    <td data-mobile="primary" data-mobile-label="Colaborador" className="px-4 py-2.5 align-top leading-tight">
                      <p className="font-semibold text-ink">{collaborator.name}</p>
                    </td>
                    <td data-mobile-label="Tipo" className="px-4 py-2.5 align-top leading-tight text-gray-700">
                      {COLLABORATOR_TYPE_LABELS[collaborator.type] ?? collaborator.type}
                    </td>
                    <td data-mobile-label="Contacto" className="px-4 py-2.5 align-top text-gray-700 leading-tight">
                      <p>{collaborator.contact_name ?? "—"}</p>
                      {collaborator.email ? <p className="text-sm text-gray-500">{collaborator.email}</p> : null}
                      {collaborator.phone ? <p className="text-sm text-gray-500">{collaborator.phone}</p> : null}
                    </td>
                    <td data-mobile-label="Ubicación" className="px-4 py-2.5 align-top text-gray-700 leading-tight">{collaborator.location ?? "—"}</td>
                    <td data-mobile-label="Estado" className="px-4 py-2.5 align-top leading-tight">
                      <span className={`inline-block rounded-md px-2.5 py-1 text-sm font-semibold ${COLLABORATOR_STATUS_BADGES[collaborator.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {COLLABORATOR_STATUS_LABELS[collaborator.status] ?? collaborator.status}
                      </span>
                    </td>
                    <td data-mobile="hidden" data-mobile-label="Notas" className="px-4 py-2.5 align-top text-gray-600 leading-tight">
                      <p className="max-w-xs whitespace-pre-wrap">{collaborator.notes ?? "—"}</p>
                    </td>
                    <td data-mobile-label="Registro" className="px-4 py-2.5 align-top text-gray-500 leading-tight">{formatDate(collaborator.created_at)}</td>
                    <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-2.5 align-top"><AdminRowActions><AdminActionItem><CollaboratorEditButton collaborator={collaborator} /></AdminActionItem>{collaborator.status !== "inactivo" ? <><AdminActionItem><form action={updateCollaboratorStatusAction}><input type="hidden" name="id" value={collaborator.id} /><input type="hidden" name="status" value={collaborator.status === "pausado" ? "activo" : "pausado"} /><button className="text-primary" type="submit">{collaborator.status === "pausado" ? "Reactivar" : "Pausar"}</button></form></AdminActionItem><AdminActionItem><form action={updateCollaboratorStatusAction}><input type="hidden" name="id" value={collaborator.id} /><input type="hidden" name="status" value="inactivo" /><button className="text-danger" type="submit">Desactivar</button></form></AdminActionItem></> : <AdminActionItem><form action={updateCollaboratorStatusAction}><input type="hidden" name="id" value={collaborator.id} /><input type="hidden" name="status" value="activo" /><button className="text-primary" type="submit">Reactivar</button></form></AdminActionItem>}</AdminRowActions></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
