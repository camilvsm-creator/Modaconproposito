import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminDetailPanel, AdminStatusBadge } from "@/components/admin-data-ui";
import { EmptyState } from "@/components/empty-state";
import { requireRequestsUser } from "@/lib/auth";
import { getAidRequestById } from "@/lib/requesters";
import { AID_REQUEST_STATUS_LABELS, AID_REQUEST_STATUS_TONES } from "@/lib/constants";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export default async function AdminAidRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRequestsUser();
  const { id } = await params;
  const request = await getAidRequestById(id);

  if (!request || (user.app_metadata?.role === "solicitante" && request.requester?.user_id !== user.id)) {
    return <EmptyState title="Solicitud no encontrada" description="La solicitud no existe o no tienes acceso a ella." action={<Link href="/admin/solicitudes" className="font-semibold text-primary hover:underline">Volver a solicitudes</Link>} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Solicitudes"
        title={request.title}
        description={request.description ?? "Detalle de la solicitud de ayuda."}
        navigation={{ baseHref: "/admin/solicitudes", baseLabel: "Solicitudes", currentLabel: request.title }}
        actions={<Link href="/admin/solicitudes" className="rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Volver al listado</Link>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <AdminStatusBadge className={cn(AID_REQUEST_STATUS_TONES[request.status] ?? "bg-gray-100 text-gray-700")}>{AID_REQUEST_STATUS_LABELS[request.status] ?? request.status}</AdminStatusBadge>
        <span className="text-sm text-gray-500">Registrada: {formatDateTime(request.created_at)}</span>
        {request.requester?.name ? <span className="text-sm text-gray-500">Solicitante: {request.requester.name}</span> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Necesidad</h2>
          <dl className="mt-4 space-y-4 text-sm"><div><dt className="text-gray-500">Resultado solicitado</dt><dd className="mt-1 text-gray-700">{request.requested_items ?? "Sin especificar."}</dd></div><div><dt className="text-gray-500">Urgencia</dt><dd className="mt-1 text-gray-700">{request.urgency ?? "Sin especificar."}</dd></div><div><dt className="text-gray-500">Notas administrativas</dt><dd className="mt-1 whitespace-pre-wrap text-gray-700">{request.admin_notes ?? "Sin notas."}</dd></div></dl>
        </AdminDetailPanel>
        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Producción asociada</h2>
          {request.tasks?.length ? <div className="mt-4 space-y-3">{request.tasks.map((task) => <div key={task.id} className="border-b border-gray-200 pb-3 last:border-0"><Link href={`/admin/tareas/${task.id}`} className="font-semibold text-primary hover:underline">{task.title}</Link><p className="mt-1 text-sm text-gray-500">{task.ally?.name ?? "Sin aliado"} · {task.status}</p>{task.deliveries?.length ? <p className="mt-1 text-sm text-gray-500">{task.deliveries.length} entrega(s) asociada(s)</p> : null}</div>)}</div> : <p className="mt-4 text-sm text-gray-500">Todavía no hay tareas asociadas.</p>}
        </AdminDetailPanel>
      </div>
    </div>
  );
}
