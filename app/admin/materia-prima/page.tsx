import Link from "next/link";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminRecordsSummary, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { LazyOwnTaskSelect } from "@/components/lazy-own-task-select";
import { Button, compactInputClassName } from "@/components/ui";
import {
  RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS,
  RAW_MATERIAL_ASSIGNMENT_STATUS_TONES,
  RAW_MATERIAL_MOVEMENT_TYPE_LABELS,
  RAW_MATERIAL_MOVEMENT_TYPE_TONES,
  RAW_MATERIAL_STATUS_LABELS,
  RAW_MATERIAL_STATUS_TONES,
} from "@/lib/constants";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";

import { requireCurrentAlly } from "../ally-scope";
import { assignOwnMaterialToTaskAction, createRawMaterialAction, registerRawMaterialMovementAction } from "./actions";
import {
  getAllyRawMaterialsPage,
  getMaterialAssignmentsPage,
  getRawMaterialMovementsPage,
  getRawMaterialsPage,
} from "@/lib/production";

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(String(params.page ?? "").trim());
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(page: number) {
  return page > 1 ? `/admin/materia-prima?page=${page}` : "/admin/materia-prima";
}

function MaterialTableSection({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <AdminRecordsSummary total={total} />
      </div>
      {children}
    </section>
  );
}

