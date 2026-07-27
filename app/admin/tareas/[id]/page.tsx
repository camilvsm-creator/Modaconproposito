import Link from "next/link";

import { AdminActionItem, AdminDetailPanel, AdminRecordsSummary, AdminRowActions, AdminStatusBadge, AdminTabs } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { Button, compactInputClassName } from "@/components/ui";
import {
  ASSIGNED_TASK_STATUS_LABELS,
  ASSIGNED_TASK_STATUS_TONES,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_TONES,
  RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS,
  RAW_MATERIAL_ASSIGNMENT_STATUS_TONES,
  TASK_INCIDENT_STATUS_LABELS,
  TASK_INCIDENT_STATUS_TONES,
  URGENCY_LABELS,
} from "@/lib/constants";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import {
  getAdminTaskById,
  getAllyTaskById,
  getTaskDeliveriesPage,
  getTaskIncidentsPage,
  getTaskMaterialAssignments,
  getTaskMaterialAssignmentsPage,
  getTaskRelationCounts,
} from "@/lib/production";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

import { requireCurrentAlly } from "../../ally-scope";
import { createDeliveryAction } from "../../entregas/actions";
import {
  closeOwnTaskAction,
  createTaskIncidentAction,
  resolveTaskIncidentAction,
  saveTaskMaterialUsageAction,
  startAssignedTaskAction,
  updateAssignedTaskAdminAction,
} from "../actions";
import { UpdateOwnTaskForm } from "../components/update-own-task-form";

type TaskTab = "resumen" | "produccion" | "materia-prima" | "entregas" | "incidencias";

function getTab(value: string | undefined): TaskTab {
  return value === "produccion" || value === "materia-prima" || value === "entregas" || value === "incidencias" ? value : "resumen";
}

