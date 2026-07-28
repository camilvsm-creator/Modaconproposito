import { AdminActionItem, AdminRowActions, AdminTableFrame } from "@/components/admin-data-ui";
import { GenerateRequesterAccessButton } from "@/components/generate-requester-access-button";
import { Modal } from "@/components/modal";
import {
  AID_REQUESTER_STATUS_LABELS,
  AID_REQUESTER_STATUS_TONES,
  AID_REQUESTER_TYPE_LABELS,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

import { updateAidRequesterStatusAction } from "../../solicitantes/actions";
import { RequesterForm } from "./requester-form";

export function RequestersTable({ requesters }: { requesters: Array<{
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
              <td data-mobile="primary" data-mobile-label="Solicitante" className="px-4 py-4"><p className="font-semibold text-ink">{requester.name}</p><p className="mt-1 text-sm text-gray-500">{requester.location ?? "Sin ubicación"}</p></td>
              <td data-mobile-label="Tipo" className="px-4 py-4 text-gray-600">{AID_REQUESTER_TYPE_LABELS[requester.type] ?? requester.type}</td>
              <td data-mobile-label="Contacto" className="px-4 py-4 text-gray-600"><p>{requester.contact_name ?? "-"}</p><p>{requester.email ?? "-"}</p><p>{requester.phone ?? "-"}</p></td>
              <td data-mobile-label="Estado" className="px-4 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", AID_REQUESTER_STATUS_TONES[requester.status] ?? "bg-gray-100 text-gray-700")}>{AID_REQUESTER_STATUS_LABELS[requester.status] ?? requester.status}</span></td>
              <td data-mobile-label="Acceso" className="px-4 py-4 text-gray-600">{requester.user_id ? "Cuenta vinculada" : "Sin cuenta"}</td>
              <td data-mobile-label="Registro" className="px-4 py-4 text-gray-500">{formatDate(requester.created_at)}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right">
                <AdminRowActions>
                  <AdminActionItem><Modal triggerLabel="Editar" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title={requester.name} description="Actualiza los datos del solicitante."><RequesterForm requesterId={requester.id} defaults={{ name: requester.name, type: requester.type, contactName: requester.contact_name ?? "", email: requester.email ?? "", phone: requester.phone ?? "", location: requester.location ?? "", notes: requester.notes ?? "" }} /></Modal></AdminActionItem>
                  {!requester.user_id ? <AdminActionItem><GenerateRequesterAccessButton requesterId={requester.id} requesterName={requester.name} /></AdminActionItem> : null}
                  {(["activo", "pausado", "inactivo"] as const).map((nextStatus) => <AdminActionItem key={nextStatus}><form action={updateAidRequesterStatusAction}><input type="hidden" name="requesterId" value={requester.id} /><input type="hidden" name="status" value={nextStatus} /><button className={cn(requester.status === nextStatus ? "text-primary" : "text-gray-700")} type="submit">{AID_REQUESTER_STATUS_LABELS[nextStatus]}</button></form></AdminActionItem>)}
                </AdminRowActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}
