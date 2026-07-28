import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { GenerateRequesterAccessButton } from "@/components/generate-requester-access-button";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import {
  AID_REQUESTER_STATUS_LABELS,
  AID_REQUESTER_STATUS_TONES,
  AID_REQUESTER_TYPE_LABELS,
  AID_REQUESTER_TYPES,
} from "@/lib/constants";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminAidRequestersPage } from "@/lib/requesters";
import { cn, formatDate } from "@/lib/utils";

import {
  createAidRequesterAction,
  updateAidRequesterAction,
  updateAidRequesterStatusAction,
} from "./actions";

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
  return query ? `/admin/solicitantes?${query}` : "/admin/solicitantes";
}

function RequesterForm({ requesterId, defaults }: {
  requesterId?: string;
  defaults?: {
    name: string;
    type: string;
    contactName: string;
    email: string;
    phone: string;
    location: string;
    notes: string;
  };
}) {
  return (
    <form action={requesterId ? updateAidRequesterAction : createAidRequesterAction} className="grid gap-3 md:grid-cols-2">
      {requesterId ? <input type="hidden" name="requesterId" value={requesterId} /> : null}
      <input className={compactInputClassName} name="name" defaultValue={defaults?.name} required placeholder="Nombre de la organización" />
      <select className={compactInputClassName} name="type" defaultValue={defaults?.type ?? "institucion"}>
        {AID_REQUESTER_TYPES.map((type) => <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>)}
      </select>
      <input className={compactInputClassName} name="contactName" defaultValue={defaults?.contactName} required placeholder="Persona responsable" />
      <input className={compactInputClassName} name="email" type="email" defaultValue={defaults?.email} placeholder="Correo de contacto" />
      <input className={compactInputClassName} name="phone" defaultValue={defaults?.phone} placeholder="Teléfono" />
      <input className={compactInputClassName} name="location" defaultValue={defaults?.location} placeholder="Ubicación" />
      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" defaultValue={defaults?.notes} placeholder="Notas" />
      <div className="md:col-span-2">
        <Button type="submit">{requesterId ? "Guardar cambios" : "Guardar solicitante"}</Button>
      </div>
    </form>
  );
}

function RequestersTable({ requesters }: { requesters: Array<{
  id: string;
  name: string;
  type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
  notes: string | null;
}> }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[1080px] w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Solicitante</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acceso</th>
            <th className="px-4 py-3">Registro</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requesters.map((requester) => (
            <tr key={requester.id} className="align-top hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Solicitante" className="px-4 py-4">
                <p className="font-semibold text-ink">{requester.name}</p>
                <p className="mt-1 text-sm text-gray-500">{requester.location ?? "Sin ubicación"}</p>
              </td>
              <td data-mobile-label="Tipo" className="px-4 py-4 text-gray-600">{AID_REQUESTER_TYPE_LABELS[requester.type] ?? requester.type}</td>
              <td data-mobile-label="Contacto" className="px-4 py-4 text-gray-600">
                <p>{requester.contact_name ?? "-"}</p>
                <p>{requester.email ?? "-"}</p>
                <p>{requester.phone ?? "-"}</p>
              </td>
              <td data-mobile-label="Estado" className="px-4 py-4">
                <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", AID_REQUESTER_STATUS_TONES[requester.status] ?? "bg-gray-100 text-gray-700")}>
                  {AID_REQUESTER_STATUS_LABELS[requester.status] ?? requester.status}
                </span>
              </td>
              <td data-mobile-label="Acceso" className="px-4 py-4 text-gray-600">{requester.user_id ? "Cuenta vinculada" : "Sin cuenta"}</td>
              <td data-mobile-label="Registro" className="px-4 py-4 text-gray-500">{formatDate(requester.created_at)}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right">
                <AdminRowActions>
                  <AdminActionItem>
                    <Modal triggerLabel="Editar" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title={requester.name} description="Actualiza los datos del solicitante.">
                      <RequesterForm
                        requesterId={requester.id}
                        defaults={{
                          name: requester.name,
                          type: requester.type,
                          contactName: requester.contact_name ?? "",
                          email: requester.email ?? "",
                          phone: requester.phone ?? "",
                          location: requester.location ?? "",
                          notes: requester.notes ?? "",
                        }}
                      />
                    </Modal>
                  </AdminActionItem>
                  {!requester.user_id ? <AdminActionItem><GenerateRequesterAccessButton requesterId={requester.id} requesterName={requester.name} /></AdminActionItem> : null}
                  {(["activo", "pausado", "inactivo"] as const).map((nextStatus) => (
                    <AdminActionItem key={nextStatus}>
                      <form action={updateAidRequesterStatusAction}>
                        <input type="hidden" name="requesterId" value={requester.id} />
                        <input type="hidden" name="status" value={nextStatus} />
                        <button className={cn(requester.status === nextStatus ? "text-primary" : "text-gray-700")} type="submit">
                          {AID_REQUESTER_STATUS_LABELS[nextStatus]}
                        </button>
                      </form>
                    </AdminActionItem>
                  ))}
                </AdminRowActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

export default async function AdminSolicitantesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status") ?? "all";
  const type = getStringParam(params, "type") ?? "all";
  const result = await getAdminAidRequestersPage({ page: getPageParam(params), limit: 20, q, status, type });
  const requesters = result.items;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Solicitantes"
        title="Solicitantes"
        description="Gestiona las organizaciones que registran solicitudes de ayuda y sus accesos."
      />

      <AdminToolbar
        filters={(
          <AutoSubmitFilterForm action="/admin/solicitantes" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_repeat(2,minmax(140px,180px))]">
            <input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, responsable o email" />
            <select className={compactInputClassName} name="status" defaultValue={status}>
              <option value="all">Todos los estados</option>
              {Object.entries(AID_REQUESTER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className={compactInputClassName} name="type" defaultValue={type}>
              <option value="all">Todos los tipos</option>
              {AID_REQUESTER_TYPES.map((value) => <option key={value} value={value}>{AID_REQUESTER_TYPE_LABELS[value]}</option>)}
            </select>
          </AutoSubmitFilterForm>
        )}
        actions={(
          <Modal triggerLabel="Nuevo solicitante" triggerVariant="primary" title="Crear solicitante" description="Registra una nueva organización solicitante.">
            <RequesterForm />
          </Modal>
        )}
      />

      <AdminRecordsSummary total={result.total} />

      {requesters.length ? (
        <>
        <RequestersTable requesters={requesters} />
        <AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(page) => pageHref(params, page)} />
        </>
      ) : (
        <EmptyState title="No hay solicitantes registrados." description="Crea el primer solicitante para poder registrar solicitudes de ayuda." />
      )}
    </div>
  );
}
