import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { Button, SectionCard, inputClassName } from "@/components/ui";
import {
  ASSIGNED_TASK_STATUS_LABELS,
  ASSIGNED_TASK_STATUS_TONES,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_TONES,
  TASK_INCIDENT_STATUS_LABELS,
  TASK_INCIDENT_STATUS_TONES,
  URGENCY_LABELS,
  URGENCY_LEVELS,
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
  createAssignedTaskAction,
  resolveTaskIncidentAction,
  saveTaskMaterialUsageAction,
  startAssignedTaskAction,
  updateAssignedTaskAdminAction,
} from "./actions";

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
                                <textarea className={`${inputClassName} min-h-[80px]`} name="resolutionNotes" placeholder="Cómo resolviste la incidencia" />
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
                      <textarea className={`${inputClassName} min-h-[90px]`} name="description" placeholder="Describe una incidencia, bloqueo o riesgo de producción" />
                      <Button type="submit" variant="ghost">Reportar incidencia</Button>
                    </form>
                  </div>

                  {/* MVP: gestión de materia prima pausada — secciones "Materia prima asignada" y "Reporte de consumo" ocultas temporalmente */}
                  {editable ? (
                    <form action={saveTaskMaterialUsageAction} className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
                      <input type="hidden" name="taskId" value={task.id} />

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-stone-800">Notas del taller</span>
                        <textarea className={`${inputClassName} min-h-[100px]`} name="allyNotes" defaultValue={task.ally_notes ?? ""} placeholder="Avances, incidencias o aclaratorias de producción" />
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

      <SectionCard className="p-6">
        <h2 className="text-lg font-semibold text-ink">Crear tarea</h2>
        <form action={createAssignedTaskAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Aliado</span>
            <select className={inputClassName} name="allyId" required defaultValue="">
              <option value="" disabled>Selecciona un aliado</option>
              {allies.map((ally) => (
                <option key={ally.id} value={ally.id}>{ally.name}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Título</span>
            <input className={inputClassName} name="title" required />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-800">Descripción</span>
            <textarea className={`${inputClassName} min-h-[100px]`} name="description" placeholder="Describe el trabajo a realizar, especificaciones o instrucciones para el aliado." />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Objetivo de producción</span>
            <input className={inputClassName} name="expectedOutput" placeholder="Ej. 100 cartucheras escolares." />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Fecha límite</span>
            <input className={inputClassName} name="dueDate" type="date" />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-stone-800">Urgencia</span>
            <select className={inputClassName} name="urgency" defaultValue="">
              <option value="">Sin especificar</option>
              {URGENCY_LEVELS.map((level) => (
                <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Crear tarea</Button>
          </div>
        </form>
      </SectionCard>

      {tasks.length ? (
        <div className="space-y-4">
          {tasks.map((task) => {
            const latestDelivery = getLatestDelivery(task);
            const incidents = sortIncidents(task.incidents);

            return (
              <SectionCard key={task.id} className="space-y-5 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{task.title}</h2>
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-stone-100 text-stone-600")}>{ASSIGNED_TASK_STATUS_LABELS[task.status] ?? task.status}</span>
                    </div>
                    <p className="text-sm text-stone-600">
                      Aliado:{" "}
                      {task.ally ? (
                        <Link href={`/admin/aliados/${task.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{task.ally.name}</Link>
                      ) : (
                        <span>Sin aliado</span>
                      )}
                    </p>
                    {task.description ? <p className="text-sm text-stone-600">{task.description}</p> : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                      <span>Creada: {formatDate(task.created_at)}</span>
                      {task.due_date ? <span>Entrega esperada: {formatDate(task.due_date)}</span> : null}
                      {task.urgency ? <span>Urgencia: {URGENCY_LABELS[task.urgency as keyof typeof URGENCY_LABELS] ?? task.urgency}</span> : null}
                    </div>
                    {task.requested_items ? <p className="text-sm text-stone-500"><span className="font-medium text-stone-700">Objetivo de producción:</span> {task.requested_items}</p> : null}
                  </div>

                  {latestDelivery ? (
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
                      <p className="font-medium text-stone-700">Entrega activa</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", DELIVERY_STATUS_TONES[latestDelivery.status] ?? "bg-stone-100 text-stone-600")}>{DELIVERY_STATUS_LABELS[latestDelivery.status] ?? latestDelivery.status}</span>
                        <span className="text-stone-600">{latestDelivery.title}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <form action={updateAssignedTaskAdminAction} className="grid gap-3 rounded-lg border border-stone-200 p-4 md:grid-cols-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input className={inputClassName} name="title" defaultValue={task.title} required />
                  <select className={inputClassName} name="status" defaultValue={task.status}>
                    {Object.entries(ASSIGNED_TASK_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="description" defaultValue={task.description ?? ""} placeholder="Descripción de la tarea" />
                  <input className={inputClassName} name="expectedOutput" defaultValue={task.requested_items ?? ""} placeholder="Objetivo de producción" />
                  <input className={inputClassName} name="dueDate" type="date" defaultValue={task.due_date ?? ""} />
                  <select className={inputClassName} name="urgency" defaultValue={task.urgency ?? ""}>
                    <option value="">Urgencia</option>
                    {URGENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
                    ))}
                  </select>
                  <div className="hidden md:block" />
                  <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="adminNotes" defaultValue={task.admin_notes ?? ""} placeholder="Notas internas de la tarea" />
                  <div className="md:col-span-2">
                    <Button type="submit" variant="secondary">Actualizar tarea</Button>
                  </div>
                </form>

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
                              <textarea className={`${inputClassName} min-h-[80px]`} name="resolutionNotes" placeholder="Cómo se resolvió esta incidencia" />
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
                    <textarea className={`${inputClassName} min-h-[90px]`} name="description" placeholder="Describe una incidencia, bloqueo o riesgo de producción" />
                    <Button type="submit" variant="ghost">Registrar incidencia</Button>
                  </form>
                </div>

                {/* MVP: gestión de materia prima pausada — secciones "Materia prima asignada" y "Asignar materia prima" ocultas temporalmente */}
                <div className="space-y-4">
                  {task.status === "completada" && !latestDelivery ? (
                    <form action={createDeliveryAction} className="rounded-lg border border-stone-200 p-4">
                      <input type="hidden" name="taskId" value={task.id} />
                      <h3 className="text-base font-semibold text-ink">Crear entrega</h3>
                      <div className="mt-3 space-y-3">
                        <input className={inputClassName} name="title" defaultValue={task.title} placeholder="Título de la entrega" />
                        <textarea className={`${inputClassName} min-h-[80px]`} name="description" defaultValue={task.description ?? ""} placeholder="Descripción" />
                        <input className={inputClassName} name="quantity" defaultValue={task.requested_items ?? ""} placeholder="Cantidad o resumen" />
                        <textarea className={`${inputClassName} min-h-[80px]`} name="notes" placeholder="Notas logísticas" />
                        <Button type="submit">Crear entrega</Button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </SectionCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No hay tareas registradas." description="Crea una tarea para comenzar el flujo." />
      )}
    </div>
  );
}