export default async function AdminMaterialesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireWorkshopUser();
  const params = await searchParams;
  const page = getPageParam(params);

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    const [materialsResult, assignments] = await Promise.all([
      getAllyRawMaterialsPage({ allyId: ally.id, page, limit: 20 }),
      getMaterialAssignmentsPage({ allyId: ally.id, page, limit: 20 }),
    ]);
    const materials = materialsResult.items;

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Materia prima"
          description="Gestiona tu inventario propio, registra movimientos y consulta las asignaciones por tarea."
        />

        <AdminToolbar actions={<div className="flex flex-wrap gap-2">
          <Modal triggerLabel="Nueva materia prima" triggerVariant="primary" title="Agregar al inventario propio" description="Registra un insumo que recibiste directamente en tu aliado.">
            <form action={createRawMaterialAction} className="grid gap-4">
              <input type="hidden" name="allyId" value={ally.id} />
              <input className={compactInputClassName} name="name" required placeholder="Nombre" />
              <input className={compactInputClassName} name="category" placeholder="Categoría" />
              <input className={compactInputClassName} name="unit" placeholder="Unidad (metros, conos, kg...)" />
              <input className={compactInputClassName} name="stockQuantity" type="number" min="0" step="0.01" placeholder="Stock inicial" />
              <textarea className={`${compactInputClassName} min-h-[80px]`} name="description" placeholder="Descripción" />
              <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Notas" />
              <Button type="submit">Guardar materia prima</Button>
            </form>
          </Modal>
          {materials.some((material) => material.ally_id === ally.id) ? (
            <Modal triggerLabel="Registrar movimiento" title="Registrar movimiento" description="Registra entradas, devoluciones, mermas o ajustes de tu inventario propio.">
              <form action={registerRawMaterialMovementAction} className="grid gap-4">
                <input type="hidden" name="allyId" value={ally.id} />
                <select className={compactInputClassName} name="rawMaterialId" required defaultValue="">
                  <option value="" disabled>Selecciona materia prima</option>
                  {materials.filter((material) => material.ally_id === ally.id).map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                </select>
                <select className={compactInputClassName} name="movementType" required defaultValue="entrada">
                  <option value="entrada">Entrada</option><option value="devolucion">Devolución</option><option value="merma">Merma</option><option value="ajuste">Ajuste</option>
                </select>
                <input className={compactInputClassName} name="quantity" type="number" step="0.01" required placeholder="Cantidad" />
                <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Motivo o detalle" />
                <Button type="submit" variant="secondary">Registrar movimiento</Button>
              </form>
            </Modal>
          ) : null}
          {materials.some((material) => material.ally_id === ally.id) ? (
            <Modal triggerLabel="Asignar a tarea" title="Asignar material a tarea" description="Reserva una parte de tu inventario para una tarea propia.">
              <form action={assignOwnMaterialToTaskAction} className="grid gap-4">
                <input type="hidden" name="allyId" value={ally.id} />
                <select className={compactInputClassName} name="rawMaterialId" required defaultValue=""><option value="" disabled>Selecciona materia prima</option>{materials.filter((material) => material.ally_id === ally.id).map((material) => <option key={material.id} value={material.id}>{material.name} ({material.stock_quantity ?? 0} {material.unit ?? ""})</option>)}</select>
                <LazyOwnTaskSelect />
                <input className={compactInputClassName} name="quantity" type="number" min="0.01" step="0.01" required placeholder="Cantidad" />
                <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Notas" />
                <Button type="submit">Asignar material</Button>
              </form>
            </Modal>
          ) : null}
        </div>} />

        {materials.length ? (
          <MaterialTableSection title="Inventario propio" total={materialsResult.total}>
            <AdminTableFrame className="border-y border-gray-200">
              <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600"><tr><th className="px-6 py-3">Material</th><th className="px-6 py-3">Aliado</th><th className="px-6 py-3">Categoría</th><th className="px-6 py-3">Unidad</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">Estado</th></tr></thead>
                <tbody className="divide-y divide-gray-200">{materials.map((material) => <tr key={material.id} className="hover:bg-gray-50"><td data-mobile="primary" data-mobile-label="Material" className="px-6 py-4 font-medium text-ink">{material.name}</td><td data-mobile-label="Aliado" className="px-6 py-4 text-gray-600">{material.ally?.name ?? "Inventario Promoda"}</td><td data-mobile="hidden" data-mobile-label="Categoría" className="px-6 py-4 text-gray-600">{material.category ?? "-"}</td><td data-mobile-label="Unidad" className="px-6 py-4 text-gray-600">{material.unit ?? "-"}</td><td data-mobile-label="Stock" className="px-6 py-4 text-gray-600">{material.stock_quantity ?? 0}</td><td data-mobile-label="Estado" className="px-6 py-4"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span></td></tr>)}</tbody>
              </table>
            </AdminTableFrame>
          </MaterialTableSection>
        ) : null}
        {materials.length ? <AdminPagination page={materialsResult.page} pageCount={materialsResult.pageCount} total={materialsResult.total} limit={materialsResult.limit} hrefForPage={pageHref} /> : null}

        {assignments.items.length ? (
          <MaterialTableSection title="Asignaciones por tarea" total={assignments.total}>
            <AdminTableFrame className="border-y border-gray-200">
              <table className="admin-mobile-cards min-w-[800px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600"><tr><th className="px-5 py-3">Material</th><th className="px-5 py-3">Tarea</th><th className="px-5 py-3">Asignado</th><th className="px-5 py-3">Usado</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Fecha</th></tr></thead>
                <tbody className="divide-y divide-gray-200">{assignments.items.map((assignment) => <tr key={assignment.id} className="hover:bg-gray-50"><td data-mobile="primary" data-mobile-label="Material" className="px-5 py-3 font-medium text-ink">{assignment.name_snapshot}</td><td data-mobile-label="Tarea" className="px-5 py-3 text-gray-600">{assignment.task ? <Link href={`/admin/tareas/${assignment.task.id}`} className="font-semibold text-primary hover:underline">{assignment.task.title}</Link> : "Sin tarea"}</td><td data-mobile-label="Asignado" className="px-5 py-3 text-gray-600">{assignment.quantity ?? "-"} {assignment.unit ?? ""}</td><td data-mobile="hidden" data-mobile-label="Usado" className="px-5 py-3 text-gray-600">{assignment.used_quantity ?? "-"} {assignment.unit ?? ""}</td><td data-mobile-label="Estado" className="px-5 py-3"><span className={cn("inline-flex rounded-md px-2 py-1 text-sm font-semibold", RAW_MATERIAL_ASSIGNMENT_STATUS_TONES[assignment.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}</span></td><td data-mobile-label="Fecha" className="px-5 py-3 text-gray-500">{formatDate(assignment.assigned_at)}</td></tr>)}</tbody>
              </table>
            </AdminTableFrame>
            <AdminPagination page={assignments.page} pageCount={assignments.pageCount} total={assignments.total} limit={assignments.limit} hrefForPage={pageHref} />
          </MaterialTableSection>
        ) : (
          <EmptyState title="Sin materia prima" description="Agrega materia prima propia o espera una asignación para una tarea." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const [materialsResult, assignmentsResult, movementsResult] = await Promise.all([
    getRawMaterialsPage({ page, limit: 20 }),
    getMaterialAssignmentsPage({ page, limit: 20 }),
    getRawMaterialMovementsPage({ page, limit: 20 }),
  ]);
  const materials = materialsResult.items;
  const assignments = assignmentsResult.items;
  const movements = movementsResult.items;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Materia prima"
        description="Carga inventario, revisa stock y sigue la materia prima asignada a cada tarea."
      />

      <AdminToolbar actions={<div className="flex flex-wrap gap-2">
        <Modal triggerLabel="Nueva materia prima" triggerVariant="primary" title="Cargar materia prima" description="Registra un nuevo insumo con stock inicial y datos base.">
          <form action={createRawMaterialAction} className="grid gap-4 md:grid-cols-2">
            <input className={compactInputClassName} name="name" required placeholder="Nombre" />
            <input className={compactInputClassName} name="category" placeholder="Categoria" />
            <input className={compactInputClassName} name="unit" placeholder="Unidad (metros, conos, kg...)" />
            <input className={compactInputClassName} name="stockQuantity" type="number" min="0" step="0.01" placeholder="Stock inicial" />
            <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Descripcion" />
            <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" placeholder="Notas" />
            <div className="md:col-span-2">
              <Button type="submit">Guardar materia prima</Button>
            </div>
          </form>
        </Modal>

        {materials.length ? (
          <Modal
            triggerLabel="Registrar movimiento"
            title="Registrar movimiento"
            description="Usa entradas, devoluciones, mermas o ajustes para mantener el inventario real."
          >
            <form action={registerRawMaterialMovementAction} className="grid gap-4 md:grid-cols-2">
              <select className={compactInputClassName} name="rawMaterialId" required defaultValue="">
                <option value="" disabled>Selecciona materia prima</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>{material.name}</option>
                ))}
              </select>
              <select className={compactInputClassName} name="movementType" required defaultValue="entrada">
                <option value="entrada">Entrada</option>
                <option value="devolucion">Devolucion</option>
                <option value="merma">Merma</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <input className={compactInputClassName} name="quantity" type="number" step="0.01" required placeholder="Cantidad" />
              <div className="hidden md:block" />
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" placeholder="Motivo o detalle del movimiento" />
              <div className="md:col-span-2">
                <Button type="submit" variant="secondary">Registrar movimiento</Button>
              </div>
            </form>
          </Modal>
        ) : null}
      </div>} />

      {materials.length ? (
        <>
        <MaterialTableSection title="Inventario" total={materialsResult.total}>
          <AdminTableFrame className="border-y border-gray-200">
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Material</th>
                  <th className="px-6 py-3">Aliado</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Unidad</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td data-mobile="primary" data-mobile-label="Material" className="px-6 py-4 font-medium text-ink">{material.name}</td>
                    <td data-mobile-label="Aliado" className="px-6 py-4 text-gray-600">{material.ally?.name ?? "Inventario Promoda"}</td>
                    <td data-mobile="hidden" data-mobile-label="Categoría" className="px-6 py-4 text-gray-600">{material.category ?? "-"}</td>
                    <td data-mobile-label="Unidad" className="px-6 py-4 text-gray-600">{material.unit ?? "-"}</td>
                    <td data-mobile-label="Stock" className="px-6 py-4 text-gray-600">{material.stock_quantity ?? "-"}</td>
                    <td data-mobile-label="Estado" className="px-6 py-4">
                      <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
        </MaterialTableSection>
        <AdminPagination page={materialsResult.page} pageCount={materialsResult.pageCount} total={materialsResult.total} limit={materialsResult.limit} hrefForPage={pageHref} />
        </>
      ) : (
        <EmptyState title="Sin inventario cargado" description="Agrega materia prima para poder asignarla a las tareas." />
      )}

      {assignments.length ? (
        <>
        <MaterialTableSection title="Asignaciones recientes" total={assignmentsResult.total}>
          <AdminTableFrame className="border-y border-gray-200">
            <table className="admin-mobile-cards min-w-[920px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Material</th>
                  <th className="px-6 py-3">Aliado</th>
                  <th className="px-6 py-3">Tarea</th>
                  <th className="px-6 py-3">Asignado</th>
                  <th className="px-6 py-3">Usado</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td data-mobile="primary" data-mobile-label="Material" className="px-6 py-4 font-medium text-ink">{assignment.name_snapshot}</td>
                    <td data-mobile-label="Aliado" className="px-6 py-4 text-gray-600">
                      {assignment.ally ? (
                        <Link href={`/admin/aliados/${assignment.ally.id}`} className="text-[#F74897] hover:underline">{assignment.ally.name}</Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td data-mobile-label="Tarea" className="px-6 py-4 text-gray-600">{assignment.task ? <Link href={`/admin/tareas/${assignment.task.id}`} className="font-semibold text-primary hover:underline">{assignment.task.title}</Link> : "Sin tarea"}</td>
                    <td data-mobile-label="Asignado" className="px-6 py-4 text-gray-600">{assignment.quantity ?? "-"} {assignment.unit ?? ""}</td>
                    <td data-mobile="hidden" data-mobile-label="Usado" className="px-6 py-4 text-gray-600">{assignment.used_quantity ?? "-"} {assignment.unit ?? ""}</td>
                    <td data-mobile-label="Estado" className="px-6 py-4">
                      <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_ASSIGNMENT_STATUS_TONES[assignment.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
        <AdminPagination page={assignmentsResult.page} pageCount={assignmentsResult.pageCount} total={assignmentsResult.total} limit={assignmentsResult.limit} hrefForPage={pageHref} />
        </MaterialTableSection>
        </>
      ) : null}

      {movements.length ? (
        <>
        <MaterialTableSection title="Movimientos recientes" total={movementsResult.total}>
          <AdminTableFrame className="border-y border-gray-200">
            <table className="admin-mobile-cards min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Material</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Cambio</th>
                  <th className="px-6 py-3">Balance</th>
                  <th className="px-6 py-3">Tarea</th>
                  <th className="px-6 py-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td data-mobile-label="Fecha" className="px-6 py-4 text-gray-600">{formatDate(movement.created_at)}</td>
                    <td data-mobile="primary" data-mobile-label="Material" className="px-6 py-4 font-medium text-ink">{movement.raw_material?.name ?? "-"}</td>
                    <td data-mobile-label="Tipo" className="px-6 py-4">
                      <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_MOVEMENT_TYPE_TONES[movement.movement_type] ?? "bg-gray-100 text-gray-600")}>
                        {RAW_MATERIAL_MOVEMENT_TYPE_LABELS[movement.movement_type] ?? movement.movement_type}
                      </span>
                    </td>
                    <td data-mobile-label="Cambio" className={cn("px-6 py-4 font-semibold", movement.quantity_change >= 0 ? "text-green-700" : "text-red-600")}>
                      {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change} {movement.raw_material?.unit ?? ""}
                    </td>
                    <td data-mobile-label="Balance" className="px-6 py-4 text-gray-600">{movement.balance_after ?? "-"} {movement.raw_material?.unit ?? ""}</td>
                    <td data-mobile-label="Tarea" className="px-6 py-4 text-gray-600">{movement.task ? <Link href={`/admin/tareas/${movement.task.id}`} className="font-semibold text-primary hover:underline">{movement.task.title}</Link> : "-"}</td>
                    <td data-mobile="hidden" data-mobile-label="Notas" className="px-6 py-4 text-gray-600">{movement.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
        <AdminPagination page={movementsResult.page} pageCount={movementsResult.pageCount} total={movementsResult.total} limit={movementsResult.limit} hrefForPage={pageHref} />
        </MaterialTableSection>
        </>
      ) : null}
    </div>
  );
}
