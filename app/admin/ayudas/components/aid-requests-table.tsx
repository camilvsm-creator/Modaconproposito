import Link from "next/link";

import { AdminActionItem, AdminRowActions, AdminTableFrame } from "@/components/admin-data-ui";
import { LazyAllySelect } from "@/components/lazy-ally-select";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import { AID_REQUEST_STATUS_LABELS, AID_REQUEST_STATUS_TONES, AID_REQUEST_STATUSES, URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";
import type { AidRequestWithRelations } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

import { createTaskFromAidRequestAction, updateAidRequestAction } from "../../solicitudes/actions";

export function AidRequestsTable({ requests }: { requests: AidRequestWithRelations[] }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Solicitud</th><th className="px-4 py-3">Solicitante</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Registro</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
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
