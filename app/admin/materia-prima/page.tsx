import Link from "next/link";
import type { ReactNode } from "react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { LazyOwnTaskSelect } from "@/components/lazy-own-task-select";
import { Button, compactInputClassName } from "@/components/ui";
import {
  RAW_MATERIAL_STATUS_LABELS,
  RAW_MATERIAL_STATUS_TONES,
} from "@/lib/constants";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { requireCurrentAlly } from "../ally-scope";
import { assignOwnMaterialToTaskAction, createRawMaterialAction, registerRawMaterialMovementAction } from "./actions";
import {
  getAllyRawMaterialsPage,
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
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <AdminRecordsSummary total={total} />
      </div>
      {children}
    </section>
  );
}

function MaterialMovementForm({ materialId, allyId }: { materialId: string; allyId?: string }) {
  return (
    <form action={registerRawMaterialMovementAction} className="grid gap-4">
      <input type="hidden" name="rawMaterialId" value={materialId} />
      {allyId ? <input type="hidden" name="allyId" value={allyId} /> : null}
      <select className={compactInputClassName} name="movementType" required defaultValue="entrada">
        <option value="entrada">Entrada</option>
        <option value="devolucion">Devolución</option>
        <option value="merma">Merma</option>
        <option value="ajuste">Ajuste</option>
      </select>
      <input className={compactInputClassName} name="quantity" type="number" step="0.01" required placeholder="Cantidad" />
      <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Motivo o detalle del movimiento" />
      <Button type="submit">Registrar movimiento</Button>
    </form>
  );
}

function MaterialActions({
  material,
  allyId,
  canManage,
}: {
  material: { id: string; name: string; stock_quantity: number | null; unit: string | null };
  allyId?: string;
  canManage: boolean;
}) {
  return (
    <AdminRowActions>
      {canManage ? (
        <AdminActionItem>
          <Modal triggerLabel="Registrar movimiento" title="Registrar movimiento" description={`Actualiza el inventario de ${material.name}.`}>
            <MaterialMovementForm materialId={material.id} allyId={allyId} />
          </Modal>
        </AdminActionItem>
      ) : null}
      <AdminActionItem>
        <Link href={`/admin/materia-prima/${material.id}/movimientos`}>Ver movimientos</Link>
      </AdminActionItem>
      {allyId && canManage ? (
        <AdminActionItem>
          <Modal triggerLabel="Asignar a tarea" title="Asignar material a tarea" description="Reserva una parte de tu inventario para una tarea propia.">
            <form action={assignOwnMaterialToTaskAction} className="grid gap-4">
              <input type="hidden" name="allyId" value={allyId} />
              <input type="hidden" name="rawMaterialId" value={material.id} />
              <LazyOwnTaskSelect />
              <input className={compactInputClassName} name="quantity" type="number" min="0.01" step="0.01" required placeholder="Cantidad" />
              <p className="text-sm text-gray-500">Disponible: {material.stock_quantity ?? 0} {material.unit ?? ""}</p>
              <textarea className={`${compactInputClassName} min-h-[80px]`} name="notes" placeholder="Notas" />
              <Button type="submit">Asignar material</Button>
            </form>
          </Modal>
        </AdminActionItem>
      ) : null}
    </AdminRowActions>
  );
}

export default async function AdminMaterialesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireWorkshopUser();
  const params = await searchParams;
  const page = getPageParam(params);

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    const materialsResult = await getAllyRawMaterialsPage({ allyId: ally.id, page, limit: 20 });
    const materials = materialsResult.items;

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Materia prima"
          description="Gestiona tu inventario propio y consulta los movimientos de cada material."
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
        </div>} />

        {materials.length ? (
          <MaterialTableSection title="Inventario propio" total={materialsResult.total}>
            <AdminTableFrame className="border-y border-gray-200">
              <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Material</th><th className="px-4 py-3">Aliado</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Unidad</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
                <tbody className="divide-y divide-gray-200">{materials.map((material) => <tr key={material.id} className="hover:bg-gray-50"><td data-mobile="primary" data-mobile-label="Material" className="px-4 py-3 font-medium text-ink">{material.name}</td><td data-mobile-label="Aliado" className="px-4 py-3 text-gray-600">{material.ally?.name ?? "Inventario Promoda"}</td><td data-mobile="hidden" data-mobile-label="Categoría" className="px-4 py-3 text-gray-600">{material.category ?? "-"}</td><td data-mobile-label="Unidad" className="px-4 py-3 text-gray-600">{material.unit ?? "-"}</td><td data-mobile-label="Stock" className="px-4 py-3 text-gray-600">{material.stock_quantity ?? 0}</td><td data-mobile-label="Estado" className="px-4 py-3"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span></td><td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right"><MaterialActions material={material} allyId={ally.id} canManage={material.ally_id === ally.id} /></td></tr>)}</tbody>
              </table>
            </AdminTableFrame>
            <AdminPagination page={materialsResult.page} pageCount={materialsResult.pageCount} total={materialsResult.total} limit={materialsResult.limit} hrefForPage={pageHref} />
          </MaterialTableSection>
        ) : null}

        {!materials.length ? <EmptyState title="Sin materia prima" description="Agrega materia prima propia para comenzar a gestionarla." /> : null}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const materialsResult = await getRawMaterialsPage({ page, limit: 20 });
  const materials = materialsResult.items;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Materia prima"
        description="Carga inventario y consulta los movimientos de cada materia prima."
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

      </div>} />

      {materials.length ? (
        <>
        <MaterialTableSection title="Inventario" total={materialsResult.total}>
          <AdminTableFrame className="border-y border-gray-200">
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Aliado</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Unidad</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td data-mobile="primary" data-mobile-label="Material" className="px-4 py-3 font-medium text-ink">{material.name}</td>
                    <td data-mobile-label="Aliado" className="px-4 py-3 text-gray-600">{material.ally?.name ?? "Inventario Promoda"}</td>
                    <td data-mobile="hidden" data-mobile-label="Categoría" className="px-4 py-3 text-gray-600">{material.category ?? "-"}</td>
                    <td data-mobile-label="Unidad" className="px-4 py-3 text-gray-600">{material.unit ?? "-"}</td>
                    <td data-mobile-label="Stock" className="px-4 py-3 text-gray-600">{material.stock_quantity ?? "-"}</td>
                    <td data-mobile-label="Estado" className="px-4 py-3">
                      <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span>
                    </td>
                    <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right"><MaterialActions material={material} canManage /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
          <AdminPagination page={materialsResult.page} pageCount={materialsResult.pageCount} total={materialsResult.total} limit={materialsResult.limit} hrefForPage={pageHref} />
        </MaterialTableSection>
        </>
      ) : (
        <EmptyState title="Sin inventario cargado" description="Agrega materia prima para poder asignarla a las tareas." />
      )}

    </div>
  );
}
