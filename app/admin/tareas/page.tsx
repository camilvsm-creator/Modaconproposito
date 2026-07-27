import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
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
  getAdminTaskBoardPage,
  getAllyTaskBoardPage,
} from "@/lib/production";
import {
  createTaskIncidentAction,
  closeOwnTaskAction,
  resolveTaskIncidentAction,
  saveTaskMaterialUsageAction,
  startAssignedTaskAction,
} from "./actions";
import { CreateAssignedTaskModal } from "./components/create-assigned-task-modal";
import { CreateNeedForm } from "./components/create-task-form";

type AdminTask = Awaited<ReturnType<typeof getAdminTaskBoardPage>>["items"][number];
type AllyTask = Awaited<ReturnType<typeof getAllyTaskBoardPage>>["items"][number];

function getLatestDelivery(task: {
  deliveries?: Array<{ status: string; title: string; delivered_at: string | null }>;
}) {
  return task.deliveries?.[0] ?? null;
}

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
  return query ? `/admin/tareas?${query}` : "/admin/tareas";
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

function AllyTaskTable({ tasks, workshopId }: { tasks: AllyTask[]; workshopId: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-mobile-cards min-w-[980px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fechas</th>
            <th className="px-4 py-3">Entrega</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const latestDelivery = getLatestDelivery(task);

            return (
              <tr key={task.id} className="align-top hover:bg-gray-50">
                <td data-mobile="primary" data-mobile-label="Tarea" className="px-4 py-3">
                  <Link href={`/admin/tareas/${task.id}`} className="font-semibold text-ink hover:text-primary">{task.title}</Link>
                  {task.description ? <p className="mt-1 max-w-md text-sm text-gray-500">{task.description}</p> : null}
                  {task.requested_items ? <p className="mt-1 max-w-md text-sm text-gray-500"><span className="font-medium text-gray-700">Objetivo:</span> {task.requested_items}</p> : null}
                </td>
                <td data-mobile-label="Estado" className="px-4 py-3"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-gray-100 text-gray-600")}>{ASSIGNED_TASK_STATUS_LABELS[task.status] ?? task.status}</span></td>
                <td data-mobile-label="Fechas" className="px-4 py-3 text-gray-500"><p>Creada: {formatDate(task.created_at)}</p>{task.due_date ? <p>Entrega: {formatDate(task.due_date)}</p> : null}</td>
                <td data-mobile-label="Entrega" className="px-4 py-3 text-gray-600">{latestDelivery ? <><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", DELIVERY_STATUS_TONES[latestDelivery.status] ?? "bg-gray-100 text-gray-600")}>{DELIVERY_STATUS_LABELS[latestDelivery.status] ?? latestDelivery.status}</span><p className="mt-1">{latestDelivery.title}</p></> : "Sin entrega"}</td>
                <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right">
                  <AdminRowActions>
                    <AdminActionItem><Link href={`/admin/tareas/${task.id}`} className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Abrir detalle</Link></AdminActionItem>
                    <AdminActionItem><TaskSummaryModal task={task} /></AdminActionItem>
                    <AdminActionItem><Link href={`/admin/tareas/${task.id}?tab=produccion`} className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Editar tarea</Link></AdminActionItem>
                    <AdminActionItem><TaskIncidentsModal task={task} /></AdminActionItem>
                    {task.status === "asignada" ? <AdminActionItem><form action={startAssignedTaskAction}><input type="hidden" name="taskId" value={task.id} /><button type="submit" className="text-primary">Iniciar tarea</button></form></AdminActionItem> : null}
                    {task.status === "completada" ? <AdminActionItem><form action={closeOwnTaskAction}><input type="hidden" name="id" value={task.id} /><input type="hidden" name="workshopId" value={workshopId} /><button type="submit" className="text-primary">Cerrar tarea</button></form></AdminActionItem> : null}
                  </AdminRowActions>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
          <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Incidencia</th>
                  <th className="px-4 py-3">Reportada</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="align-top hover:bg-gray-50">
                    <td data-mobile-label="Estado" className="px-4 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", TASK_INCIDENT_STATUS_TONES[incident.status] ?? "bg-gray-100 text-gray-600")}>{TASK_INCIDENT_STATUS_LABELS[incident.status] ?? incident.status}</span></td>
                    <td data-mobile="primary" data-mobile-label="Incidencia" className="px-4 py-4 text-gray-700"><p>{incident.description}</p>{incident.resolution_notes ? <p className="mt-2 text-sm text-gray-500">Resolución: {incident.resolution_notes}</p> : null}</td>
                    <td data-mobile-label="Reportada" className="px-4 py-4 text-gray-500">{incident.created_by_role}<br />{formatDate(incident.created_at)}</td>
                    <td data-mobile-label="Acción" className="px-4 py-4">
                      {incident.status === "open" ? (
                        <form action={resolveTaskIncidentAction} className="space-y-2">
                          <input type="hidden" name="incidentId" value={incident.id} />
                          <input type="hidden" name="taskId" value={task.id} />
                          <textarea className={`${compactInputClassName} min-h-[64px]`} name="resolutionNotes" placeholder="Notas de resolución" />
                          <Button type="submit" size="sm" variant="secondary">Marcar resuelta</Button>
                        </form>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay incidencias registradas en esta tarea.</p>
        )}

        <form action={createTaskIncidentAction} className="space-y-3">
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
      <form action={createDeliveryAction} className="space-y-3">
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
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-ink">Resumen</p>
        {task.description ? <p className="mt-2">{task.description}</p> : null}
        {task.requested_items ? <p className="mt-2"><span className="font-medium text-gray-700">Resultado esperado:</span> {task.requested_items}</p> : null}
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

export default async function AdminNecesidadesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireWorkshopUser();
  const params = await searchParams;
  const page = getPageParam(params);
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status") ?? "all";

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;

    const result = await getAllyTaskBoardPage(ally.id, { page, limit: 20, q, status });
    const tasks = result.items;

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Tareas"
          description="Consulta tus tareas asignadas y completa la producción."
        />

        <CreateNeedForm workshopId={ally.id} />

        <AdminRecordsSummary total={result.total} />

        {tasks.length ? (
          <><AllyTaskTable tasks={tasks} workshopId={ally.id} /><AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, nextPage)} /></>
        ) : (
          <EmptyState title="Sin tareas asignadas" description="Cuando Promoda te asigne producción aparecerá aquí." />
        )}

      </div>
    );
  }

  await requireWorkshopAdminUser();
  const result = await getAdminTaskBoardPage({ page, limit: 20, q, status });
  const tasks = result.items;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Tareas"
        description="Crea tareas para los aliados y gestiona su producción."
      />

      <AdminToolbar
        filters={<AutoSubmitFilterForm action="/admin/tareas" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_220px]"><input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar tarea" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todos los estados</option>{Object.entries(ASSIGNED_TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></AutoSubmitFilterForm>}
        actions={<CreateAssignedTaskModal />}
      />

      <AdminRecordsSummary total={result.total} />

      {tasks.length ? (
        <div className="space-y-4">
          <SectionCard className="overflow-hidden">
            <AdminTableFrame>
              <table className="admin-mobile-cards min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-2.5">Tarea asignada</th>
                    <th className="px-4 py-2.5">Aliado asignado</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td data-mobile="primary" data-mobile-label="Tarea" className="px-4 py-2.5 align-top leading-tight">
                        <Link href={`/admin/tareas/${task.id}`} className="font-semibold text-ink hover:text-primary">{task.title}</Link>
                      </td>
                      <td data-mobile-label="Aliado" className="px-4 py-2.5 align-top leading-tight">
                        {task.ally ? (
                          <Link href={`/admin/aliados/${task.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{task.ally.name}</Link>
                        ) : (
                          <span className="text-gray-400">Sin aliado</span>
                        )}
                      </td>
                      <td data-mobile-label="Estado" className="px-4 py-2.5 align-top leading-tight">
                        <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-gray-100 text-gray-600")}>{getTaskStatusSummary(task.status)}</span>
                      </td>
                      <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-2.5 align-top leading-tight">
                        <AdminRowActions>
                          <AdminActionItem><Link href={`/admin/tareas/${task.id}`} className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Abrir detalle</Link></AdminActionItem>
                          <AdminActionItem><TaskSummaryModal task={task} /></AdminActionItem>
                          <AdminActionItem><Link href={`/admin/tareas/${task.id}?tab=produccion`} className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Editar tarea</Link></AdminActionItem>
                          <AdminActionItem><TaskIncidentsModal task={task} /></AdminActionItem>
                          <AdminActionItem><CreateTaskDeliveryModal task={task} /></AdminActionItem>
                        </AdminRowActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableFrame>

          </SectionCard>
          <AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, nextPage)} />
        </div>
      ) : (
        <EmptyState title="No hay tareas registradas." description="Crea una tarea para comenzar el flujo." />
      )}
    </div>
  );
}