function taskHref(id: string, tab: TaskTab) {
  return tab === "resumen" ? `/admin/tareas/${id}` : `/admin/tareas/${id}?tab=${tab}`;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = typeof params.page === "string" ? Number(params.page) : 1;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function relatedPageHref(id: string, tab: TaskTab, page: number) {
  const search = new URLSearchParams();
  search.set("tab", tab);
  if (page > 1) search.set("page", String(page));
  return `/admin/tareas/${id}?${search.toString()}`;
}

export default async function AdminTaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopUser();
  const { id } = await params;
  const query = await searchParams;
  const rawTab = typeof query.tab === "string" ? query.tab : undefined;
  const activeTab = getTab(rawTab);
  const isAlly = user.app_metadata?.role === "aliado";

  const task = isAlly
    ? await getAllyTaskById((await requireCurrentAlly())?.id ?? "", id)
    : await getAdminTaskById(id);

  if (!task) {
    return <EmptyState title="Tarea no encontrada" description="La tarea no existe o no tienes acceso a ella." action={<Link href="/admin/tareas" className="font-semibold text-primary hover:underline">Volver a tareas</Link>} />;
  }

  if (!isAlly) await requireWorkshopAdminUser();

  const relatedPage = getPageParam(query);
  const relationCounts = await getTaskRelationCounts(id, isAlly ? task.ally_id : undefined);
  const materialAssignmentsPage = activeTab === "materia-prima"
    ? await getTaskMaterialAssignmentsPage({ taskId: id, allyId: isAlly ? task.ally_id : undefined, page: relatedPage, limit: 20 })
    : null;
  const materialAssignmentsForUsage = activeTab === "materia-prima" && isAlly
    ? await getTaskMaterialAssignments(id, isAlly ? task.ally_id : undefined)
    : [];
  const deliveriesPage = activeTab === "entregas"
    ? await getTaskDeliveriesPage({ taskId: id, allyId: isAlly ? task.ally_id : undefined, page: relatedPage, limit: 20 })
    : null;
  const incidentsPage = activeTab === "incidencias"
    ? await getTaskIncidentsPage({ taskId: id, page: relatedPage, limit: 20 })
    : null;
  const materialAssignments = materialAssignmentsPage?.items ?? [];
  const deliveries = deliveriesPage?.items ?? [];
  const incidents = incidentsPage?.items ?? [];

  const statusTone = ASSIGNED_TASK_STATUS_TONES[task.status] ?? "bg-gray-100 text-gray-600";
  const tabs = [
    { href: taskHref(id, "resumen"), label: "Resumen", active: activeTab === "resumen" },
    { href: taskHref(id, "produccion"), label: "Producción", active: activeTab === "produccion" },
    { href: taskHref(id, "materia-prima"), label: "Materia prima", count: relationCounts.assignments, active: activeTab === "materia-prima" },
    { href: taskHref(id, "entregas"), label: "Entregas", count: relationCounts.deliveries, active: activeTab === "entregas" },
    { href: taskHref(id, "incidencias"), label: "Incidencias", count: relationCounts.incidents, active: activeTab === "incidencias" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={isAlly ? "Cuenta" : "Promoda"}
        title={task.title}
        description={task.description ?? undefined}
        navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: task.title }}
        actions={
          <AdminRowActions>
            <AdminActionItem><Link href="/admin/tareas" className="block w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Volver al listado</Link></AdminActionItem>
            {isAlly && task.status === "asignada" ? <AdminActionItem><form action={startAssignedTaskAction}><input type="hidden" name="taskId" value={task.id} /><button type="submit">Iniciar tarea</button></form></AdminActionItem> : null}
            {isAlly && task.status === "completada" ? <AdminActionItem><form action={closeOwnTaskAction}><input type="hidden" name="id" value={task.id} /><input type="hidden" name="workshopId" value={task.ally_id} /><button type="submit">Cerrar tarea</button></form></AdminActionItem> : null}
          </AdminRowActions>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <AdminStatusBadge className={statusTone}>{ASSIGNED_TASK_STATUS_LABELS[task.status] ?? task.status}</AdminStatusBadge>
        {task.ally ? <Link href={`/admin/aliados/${task.ally.id}`} className="text-sm font-semibold text-primary hover:underline">{task.ally.name}</Link> : null}
        {task.urgency ? <span className="text-sm text-gray-500">Urgencia: {URGENCY_LABELS[task.urgency as keyof typeof URGENCY_LABELS] ?? task.urgency}</span> : null}
        {task.due_date ? <span className="text-sm text-gray-500">Fecha límite: {formatDate(task.due_date)}</span> : null}
      </div>

      <AdminTabs tabs={tabs} />

      {activeTab === "resumen" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <AdminDetailPanel>
            <h2 className="text-lg font-semibold text-ink">Objetivo de producción</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{task.requested_items ?? task.expected_output ?? "Sin objetivo especificado."}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-sm text-gray-500">Creada</dt><dd className="mt-1 font-medium text-ink">{formatDateTime(task.created_at)}</dd></div>
              <div><dt className="text-sm text-gray-500">Asignada</dt><dd className="mt-1 font-medium text-ink">{task.assigned_at ? formatDateTime(task.assigned_at) : "—"}</dd></div>
              <div><dt className="text-sm text-gray-500">Completada</dt><dd className="mt-1 font-medium text-ink">{task.completed_at ? formatDateTime(task.completed_at) : "—"}</dd></div>
              <div><dt className="text-sm text-gray-500">Actualizada</dt><dd className="mt-1 font-medium text-ink">{formatDateTime(task.updated_at)}</dd></div>
            </dl>
          </AdminDetailPanel>
          <AdminDetailPanel>
            <h2 className="text-lg font-semibold text-ink">Notas</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-gray-600">
              <p><span className="font-semibold text-ink">Aliado:</span> {task.ally?.name ?? "Sin aliado"}</p>
              <p><span className="font-semibold text-ink">Notas del aliado:</span> {task.ally_notes ?? "Sin notas."}</p>
              {!isAlly ? <p><span className="font-semibold text-ink">Notas administrativas:</span> {task.admin_notes ?? "Sin notas."}</p> : null}
            </div>
          </AdminDetailPanel>
        </div>
      ) : null}

      {activeTab === "produccion" ? (
        <AdminDetailPanel className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Gestión de producción</h2>
            <p className="mt-1 text-sm text-gray-500">Actualiza la información operativa sin mezclarla con el listado general.</p>
          </div>
          {isAlly ? (
            <UpdateOwnTaskForm workshopId={task.ally_id} task={{ id: task.id, title: task.title, description: task.description, requested_items: task.requested_items, urgency: task.urgency, due_date: task.due_date }} />
          ) : (
            <form action={updateAssignedTaskAdminAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="taskId" value={task.id} />
              <label className="space-y-2"><span className="text-sm font-medium text-gray-800">Título</span><input className={compactInputClassName} name="title" defaultValue={task.title} required /></label>
              <label className="space-y-2"><span className="text-sm font-medium text-gray-800">Estado</span><select className={compactInputClassName} name="status" defaultValue={task.status}>{Object.entries(ASSIGNED_TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-gray-800">Descripción</span><textarea className={`${compactInputClassName} min-h-[100px]`} name="description" defaultValue={task.description ?? ""} /></label>
              <label className="space-y-2"><span className="text-sm font-medium text-gray-800">Resultado esperado</span><input className={compactInputClassName} name="expectedOutput" defaultValue={task.expected_output ?? task.requested_items ?? ""} /></label>
              <label className="space-y-2"><span className="text-sm font-medium text-gray-800">Fecha límite</span><input className={compactInputClassName} name="dueDate" type="date" defaultValue={task.due_date ?? ""} /></label>
              <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-gray-800">Notas administrativas</span><textarea className={`${compactInputClassName} min-h-[100px]`} name="adminNotes" defaultValue={task.admin_notes ?? ""} /></label>
              <div className="md:col-span-2"><Button type="submit">Guardar cambios</Button></div>
            </form>
          )}
        </AdminDetailPanel>
      ) : null}

      {activeTab === "materia-prima" ? (
        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Materia prima asignada</h2>
          <AdminRecordsSummary total={relationCounts.assignments} />
          {materialAssignments.length ? (
            <div className="mt-4 overflow-x-auto"><table className="min-w-[720px] w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Material</th><th className="px-4 py-3">Asignado</th><th className="px-4 py-3">Usado</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-gray-200">{materialAssignments.map((assignment) => <tr key={assignment.id}><td className="px-4 py-3 font-medium text-ink">{assignment.name_snapshot}</td><td className="px-4 py-3 text-gray-600">{assignment.quantity ?? "—"} {assignment.unit ?? ""}</td><td className="px-4 py-3 text-gray-600">{assignment.used_quantity ?? 0} {assignment.unit ?? ""}</td><td className="px-4 py-3"><AdminStatusBadge className={RAW_MATERIAL_ASSIGNMENT_STATUS_TONES[assignment.status] ?? "bg-gray-100 text-gray-600"}>{RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}</AdminStatusBadge></td></tr>)}</tbody></table></div>
          ) : <p className="mt-4 text-sm text-gray-500">No hay materia prima asignada a esta tarea.</p>}
          {materialAssignmentsPage ? <AdminPagination page={materialAssignmentsPage.page} pageCount={materialAssignmentsPage.pageCount} total={materialAssignmentsPage.total} limit={materialAssignmentsPage.limit} hrefForPage={(page) => relatedPageHref(id, "materia-prima", page)} /> : null}
          {isAlly && materialAssignmentsForUsage.length ? <form action={saveTaskMaterialUsageAction} className="mt-6 space-y-4"><input type="hidden" name="taskId" value={task.id} /><div className="grid gap-4 sm:grid-cols-2">{materialAssignmentsForUsage.map((assignment) => <label key={assignment.id} className="space-y-2"><span className="text-sm font-medium text-gray-800">Uso: {assignment.name_snapshot}</span><input className={compactInputClassName} name={`usedQuantity:${assignment.id}`} type="number" min="0" step="0.01" defaultValue={assignment.used_quantity ?? ""} /></label>)}</div><label className="block space-y-2"><span className="text-sm font-medium text-gray-800">Notas de producción</span><textarea className={`${compactInputClassName} min-h-[90px]`} name="allyNotes" defaultValue={task.ally_notes ?? ""} /></label><Button type="submit" name="intent" value="save" variant="secondary">Guardar consumo</Button></form> : null}
        </AdminDetailPanel>
      ) : null}

      {activeTab === "entregas" ? (
        <AdminDetailPanel>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-ink">Entregas</h2><p className="mt-1 text-sm text-gray-500">Seguimiento logístico asociado a esta tarea.</p></div>{task.status === "completada" && relationCounts.deliveries === 0 ? <form action={createDeliveryAction}><input type="hidden" name="taskId" value={task.id} /><input type="hidden" name="title" value={task.title} /><input type="hidden" name="description" value={task.description ?? ""} /><input type="hidden" name="quantity" value={task.requested_items ?? task.expected_output ?? ""} /><Button type="submit" size="sm">Crear entrega</Button></form> : null}</div>
          <AdminRecordsSummary total={relationCounts.deliveries} />
          {deliveries.length ? <div className="mt-5 overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Entrega</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Programada</th><th className="px-4 py-3">Registrada</th></tr></thead><tbody className="divide-y divide-gray-200">{deliveries.map((delivery) => <tr key={delivery.id}><td className="px-4 py-3 font-medium text-ink">{delivery.title}<p className="mt-1 text-sm font-normal text-gray-500">{delivery.quantity ?? "Sin cantidad"}</p></td><td className="px-4 py-3"><AdminStatusBadge className={DELIVERY_STATUS_TONES[delivery.status] ?? "bg-gray-100 text-gray-600"}>{DELIVERY_STATUS_LABELS[delivery.status] ?? delivery.status}</AdminStatusBadge></td><td className="px-4 py-3 text-gray-600">{delivery.scheduled_for ? formatDateTime(delivery.scheduled_for) : "—"}</td><td className="px-4 py-3 text-gray-600">{formatDateTime(delivery.created_at)}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-gray-500">No hay entregas asociadas.</p>}
          {deliveriesPage ? <AdminPagination page={deliveriesPage.page} pageCount={deliveriesPage.pageCount} total={deliveriesPage.total} limit={deliveriesPage.limit} hrefForPage={(page) => relatedPageHref(id, "entregas", page)} /> : null}
        </AdminDetailPanel>
      ) : null}

      {activeTab === "incidencias" ? (
        <AdminDetailPanel>
          <h2 className="text-lg font-semibold text-ink">Incidencias y bloqueos</h2>
          <AdminRecordsSummary total={relationCounts.incidents} />
          {incidents.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Incidencia</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-4"><AdminStatusBadge className={TASK_INCIDENT_STATUS_TONES[incident.status] ?? "bg-gray-100 text-gray-600"}>{TASK_INCIDENT_STATUS_LABELS[incident.status] ?? incident.status}</AdminStatusBadge></td>
                      <td className="px-4 py-4 text-gray-700"><p>{incident.description}</p>{incident.resolution_notes ? <p className="mt-2 text-sm text-gray-500">Resolución: {incident.resolution_notes}</p> : null}</td>
                      <td className="px-4 py-4 text-gray-500">{formatDateTime(incident.created_at)}</td>
                      <td className="px-4 py-4">
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
          ) : <p className="mt-5 text-sm text-gray-500">No hay incidencias registradas.</p>}
          {incidentsPage ? <AdminPagination page={incidentsPage.page} pageCount={incidentsPage.pageCount} total={incidentsPage.total} limit={incidentsPage.limit} hrefForPage={(page) => relatedPageHref(id, "incidencias", page)} /> : null}
          <form action={createTaskIncidentAction} className="mt-6 space-y-3"><input type="hidden" name="taskId" value={task.id} /><textarea className={`${compactInputClassName} min-h-[90px]`} name="description" placeholder="Describe una incidencia, bloqueo o riesgo" required /><Button type="submit" variant="secondary">Registrar incidencia</Button></form>
        </AdminDetailPanel>
      ) : null}
    </div>
  );
}
