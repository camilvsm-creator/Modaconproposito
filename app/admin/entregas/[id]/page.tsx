import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdminDetailPanel } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_TONES } from "@/lib/constants";
import { requireOperationsUser } from "@/lib/auth";
import { getDeliveryById } from "@/lib/production";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

import { requireCurrentAlly } from "../../ally-scope";
import { requireCurrentRequester } from "../../requester-scope";
import { updateDeliveryLogisticsAction, updateDeliveryStatusAction } from "../actions";

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", DELIVERY_STATUS_TONES[status] ?? "bg-gray-100 text-gray-600")}>
      {DELIVERY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default async function AdminEntregaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireOperationsUser();
  const { id } = await params;
  const query = await searchParams;
  const created = query.created === "1";
  const delivery = await getDeliveryById(id);
  if (!delivery) notFound();

  const role = user.app_metadata?.role as string | undefined;
  if (role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally || delivery.ally_id !== ally.id) notFound();
  }

  if (role === "solicitante") {
    const requester = await requireCurrentRequester();
    if (delivery.task?.request?.requester_id !== requester.id) notFound();
  }

  const isAdmin = role === "admin";
  const isAlly = role === "aliado";
  const isRequester = role === "solicitante";
  const isClosed = ["recibida", "cancelada"].includes(delivery.status);
  const canEditLogistics = (isAdmin || isAlly) && !isClosed;
  const task = delivery.task;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Detalle"
        title={delivery.title}
        description="Consulta la información completa y gestiona el estado de esta entrega."
        navigation={{ baseHref: "/admin/entregas", baseLabel: "Entregas", currentLabel: "Detalle" }}
      />

      {created ? <div className="rounded-md bg-success-soft px-4 py-3 text-sm font-semibold text-success">Entrega creada correctamente.</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/entregas" className="text-sm font-semibold text-primary hover:underline">Volver a entregas</Link>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Información de la entrega</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <DetailField label="Aliado">{delivery.ally?.name ?? "Sin aliado"}</DetailField>
            <DetailField label="Tarea">{task?.title ?? "Sin tarea"}</DetailField>
            {task?.request ? <DetailField label="Solicitud">{task.request.title}</DetailField> : null}
            <DetailField label="Cantidad">{delivery.quantity ?? "Sin especificar"}</DetailField>
            <DetailField label="Programada">{delivery.scheduled_for ? formatDateTime(delivery.scheduled_for) : "Sin programación"}</DetailField>
            <DetailField label="Registrada">{formatDateTime(delivery.created_at)}</DetailField>
          </dl>
        </AdminDetailPanel>

        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Seguimiento</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <DetailField label="Estado"><StatusBadge status={delivery.status} /></DetailField>
            <DetailField label="Tarea relacionada">{task?.status ? task.status : "Sin tarea"}</DetailField>
            <DetailField label="Entregada">{delivery.delivered_at ? formatDateTime(delivery.delivered_at) : "Pendiente"}</DetailField>
            <DetailField label="Recibida">{delivery.received_at ? formatDateTime(delivery.received_at) : "Pendiente"}</DetailField>
            <DetailField label="Recibida por">{delivery.received_by ?? "Pendiente"}</DetailField>
          </dl>
        </AdminDetailPanel>
      </div>

      {(delivery.description || delivery.notes) ? (
        <section className="grid gap-5 border-y border-gray-200 py-5 md:grid-cols-2">
          {delivery.description ? <div><h2 className="text-lg font-semibold text-ink">Descripción</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{delivery.description}</p></div> : null}
          {delivery.notes ? <div><h2 className="text-lg font-semibold text-ink">Notas</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{delivery.notes}</p></div> : null}
        </section>
      ) : null}

      {canEditLogistics ? (
        <section className="border-y border-gray-200 py-5">
          <h2 className="text-lg font-semibold text-ink">Editar logística</h2>
          <form action={updateDeliveryLogisticsAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="deliveryId" value={delivery.id} />
            <label className="grid gap-2"><span className="text-sm font-medium text-gray-800">Título</span><input className={compactInputClassName} name="title" defaultValue={delivery.title} required /></label>
            <label className="grid gap-2"><span className="text-sm font-medium text-gray-800">Programada para</span><input className={compactInputClassName} name="scheduledFor" type="datetime-local" defaultValue={delivery.scheduled_for ? new Date(delivery.scheduled_for).toISOString().slice(0, 16) : ""} /></label>
            <label className="grid gap-2"><span className="text-sm font-medium text-gray-800">Cantidad</span><input className={compactInputClassName} name="quantity" defaultValue={delivery.quantity ?? ""} /></label>
            <div />
            <label className="grid gap-2 md:col-span-2"><span className="text-sm font-medium text-gray-800">Descripción</span><textarea className={`${compactInputClassName} min-h-[88px]`} name="description" defaultValue={delivery.description ?? ""} /></label>
            <label className="grid gap-2 md:col-span-2"><span className="text-sm font-medium text-gray-800">Notas</span><textarea className={`${compactInputClassName} min-h-[88px]`} name="notes" defaultValue={delivery.notes ?? ""} /></label>
            <div className="md:col-span-2"><Button type="submit" variant="secondary">Guardar cambios</Button></div>
          </form>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-2 border-t border-gray-200 pt-5">
        {isAlly && delivery.status === "pendiente" ? (
          <form action={updateDeliveryStatusAction}><input type="hidden" name="deliveryId" value={delivery.id} /><input type="hidden" name="status" value="entregada" /><Button type="submit">Marcar entregada</Button></form>
        ) : null}

        {isAdmin && (delivery.status === "pendiente" || delivery.status === "entregada") ? (
          <Modal triggerLabel="Marcar recibida" title="Marcar entrega recibida" description="Confirma la recepción interna de esta entrega.">
            <form action={updateDeliveryStatusAction} className="grid gap-4">
              <input type="hidden" name="deliveryId" value={delivery.id} /><input type="hidden" name="status" value="recibida" />
              <input className={compactInputClassName} name="receivedBy" placeholder="Recibido por" defaultValue="Promoda" />
              <textarea className={`${compactInputClassName} min-h-[88px]`} name="notes" defaultValue={delivery.notes ?? ""} placeholder="Notas de recepción" />
              <Button type="submit">Confirmar recepción</Button>
            </form>
          </Modal>
        ) : null}

        {isRequester && delivery.status === "entregada" ? (
          <Modal triggerLabel="Confirmar recepción" title="Confirmar recepción" description="Registra la recepción final de esta entrega.">
            <form action={updateDeliveryStatusAction} className="grid gap-4">
              <input type="hidden" name="deliveryId" value={delivery.id} /><input type="hidden" name="status" value="recibida" />
              <textarea className={`${compactInputClassName} min-h-[88px]`} name="notes" placeholder="Notas de recepción" />
              <Button type="submit">Confirmar recepción</Button>
            </form>
          </Modal>
        ) : null}

        {isAdmin && delivery.status === "entregada" ? (
          <Modal triggerLabel="Reprogramar" title="Reprogramar entrega" description="Devuelve la entrega al estado pendiente.">
            <form action={updateDeliveryStatusAction}><input type="hidden" name="deliveryId" value={delivery.id} /><input type="hidden" name="status" value="pendiente" /><Button type="submit" variant="secondary">Confirmar reprogramación</Button></form>
          </Modal>
        ) : null}

        {(isAdmin || isAlly) && !isClosed ? (
          <Modal triggerLabel="Cancelar entrega" title="Cancelar entrega" description="La entrega quedará cancelada y no podrá editarse desde el flujo principal.">
            <form action={updateDeliveryStatusAction} className="grid gap-4"><input type="hidden" name="deliveryId" value={delivery.id} /><input type="hidden" name="status" value="cancelada" /><textarea className={`${compactInputClassName} min-h-[88px]`} name="notes" defaultValue={delivery.notes ?? ""} placeholder="Motivo de cancelación" /><Button type="submit" variant="secondary">Confirmar cancelación</Button></form>
          </Modal>
        ) : null}
      </section>
    </div>
  );
}
