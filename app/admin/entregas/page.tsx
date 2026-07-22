import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { Button, SectionCard, inputClassName } from "@/components/ui";
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_TONES,
} from "@/lib/constants";
import { requireOperationsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { getRequesterAidRequests } from "@/lib/requesters";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

import { requireCurrentAlly } from "../ally-scope";
import { requireCurrentRequester } from "../requester-scope";
import { createDeliveryAction, updateDeliveryLogisticsAction, updateDeliveryStatusAction } from "./actions";
import { saveTaskMaterialUsageAction } from "../tareas/actions";
import {
  getAdminDeliveries,
  getAllyDeliveries,
  getAllyTaskBoard,
  getTaskOptionsForDelivery,
} from "@/lib/production";

function isUsageEditable(deliveryStatus: string) {
  return !["recibida", "cancelada"].includes(deliveryStatus);
}

export default async function AdminEntregasPage() {
  const user = await requireOperationsUser();

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;

    const [deliveries, tasks] = await Promise.all([
      getAllyDeliveries(ally.id),
      getAllyTaskBoard(ally.id),
    ]);
    const tasksById = new Map(tasks.map((task) => [task.id, task]));

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Entregas"
          description="Marca tus entregas como enviadas y, si hace falta, corrige el consumo reportado antes del cierre final."
          navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Entregas" }}
        />

        {deliveries.length ? (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const task = delivery.task_id ? tasksById.get(delivery.task_id) : null;

              return (
                <SectionCard key={delivery.id} className="space-y-4 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">{delivery.title}</h2>
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", DELIVERY_STATUS_TONES[delivery.status] ?? "bg-stone-100 text-stone-600")}>{DELIVERY_STATUS_LABELS[delivery.status] ?? delivery.status}</span>
                      </div>
                      {delivery.description ? <p className="text-sm text-stone-600">{delivery.description}</p> : null}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                        {delivery.quantity ? <span>Cantidad: {delivery.quantity}</span> : null}
                        <span>Registrada: {formatDate(delivery.created_at)}</span>
                        {delivery.scheduled_for ? <span>Programada: {formatDateTime(delivery.scheduled_for)}</span> : null}
                        {delivery.delivered_at ? <span>Entregada: {formatDate(delivery.delivered_at)}</span> : null}
                        {delivery.received_at ? <span>Recibida: {formatDate(delivery.received_at)}</span> : null}
                      </div>
                    </div>

                    {delivery.status === "pendiente" ? (
                      <form action={updateDeliveryStatusAction}>
                        <input type="hidden" name="deliveryId" value={delivery.id} />
                        <input type="hidden" name="status" value="entregada" />
                        <Button type="submit">Marcar entregada</Button>
                      </form>
                    ) : null}
                  </div>

                  {task && isUsageEditable(delivery.status) && task.material_assignments?.length ? (
                    <form action={saveTaskMaterialUsageAction} className="space-y-4 rounded-lg border border-stone-200 p-5">
                      <input type="hidden" name="taskId" value={task.id} />
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold text-ink">Ajustar consumo de materia prima</h3>
                        {task.material_assignments.map((assignment) => (
                          <label key={assignment.id} className="block space-y-2">
                            <span className="text-sm font-medium text-stone-800">{assignment.name_snapshot}</span>
                            <input
                              className={inputClassName}
                              name={`usedQuantity:${assignment.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={assignment.used_quantity ?? ""}
                            />
                          </label>
                        ))}
                      </div>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-stone-800">Notas del taller</span>
                        <textarea className={`${inputClassName} min-h-[100px]`} name="allyNotes" defaultValue={task.ally_notes ?? ""} />
                      </label>
                      <Button type="submit" name="intent" value="save" variant="secondary">Guardar ajuste</Button>
                    </form>
                  ) : null}
                </SectionCard>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin entregas registradas" description="Las entregas de tus tareas completadas aparecerán aquí." />
        )}
      </div>
    );
  }

  if (user.app_metadata?.role === "solicitante") {
    const requester = await requireCurrentRequester();
    const requests = await getRequesterAidRequests(requester.id);
    const deliveries = requests.flatMap((request) =>
      (request.tasks ?? []).flatMap((task) =>
        (task.deliveries ?? []).map((delivery) => ({
          ...delivery,
          task,
          request,
        })),
      ),
    );

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Entregas"
          description="Confirma la recepción final de las entregas asociadas a tus solicitudes."
          navigation={{ baseHref: "/admin/solicitudes", baseLabel: "Solicitudes", currentLabel: "Entregas" }}
        />

        {deliveries.length ? (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <SectionCard key={delivery.id} className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{delivery.title}</h2>
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", DELIVERY_STATUS_TONES[delivery.status] ?? "bg-stone-100 text-stone-600")}>{DELIVERY_STATUS_LABELS[delivery.status] ?? delivery.status}</span>
                  </div>
                  <p className="text-sm text-stone-600">Solicitud: {delivery.request.title}</p>
                  <p className="text-sm text-stone-600">Tarea: {delivery.task.title}</p>
                  {delivery.quantity ? <p className="text-sm text-stone-500">Cantidad: {delivery.quantity}</p> : null}
                  {delivery.description ? <p className="text-sm text-stone-500">{delivery.description}</p> : null}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                    <span>Registrada: {formatDate(delivery.created_at)}</span>
                    {delivery.scheduled_for ? <span>Programada: {formatDateTime(delivery.scheduled_for)}</span> : null}
                    {delivery.delivered_at ? <span>Entregada: {formatDate(delivery.delivered_at)}</span> : null}
                    {delivery.received_at ? <span>Recibida: {formatDate(delivery.received_at)}</span> : null}
                  </div>
                </div>

                {delivery.status === "entregada" ? (
                  <form action={updateDeliveryStatusAction} className="space-y-3 rounded-lg border border-stone-200 p-4">
                    <input type="hidden" name="deliveryId" value={delivery.id} />
                    <input type="hidden" name="status" value="recibida" />
                    <input className={inputClassName} name="receivedBy" placeholder="Recibido por" defaultValue={requester.contact_name ?? requester.name} />
                    <textarea className={`${inputClassName} min-h-[80px]`} name="notes" defaultValue={delivery.notes ?? ""} placeholder="Notas de recepción" />
                    <Button type="submit">Confirmar recepción</Button>
                  </form>
                ) : null}
              </SectionCard>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin entregas registradas" description="Las entregas asociadas a tus solicitudes aparecerán aquí para confirmar su recepción." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const [deliveries, taskOptions] = await Promise.all([
    getAdminDeliveries(),
    getTaskOptionsForDelivery(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Entregas"
        description="Abre entregas desde tareas completadas y marca su recepción final para cerrar el flujo."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Entregas" }}
      />

      <SectionCard className="p-6">
        <h2 className="text-lg font-semibold text-ink">Crear entrega</h2>
        <form action={createDeliveryAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <select className={inputClassName} name="taskId" required defaultValue="">
            <option value="" disabled>Selecciona una tarea completada</option>
            {taskOptions.map((task) => (
              <option key={task.id} value={task.id}>{task.title} {task.ally?.name ? `- ${task.ally.name}` : ""}</option>
            ))}
          </select>
          <input className={inputClassName} name="title" placeholder="Título de la entrega" />
          <input className={inputClassName} name="scheduledFor" type="datetime-local" />
          <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="description" placeholder="Descripción" />
          <input className={inputClassName} name="quantity" placeholder="Cantidad o resumen" />
          <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="notes" placeholder="Notas" />
          <div className="md:col-span-2">
            <Button type="submit">Crear entrega o parcial</Button>
          </div>
        </form>
      </SectionCard>

      {deliveries.length ? (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <SectionCard key={delivery.id} className="space-y-4 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-ink">{delivery.title}</h2>
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", DELIVERY_STATUS_TONES[delivery.status] ?? "bg-stone-100 text-stone-600")}>{DELIVERY_STATUS_LABELS[delivery.status] ?? delivery.status}</span>
                  </div>
                  {delivery.description ? <p className="text-sm text-stone-600">{delivery.description}</p> : null}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                    {delivery.ally?.name ? <span>Aliado: {delivery.ally.name}</span> : null}
                    {delivery.task?.title ? <span>Tarea: {delivery.task.title}</span> : null}
                    {delivery.quantity ? <span>Cantidad: {delivery.quantity}</span> : null}
                    <span>Registrada: {formatDate(delivery.created_at)}</span>
                    {delivery.scheduled_for ? <span>Programada: {formatDateTime(delivery.scheduled_for)}</span> : null}
                    {delivery.delivered_at ? <span>Entregada: {formatDate(delivery.delivered_at)}</span> : null}
                    {delivery.received_at ? <span>Recibida: {formatDate(delivery.received_at)}</span> : null}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {!["recibida", "cancelada"].includes(delivery.status) ? (
                    <form action={updateDeliveryLogisticsAction} className="space-y-3 rounded-lg border border-stone-200 p-4">
                      <input type="hidden" name="deliveryId" value={delivery.id} />
                      <h3 className="text-base font-semibold text-ink">Logística</h3>
                      <input className={inputClassName} name="title" defaultValue={delivery.title} />
                      <input className={inputClassName} name="scheduledFor" type="datetime-local" defaultValue={delivery.scheduled_for ? new Date(delivery.scheduled_for).toISOString().slice(0, 16) : ""} />
                      <input className={inputClassName} name="quantity" defaultValue={delivery.quantity ?? ""} placeholder="Cantidad o resumen" />
                      <textarea className={`${inputClassName} min-h-[80px]`} name="description" defaultValue={delivery.description ?? ""} placeholder="Descripción" />
                      <textarea className={`${inputClassName} min-h-[80px]`} name="notes" defaultValue={delivery.notes ?? ""} placeholder="Notas logísticas" />
                      <Button type="submit" variant="secondary">Guardar logística</Button>
                    </form>
                  ) : null}

                  <div className="space-y-3 rounded-lg border border-stone-200 p-4">
                    <h3 className="text-base font-semibold text-ink">Estado</h3>
                    {delivery.status === "pendiente" || delivery.status === "entregada" ? (
                      <form action={updateDeliveryStatusAction} className="space-y-3">
                        <input type="hidden" name="deliveryId" value={delivery.id} />
                        <input type="hidden" name="status" value="recibida" />
                        <input className={inputClassName} name="receivedBy" placeholder="Recibido por" defaultValue={delivery.received_by ?? "Promoda"} />
                        <textarea className={`${inputClassName} min-h-[80px]`} name="notes" defaultValue={delivery.notes ?? ""} placeholder="Notas de recepción" />
                        <Button type="submit">Marcar recibida</Button>
                      </form>
                    ) : null}

                    {delivery.status === "entregada" ? (
                      <form action={updateDeliveryStatusAction}>
                        <input type="hidden" name="deliveryId" value={delivery.id} />
                        <input type="hidden" name="status" value="pendiente" />
                        <Button type="submit" variant="ghost">Reprogramar a pendiente</Button>
                      </form>
                    ) : null}

                    {delivery.status !== "cancelada" && delivery.status !== "recibida" ? (
                      <form action={updateDeliveryStatusAction}>
                        <input type="hidden" name="deliveryId" value={delivery.id} />
                        <input type="hidden" name="status" value="cancelada" />
                        <input type="hidden" name="notes" value={delivery.notes ?? ""} />
                        <Button type="submit" variant="ghost">Cancelar entrega</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Sin entregas registradas" description="Crea una entrega desde una tarea completada para cerrar el flujo." />
      )}
    </div>
  );
}
