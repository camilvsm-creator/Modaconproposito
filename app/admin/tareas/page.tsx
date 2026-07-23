import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { Modal } from "@/components/modal";
import { EmptyState } from "@/components/empty-state";
import { Button, SectionCard, compactInputClassName } from "@/components/ui";
import {
  ASSIGNED_TASK_STATUS_LABELS,
  ASSIGNED_TASK_STATUS_TONES,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_TONES,
  TASK_INCIDENT_STATUS_LABELS,
  TASK_INCIDENT_STATUS_TONES,
  URGENCY_LABELS,
} from "@/lib/constants";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";

import { requireCurrentAlly } from "../ally-scope";
import { createDeliveryAction } from "../entregas/actions";
import {
  getActiveAlliesForSelect,
  getAdminTaskBoard,
  getAllyTaskBoard,
} from "@/lib/production";
import {
  createTaskIncidentAction,
  resolveTaskIncidentAction,
  saveTaskMaterialUsageAction,
  startAssignedTaskAction,
} from "./actions";
import { CreateAssignedTaskModal } from "./components/create-assigned-task-modal";
import { UpdateAssignedTaskForm } from "./components/update-assigned-task-form";

type AdminTask = Awaited<ReturnType<typeof getAdminTaskBoard>>[number];

function getLatestDelivery(task: {
  deliveries?: Array<{ status: string; title: string; delivered_at: string | null }>;
}) {
  return task.deliveries?.[0] ?? null;
}

function canEditUsage(task: {
  status: string;
  deliveries?: Array<{ status: string }>;
}) {
  const locked = task.deliveries?.some((delivery) => ["recibida", "cancelada"].includes(delivery.status)) ?? false;
  if (locked) return false;
  return ["asignada", "en_progreso", "completada"].includes(task.status);
}

