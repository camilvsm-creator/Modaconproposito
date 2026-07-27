import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { LazyAllySelect } from "@/components/lazy-ally-select";
import { LazyRequesterSelect } from "@/components/lazy-requester-select";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import {
  AID_REQUEST_STATUSES,
  AID_REQUEST_STATUS_LABELS,
  AID_REQUEST_STATUS_TONES,
  AID_REQUESTER_STATUS_TONES,
  AID_REQUESTER_TYPE_LABELS,
  AID_REQUESTER_TYPES,
  URGENCY_LABELS,
  URGENCY_LEVELS,
} from "@/lib/constants";
import { requireRequestsUser, requireWorkshopAdminUser } from "@/lib/auth";
import {
  getAdminAidRequestsPage,
  getRequesterAidRequestsPage,
} from "@/lib/requesters";
import { cn, formatDate } from "@/lib/utils";
import type { AidRequestWithRelations } from "@/lib/types";

import { requireCurrentRequester } from "../requester-scope";
import {
  createAidRequestAction,
  createTaskFromAidRequestAction,
  updateAidRequestAction,
  updateAidRequesterAction,
} from "./actions";

const REQUESTS_PER_PAGE = 20;

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
  if (q) search.set("q", q);
  if (status && status !== "all") search.set("status", status);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/solicitudes?${query}` : "/admin/solicitudes";
}

function RequesterRequestsTable({ requests }: { requests: AidRequestWithRelations[] }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[920px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr><th className="px-4 py-3">Solicitud</th><th className="px-4 py-3">Solicitado</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Registro</th><th className="px-4 py-3 text-right">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((request) => {
            const canEdit = ["recibida", "en_revision"].includes(request.status);
            return (
              <tr key={request.id} className="align-top hover:bg-gray-50">
                <td data-mobile="primary" data-mobile-label="Solicitud" className="px-4 py-4"><Link href={`/admin/solicitudes/${request.id}`} className="font-semibold text-ink hover:text-primary">{request.title}</Link>{request.description ? <p className="mt-1 max-w-sm text-sm text-gray-500">{request.description}</p> : null}</td>
                <td data-mobile-label="Solicitado" className="px-4 py-4 text-gray-600">{request.requested_items ?? "-"}</td>
                <td data-mobile-label="Estado" className="px-4 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", AID_REQUEST_STATUS_TONES[request.status] ?? "bg-gray-100 text-gray-700")}>{AID_REQUEST_STATUS_LABELS[request.status] ?? request.status}</span></td>
                <td data-mobile-label="Registro" className="px-4 py-4 text-gray-500">{formatDate(request.created_at)}</td>
                <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right">{canEdit ? <AdminRowActions><AdminActionItem><Modal triggerLabel="Editar solicitud" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title={request.title} description="Actualiza esta solicitud mientras siga abierta o en revisión."><form action={updateAidRequestAction} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="requestId" value={request.id} /><input className={compactInputClassName} name="title" defaultValue={request.title} required /><select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" defaultValue={request.requested_items ?? ""} /><div className="md:col-span-2"><Button type="submit" variant="secondary">Actualizar solicitud</Button></div></form></Modal></AdminActionItem></AdminRowActions> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function AidRequestsTable({ requests }: { requests: AidRequestWithRelations[] }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr><th className="px-4 py-3">Solicitud</th><th className="px-4 py-3">Solicitante</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Registro</th><th className="px-4 py-3 text-right">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="align-top hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Solicitud" className="px-4 py-4"><Link href={`/admin/solicitudes/${request.id}`} className="font-semibold text-ink hover:text-primary">{request.title}</Link>{request.description ? <p className="mt-1 max-w-sm text-sm text-gray-500">{request.description}</p> : null}{request.requested_items ? <p className="mt-1 max-w-sm text-sm text-gray-500">Solicitado: {request.requested_items}</p> : null}</td>
              <td data-mobile-label="Solicitante" className="px-4 py-4 text-gray-600">{request.requester?.name ?? "-"}</td>
              <td data-mobile-label="Estado" className="px-4 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", AID_REQUEST_STATUS_TONES[request.status] ?? "bg-gray-100 text-gray-700")}>{AID_REQUEST_STATUS_LABELS[request.status] ?? request.status}</span></td>
              <td data-mobile-label="Registro" className="px-4 py-4 text-gray-500">{formatDate(request.created_at)}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right"><AdminRowActions><AdminActionItem><Modal triggerLabel="Editar" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title={request.title} description="Actualiza la solicitud y sus notas internas."><form action={updateAidRequestAction} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="requestId" value={request.id} /><input className={compactInputClassName} name="title" defaultValue={request.title} required /><select className={compactInputClassName} name="status" defaultValue={request.status}>{AID_REQUEST_STATUSES.map((item) => <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>)}</select><select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" defaultValue={request.requested_items ?? ""} /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="adminNotes" defaultValue={request.admin_notes ?? ""} placeholder="Notas internas de revisión" /><div className="md:col-span-2"><Button type="submit" variant="secondary">Actualizar solicitud</Button></div></form></Modal></AdminActionItem>{request.status !== "cerrada" ? <AdminActionItem><Modal triggerLabel="Crear tarea" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title="Crear tarea desde solicitud" description="Convierte esta solicitud en una tarea para un aliado."><form action={createTaskFromAidRequestAction} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="requestId" value={request.id} /><LazyAllySelect /><input className={compactInputClassName} name="title" required defaultValue={request.title} placeholder="Título de la tarea" /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={request.description ?? ""} placeholder="Descripción de la tarea" /><input className={compactInputClassName} name="expectedOutput" defaultValue={request.requested_items ?? ""} placeholder="Resultado esperado" /><input className={compactInputClassName} name="dueDate" type="date" /><select className={compactInputClassName} name="urgency" defaultValue={request.urgency ?? ""}><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="adminNotes" defaultValue={request.admin_notes ?? ""} placeholder="Notas internas para la tarea" /><div className="md:col-span-2"><Button type="submit">Crear tarea desde solicitud</Button></div></form></Modal></AdminActionItem> : null}</AdminRowActions></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

export default async function AdminSolicitudesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRequestsUser();
  const params = await searchParams;
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status") ?? "all";
  const page = getPageParam(params);

  if (user.app_metadata?.role === "solicitante") {
    const requester = await requireCurrentRequester();
    const result = await getRequesterAidRequestsPage(requester.id, { page, limit: REQUESTS_PER_PAGE, q, status });

    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Solicitudes" title="Solicitudes de ayuda" description="Registra necesidades de tu organización y sigue el estado de producción y entrega." />
        <div className="admin-page-actions flex flex-wrap justify-end gap-3">
          <Modal triggerLabel="Editar organización" title="Organización" description="Actualiza los datos principales de tu organización."><form action={updateAidRequesterAction} className="grid gap-4 md:grid-cols-2"><input type="hidden" name="requesterId" value={requester.id} /><input className={compactInputClassName} name="name" defaultValue={requester.name} required /><select className={compactInputClassName} name="type" defaultValue={requester.type}>{AID_REQUESTER_TYPES.map((type) => <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>)}</select><input className={compactInputClassName} name="contactName" defaultValue={requester.contact_name ?? ""} required /><input className={compactInputClassName} name="email" type="email" defaultValue={requester.email ?? ""} /><input className={compactInputClassName} name="phone" defaultValue={requester.phone ?? ""} /><input className={compactInputClassName} name="location" defaultValue={requester.location ?? ""} /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" defaultValue={requester.notes ?? ""} /><div className="md:col-span-2 flex flex-wrap items-center gap-3"><Button type="submit" variant="secondary">Actualizar organización</Button><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", AID_REQUESTER_STATUS_TONES[requester.status] ?? "bg-gray-100 text-gray-600")}>{requester.status}</span></div></form></Modal>
          <Modal triggerLabel="Nueva solicitud" title="Nueva solicitud" description="Registra una nueva necesidad para tu organización."><form action={createAidRequestAction} className="grid gap-4 md:grid-cols-2"><input className={compactInputClassName} name="title" required placeholder="Título" /><select className={compactInputClassName} name="urgency" defaultValue=""><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Describe la necesidad" /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" placeholder="Ej. 10 franelas talla mixta" /><div className="md:col-span-2"><Button type="submit">Registrar solicitud</Button></div></form></Modal>
        </div>
        <AutoSubmitFilterForm action="/admin/solicitudes" method="get" className="grid gap-3 md:grid-cols-[1fr_220px]"><input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar por título o descripción" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todos los estados</option>{AID_REQUEST_STATUSES.map((item) => <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>)}</select></AutoSubmitFilterForm>
        <AdminRecordsSummary total={result.total} />
        {result.items.length ? <><RequesterRequestsTable requests={result.items} /><AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, nextPage)} /></> : <EmptyState title="Sin solicitudes registradas" description="Cuando registres tu primera solicitud aparecerá aquí." />}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const result = await getAdminAidRequestsPage({ page, limit: REQUESTS_PER_PAGE, q, status });

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Solicitudes" title="Solicitudes de ayuda" description="Revisa solicitudes y conviértelas en tareas para los aliados." />
      <AdminToolbar
        filters={<AutoSubmitFilterForm action="/admin/solicitudes" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(160px,220px)]"><input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar texto" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todos los estados</option>{AID_REQUEST_STATUSES.map((item) => <option key={item} value={item}>{AID_REQUEST_STATUS_LABELS[item]}</option>)}</select></AutoSubmitFilterForm>}
        actions={<Modal triggerLabel="Nueva solicitud" title="Crear solicitud desde admin" description="Registra una solicitud en nombre de un solicitante existente."><form action={createAidRequestAction} className="grid gap-4 md:grid-cols-2"><LazyRequesterSelect /><input className={compactInputClassName} name="title" required placeholder="Título" /><select className={compactInputClassName} name="urgency" defaultValue=""><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select><div className="hidden md:block" /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Describe la necesidad" /><textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" placeholder="Resultado esperado o cantidades solicitadas" /><div className="md:col-span-2"><Button type="submit">Registrar solicitud</Button></div></form></Modal>}
      />
      <AdminRecordsSummary total={result.total} />
      {result.items.length ? <><AidRequestsTable requests={result.items} /><AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, nextPage)} /></> : <EmptyState title="Sin solicitudes registradas" description="Las solicitudes aparecerán aquí para convertirlas en tareas y luego en entregas." />}
    </div>
  );
}
