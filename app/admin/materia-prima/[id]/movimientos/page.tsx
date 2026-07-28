import Link from "next/link";

import { AdminDetailPanel, AdminRecordsSummary } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName, LinkButton } from "@/components/ui";
import {
  RAW_MATERIAL_MOVEMENT_TYPE_LABELS,
  RAW_MATERIAL_MOVEMENT_TYPE_TONES,
  RAW_MATERIAL_STATUS_LABELS,
  RAW_MATERIAL_STATUS_TONES,
} from "@/lib/constants";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { getAllyRawMaterials, getRawMaterialById, getRawMaterialMovementsPage } from "@/lib/production";
import type { RawMaterial } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

import { requireCurrentAlly } from "../../../ally-scope";
import { registerRawMaterialMovementAction } from "../../actions";

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(String(params.page ?? "").trim());
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(materialId: string, page: number) {
  return page > 1
    ? `/admin/materia-prima/${materialId}/movimientos?page=${page}`
    : `/admin/materia-prima/${materialId}/movimientos`;
}

function MovementForm({ materialId, allyId }: { materialId: string; allyId?: string }) {
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
      <textarea className={`${compactInputClassName} min-h-[96px]`} name="notes" placeholder="Motivo o detalle del movimiento" />
      <Button type="submit">Registrar movimiento</Button>
    </form>
  );
}

export default async function RawMaterialMovementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopUser();
  const { id } = await params;
  const queryParams = await searchParams;
  const role = user.app_metadata?.role;
  let material: RawMaterial | null = null;
  let allyId: string | undefined;

  if (role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    allyId = ally.id;
    material = (await getAllyRawMaterials(ally.id)).find((item) => item.id === id) ?? null;
  } else {
    await requireWorkshopAdminUser();
    material = await getRawMaterialById(id);
  }

  if (!material) {
    return <EmptyState title="Materia prima no encontrada" description="El material no existe o no tienes acceso a él." action={<LinkButton href="/admin/materia-prima" variant="secondary">Volver a materia prima</LinkButton>} />;
  }

  const canManage = role !== "aliado" || material.ally_id === allyId;
  const movements = await getRawMaterialMovementsPage({
    rawMaterialId: material.id,
    page: getPageParam(queryParams),
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Materia prima"
        title={`Movimientos de ${material.name}`}
        description="Consulta el historial de entradas, devoluciones, mermas y ajustes de este material."
        navigation={{ baseHref: "/admin/materia-prima", baseLabel: "Materia prima", currentLabel: material.name }}
        actions={<Link href="/admin/materia-prima" className="inline-flex min-h-11 items-center justify-center rounded-md bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">Volver al listado</Link>}
      />

      <AdminDetailPanel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-sm text-gray-500">Material</p><p className="mt-1 font-semibold text-ink">{material.name}</p></div>
          <div><p className="text-sm text-gray-500">Categoría</p><p className="mt-1 text-gray-700">{material.category ?? "Sin categoría"}</p></div>
          <div><p className="text-sm text-gray-500">Stock actual</p><p className="mt-1 text-gray-700">{material.stock_quantity ?? 0} {material.unit ?? ""}</p></div>
          <div><p className="text-sm text-gray-500">Estado</p><span className={cn("mt-1 inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span></div>
        </div>
      </AdminDetailPanel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminRecordsSummary total={movements.total} />
        {canManage ? (
          <Modal triggerLabel="Registrar movimiento" triggerVariant="primary" title="Registrar movimiento" description={`Actualiza el inventario de ${material.name}.`}>
            <MovementForm materialId={material.id} allyId={allyId} />
          </Modal>
        ) : null}
      </div>

      {movements.items.length ? (
        <>
          <div className="admin-table-frame overflow-x-auto bg-white">
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cambio</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Tarea</th>
                  <th className="px-4 py-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movements.items.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td data-mobile="primary" data-mobile-label="Fecha" className="px-4 py-3 text-gray-600">{formatDate(movement.created_at)}</td>
                    <td data-mobile-label="Tipo" className="px-4 py-3"><span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", RAW_MATERIAL_MOVEMENT_TYPE_TONES[movement.movement_type] ?? "bg-gray-100 text-gray-600")}>{RAW_MATERIAL_MOVEMENT_TYPE_LABELS[movement.movement_type] ?? movement.movement_type}</span></td>
                    <td data-mobile-label="Cambio" className={cn("px-4 py-3 font-semibold", movement.quantity_change >= 0 ? "text-green-700" : "text-red-600")}>{movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change} {material.unit ?? ""}</td>
                    <td data-mobile-label="Balance" className="px-4 py-3 text-gray-600">{movement.balance_after ?? "-"} {material.unit ?? ""}</td>
                    <td data-mobile-label="Tarea" className="px-4 py-3 text-gray-600">{movement.task ? <Link href={`/admin/tareas/${movement.task.id}`} className="font-semibold text-primary hover:underline">{movement.task.title}</Link> : "-"}</td>
                    <td data-mobile="hidden" data-mobile-label="Notas" className="px-4 py-3 text-gray-600">{movement.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination page={movements.page} pageCount={movements.pageCount} total={movements.total} limit={movements.limit} hrefForPage={(page) => pageHref(material.id, page)} />
        </>
      ) : (
        <EmptyState title="Sin movimientos" description="Todavía no se han registrado movimientos para este material." />
      )}
    </div>
  );
}