function sortIncidents<T extends { created_at: string }>(incidents: T[] | undefined) {
  return [...(incidents ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function getTaskStatusSummary(status: string) {
  if (status === "en_progreso") return "En produccion";
  if (status === "completada" || status === "cerrada") return "Finalizada";
  return "Asignada";
}

function EditTaskModal({ task }: { task: AdminTask }) {
  return (
    <Modal
      triggerLabel="Editar"
      title={task.title}
      description="Actualiza los datos principales y el estado de esta tarea."
      size="lg"
      closeOnSubmit={false}
      triggerClassName="px-3 py-1.5"
    >
      <UpdateAssignedTaskForm
        task={{
          id: task.id,
          title: task.title,
          status: task.status,
          description: task.description ?? null,
          requested_items: task.requested_items ?? null,
          due_date: task.due_date ?? null,
          urgency: task.urgency ?? null,
          admin_notes: task.admin_notes ?? null,
        }}
      />
    </Modal>
  );
}

function TaskIncidentsModal({ task }: { task: AdminTask }) {
  const incidents = sortIncidents(task.incidents);

  return (
    <Modal
      triggerLabel="Incidencias"
      title={`Incidencias: ${task.title}`}
      description="Revisa, resuelve o registra incidencias de esta tarea."
      size="lg"
      triggerClassName="px-3 py-1.5"
    >
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-ink">Incidencias y bloqueos</h3>
        {incidents.length ? (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="rounded-lg border border-stone-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold uppercase tracking-wide", TASK_INCIDENT_STATUS_TONES[incident.status] ?? "bg-stone-100 text-stone-600")}>{TASK_INCIDENT_STATUS_LABELS[incident.status] ?? incident.status}</span>
                  <span className="text-sm text-stone-500">Reportada por {incident.created_by_role} el {formatDate(incident.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-stone-700">{incident.description}</p>
                {incident.resolution_notes ? <p className="mt-2 text-sm text-stone-500">Resolucion: {incident.resolution_notes}</p> : null}
                {incident.status === "open" ? (
                  <form action={resolveTaskIncidentAction} className="mt-3 space-y-3">
                    <input type="hidden" name="incidentId" value={incident.id} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <textarea className={`${compactInputClassName} min-h-[80px]`} name="resolutionNotes" placeholder="Como se resolvio esta incidencia" />
                    <Button type="submit" variant="secondary">Marcar resuelta</Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No hay incidencias registradas en esta tarea.</p>
        )}

        <form action={createTaskIncidentAction} className="space-y-3 rounded-lg border border-stone-200 p-4">
          <input type="hidden" name="taskId" value={task.id} />
          <textarea className={`${compactInputClassName} min-h-[88px]`} name="description" placeholder="Registrar incidencia, bloqueo o riesgo de produccion" />
          <Button type="submit" variant="ghost">Registrar incidencia</Button>
        </form>
      </div>
    </Modal>
  );
}

function CreateTaskDeliveryModal({ task }: { task: AdminTask }) {
  const latestDelivery = getLatestDelivery(task);

  if (task.status !== "completada" || latestDelivery) return null;

  return (
    <Modal
      triggerLabel="Crear entrega"
      title={`Crear entrega: ${task.title}`}
      description="Abre la entrega de esta tarea completada."
      size="lg"
      triggerClassName="px-3 py-1.5"
    >
      <form action={createDeliveryAction} className="rounded-lg border border-stone-200 p-4">
        <input type="hidden" name="taskId" value={task.id} />
        <div className="space-y-3">
          <input className={compactInputClassName} name="title" defaultValue={task.title} placeholder="Titulo de la entrega" />
          <textarea className={`${compactInputClassName} min-h-[80px]`} name="description" defaultValue={task.description ?? ""} placeholder="Descripcion" />
          <input className={compactInputClassName} name="quantity" defaultValue={task.requested_items ?? ""} placeholder="Cantidad o resumen" />
          <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Notas logisticas" />
          <Button type="submit">Crear entrega</Button>
        </div>
      </form>
    </Modal>
  );
}

function TaskSummaryModal({ task }: { task: AdminTask }) {
  const latestDelivery = getLatestDelivery(task);

  return (
    <Modal
      triggerLabel="Ver"
      title={task.title}
      description="Resumen general de la tarea asignada."
      size="lg"
      triggerClassName="px-3 py-1.5"
    >
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
        <p className="font-semibold text-ink">Resumen</p>
        {task.description ? <p className="mt-2">{task.description}</p> : null}
        {task.requested_items ? <p className="mt-2"><span className="font-medium text-stone-700">Resultado esperado:</span> {task.requested_items}</p> : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span>Estado: {getTaskStatusSummary(task.status)}</span>
          <span>Urgencia: {task.urgency ? URGENCY_LABELS[task.urgency as keyof typeof URGENCY_LABELS] ?? task.urgency : "-"}</span>
          <span>Fecha limite: {task.due_date ? formatDate(task.due_date) : "-"}</span>
        </div>
        {latestDelivery ? <p className="mt-2">Entrega activa: {latestDelivery.title}</p> : <p className="mt-2">Sin entrega activa.</p>}
      </div>
    </Modal>
  );
}

export default async function AdminNecesidadesPage() {
  const user = await requireWorkshopUser();

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;

    const tasks = await getAllyTaskBoard(ally.id);

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Tareas"
          description="Consulta tus tareas asignadas y completa la producción."
          navigation={{ baseHref: "/admin/perfil", baseLabel: "Perfil", currentLabel: "Tareas" }}
        />

        {tasks.length ? (
          <div className="space-y-4">
            {tasks.map((task) => {
              const latestDelivery = getLatestDelivery(task);
              const editable = canEditUsage(task);
              const incidents = sortIncidents(task.incidents);

              return (
                <SectionCard key={task.id} className="space-y-5 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">{task.title}</h2>
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-stone-100 text-stone-600")}>{ASSIGNED_TASK_STATUS_LABELS[task.status] ?? task.status}</span>
                      </div>
                      {task.description ? <p className="text-sm text-stone-600">{task.description}</p> : null}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                        <span>Creada: {formatDate(task.created_at)}</span>
                        {task.due_date ? <span>Entrega esperada: {formatDate(task.due_date)}</span> : null}
                        {task.urgency ? <span>Urgencia: {URGENCY_LABELS[task.urgency as keyof typeof URGENCY_LABELS] ?? task.urgency}</span> : null}
                      </div>
                      {task.requested_items ? (
                        <p className="text-sm text-stone-500">
                          <span className="font-medium text-stone-700">Objetivo de producción:</span> {task.requested_items}
                        </p>
                      ) : null}
                    </div>

                    {task.status === "asignada" ? (
                      <form action={startAssignedTaskAction}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <Button type="submit">Iniciar tarea</Button>
                      </form>
                    ) : null}
                  </div>

                  {latestDelivery ? (
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">Entrega:</span>
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", DELIVERY_STATUS_TONES[latestDelivery.status] ?? "bg-stone-100 text-stone-600")}>{DELIVERY_STATUS_LABELS[latestDelivery.status] ?? latestDelivery.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">{latestDelivery.title}</p>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-ink">Incidencias y bloqueos</h3>
                    {incidents.length ? (
                      <div className="space-y-3">
                        {incidents.map((incident) => (
                          <div key={incident.id} className="rounded-lg border border-stone-200 p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold uppercase tracking-wide", TASK_INCIDENT_STATUS_TONES[incident.status] ?? "bg-stone-100 text-stone-600")}>{TASK_INCIDENT_STATUS_LABELS[incident.status] ?? incident.status}</span>
                              <span className="text-sm text-stone-500">Reportada por {incident.created_by_role} el {formatDate(incident.created_at)}</span>
                            </div>
                            <p className="mt-2 text-sm text-stone-700">{incident.description}</p>
                            {incident.resolution_notes ? <p className="mt-2 text-sm text-stone-500">Resolución: {incident.resolution_notes}</p> : null}
                            {incident.status === "open" ? (
                              <form action={resolveTaskIncidentAction} className="mt-3 space-y-3">
                                <input type="hidden" name="incidentId" value={incident.id} />
                                <input type="hidden" name="taskId" value={task.id} />
                                <textarea className={`${compactInputClassName} min-h-[80px]`} name="resolutionNotes" placeholder="Cómo resolviste la incidencia" />
                                <Button type="submit" variant="secondary">Marcar resuelta</Button>
                              </form>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500">No hay incidencias registradas en esta tarea.</p>
                    )}

                    <form action={createTaskIncidentAction} className="rounded-lg border border-stone-200 p-4 space-y-3">
                      <input type="hidden" name="taskId" value={task.id} />
                      <textarea className={`${compactInputClassName} min-h-[88px]`} name="description" placeholder="Describe una incidencia, bloqueo o riesgo de producción" />
                      <Button type="submit" variant="ghost">Reportar incidencia</Button>
                    </form>
                  </div>

                  {/* MVP: gestión de materia prima pausada — secciones "Materia prima asignada" y "Reporte de consumo" ocultas temporalmente */}
                  {editable ? (
                    <form action={saveTaskMaterialUsageAction} className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
                      <input type="hidden" name="taskId" value={task.id} />

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-stone-800">Notas del taller</span>
                        <textarea className={`${compactInputClassName} min-h-[96px]`} name="allyNotes" defaultValue={task.ally_notes ?? ""} placeholder="Avances, incidencias o aclaratorias de producción" />
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <Button type="submit" name="intent" value="save" variant="secondary">Guardar notas</Button>
                        {task.status !== "completada" ? <Button type="submit" name="intent" value="complete">Completar tarea</Button> : null}
                      </div>
                    </form>
                  ) : null}
                </SectionCard>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin tareas asignadas" description="Cuando Promoda te asigne producción aparecerá aquí." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const [tasks, allies] = await Promise.all([
    getAdminTaskBoard(),
    getActiveAlliesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Tareas"
        description="Crea tareas para los aliados y gestiona su producción."
        meta={`${tasks.length} tareas`}
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Tareas" }}
      />

      <div className="flex justify-end">
        <CreateAssignedTaskModal allies={allies} />
      </div>

      {tasks.length ? (
        <div className="space-y-4">
          <SectionCard className="overflow-hidden">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                  <tr>
                    <th className="px-4 py-2.5">Tarea asignada</th>
                    <th className="px-4 py-2.5">Aliado asignado</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-2.5 align-top leading-tight">
                        <p className="font-semibold text-ink">{task.title}</p>
                      </td>
                      <td className="px-4 py-2.5 align-top leading-tight">
                        {task.ally ? (
                          <Link href={`/admin/aliados/${task.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{task.ally.name}</Link>
                        ) : (
                          <span className="text-stone-400">Sin aliado</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 align-top leading-tight">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-stone-100 text-stone-600")}>{getTaskStatusSummary(task.status)}</span>
                      </td>
                      <td className="px-4 py-2.5 align-top leading-tight">
                        <div className="flex flex-wrap gap-2">
                          <TaskSummaryModal task={task} />
                          <EditTaskModal task={task} />
                          <TaskIncidentsModal task={task} />
                          <CreateTaskDeliveryModal task={task} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {tasks.map((task) => {
                return (
                  <div key={task.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{task.title}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-stone-100 text-stone-600")}>{getTaskStatusSummary(task.status)}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-stone-600">
                        <p>
                          Aliado asignado:{" "}
                          {task.ally ? (
                            <Link href={`/admin/aliados/${task.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{task.ally.name}</Link>
                          ) : (
                            <span className="text-stone-400">Sin aliado</span>
                          )}
                        </p>
                        <p>Estado: {getTaskStatusSummary(task.status)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <TaskSummaryModal task={task} />
                        <EditTaskModal task={task} />
                        <TaskIncidentsModal task={task} />
                        <CreateTaskDeliveryModal task={task} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      ) : (
        <EmptyState title="No hay tareas registradas." description="Crea una tarea para comenzar el flujo." />
      )}
    </div>
  );
}
