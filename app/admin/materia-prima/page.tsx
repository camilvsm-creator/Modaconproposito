import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { Button, SectionCard, inputClassName } from "@/components/ui";
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
import { createRawMaterialAction, registerRawMaterialMovementAction } from "./actions";
import {
  getAdminMaterialAssignments,
  getRawMaterialMovements,
  getAllyMaterialAssignments,
  getRawMaterials,
} from "@/lib/production";

export default async function AdminMaterialesPage() {
  const user = await requireWorkshopUser();

  if (user.app_metadata?.role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    const assignments = await getAllyMaterialAssignments(ally.id);

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Materia prima"
          description="Consulta la materia prima que te asignaron por tarea y el consumo que reportaste."
          navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Materia prima" }}
        />

        {assignments.length ? (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <SectionCard key={assignment.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">{assignment.name_snapshot}</h2>
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold uppercase tracking-wide", RAW_MATERIAL_ASSIGNMENT_STATUS_TONES[assignment.status] ?? "bg-stone-100 text-stone-600")}>{RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-stone-600">
                  <p>Tarea: {assignment.task?.title ?? "Sin tarea"}</p>
                  <p>Asignado: {assignment.quantity ?? "-"} {assignment.unit ?? ""}</p>
                  <p>Usado: {assignment.used_quantity ?? "-"} {assignment.unit ?? ""}</p>
                  <p>Fecha de asignación: {formatDate(assignment.assigned_at)}</p>
                </div>
                {assignment.notes ? <p className="mt-2 text-sm text-stone-500">{assignment.notes}</p> : null}
              </SectionCard>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin materia prima asignada" description="Cuando Promoda te asigne insumos para una tarea aparecerán aquí." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const [materials, assignments, movements] = await Promise.all([
    getRawMaterials(),
    getAdminMaterialAssignments(),
    getRawMaterialMovements(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Materia prima"
        description="Carga inventario, revisa stock y sigue la materia prima asignada a cada tarea."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Materia prima" }}
      />

      <SectionCard className="p-6">
        <h2 className="text-lg font-semibold text-ink">Cargar materia prima</h2>
        <form action={createRawMaterialAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input className={inputClassName} name="name" required placeholder="Nombre" />
          <input className={inputClassName} name="category" placeholder="Categoría" />
          <input className={inputClassName} name="unit" placeholder="Unidad (metros, conos, kg...)" />
          <input className={inputClassName} name="stockQuantity" type="number" min="0" step="0.01" placeholder="Stock inicial" />
          <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="description" placeholder="Descripción" />
          <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="notes" placeholder="Notas" />
          <div className="md:col-span-2">
            <Button type="submit">Guardar materia prima</Button>
          </div>
        </form>
      </SectionCard>

      {materials.length ? (
        <SectionCard className="p-6">
          <h2 className="text-lg font-semibold text-ink">Registrar movimiento</h2>
          <p className="mt-2 text-sm text-stone-500">
            Usa entradas, devoluciones, mermas o ajustes para mantener el inventario real. En ajustes puedes usar valores positivos o negativos.
          </p>
          <form action={registerRawMaterialMovementAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <select className={inputClassName} name="rawMaterialId" required defaultValue="">
              <option value="" disabled>Selecciona materia prima</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>{material.name}</option>
              ))}
            </select>
            <select className={inputClassName} name="movementType" required defaultValue="entrada">
              <option value="entrada">Entrada</option>
              <option value="devolucion">Devolución</option>
              <option value="merma">Merma</option>
              <option value="ajuste">Ajuste</option>
            </select>
            <input className={inputClassName} name="quantity" type="number" step="0.01" required placeholder="Cantidad" />
            <div className="hidden md:block" />
            <textarea className={`${inputClassName} min-h-[100px] md:col-span-2`} name="notes" placeholder="Motivo o detalle del movimiento" />
            <div className="md:col-span-2">
              <Button type="submit" variant="secondary">Registrar movimiento</Button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      {materials.length ? (
        <SectionCard className="overflow-hidden">
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-ink">Inventario</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600">
                <tr>
                  <th className="px-6 py-3">Material</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Unidad</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-6 py-4 font-medium text-ink">{material.name}</td>
                    <td className="px-6 py-4 text-stone-600">{material.category ?? "-"}</td>
                    <td className="px-6 py-4 text-stone-600">{material.unit ?? "-"}</td>
                    <td className="px-6 py-4 text-stone-600">{material.stock_quantity ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", RAW_MATERIAL_STATUS_TONES[material.status] ?? "bg-stone-100 text-stone-600")}>{RAW_MATERIAL_STATUS_LABELS[material.status] ?? material.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : (
        <EmptyState title="Sin inventario cargado" description="Agrega materia prima para poder asignarla a las tareas." />
      )}

      {assignments.length ? (
        <SectionCard className="overflow-hidden">
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-ink">Asignaciones recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600">
                <tr>
                  <th className="px-6 py-3">Material</th>
                  <th className="px-6 py-3">Aliado</th>
                  <th className="px-6 py-3">Tarea</th>
                  <th className="px-6 py-3">Asignado</th>
                  <th className="px-6 py-3">Usado</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 font-medium text-ink">{assignment.name_snapshot}</td>
                    <td className="px-6 py-4 text-stone-600">
                      {assignment.ally ? (
                        <Link href={`/admin/aliados/${assignment.ally.id}`} className="text-[#F74897] hover:underline">{assignment.ally.name}</Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-600">{assignment.task?.title ?? "Sin tarea"}</td>
                    <td className="px-6 py-4 text-stone-600">{assignment.quantity ?? "-"} {assignment.unit ?? ""}</td>
                    <td className="px-6 py-4 text-stone-600">{assignment.used_quantity ?? "-"} {assignment.unit ?? ""}</td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", RAW_MATERIAL_ASSIGNMENT_STATUS_TONES[assignment.status] ?? "bg-stone-100 text-stone-600")}>{RAW_MATERIAL_ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}

      {movements.length ? (
        <SectionCard className="overflow-hidden">
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-ink">Movimientos recientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600">
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
              <tbody className="divide-y divide-stone-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 text-stone-600">{formatDate(movement.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-ink">{movement.raw_material?.name ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide", RAW_MATERIAL_MOVEMENT_TYPE_TONES[movement.movement_type] ?? "bg-stone-100 text-stone-600")}>
                        {RAW_MATERIAL_MOVEMENT_TYPE_LABELS[movement.movement_type] ?? movement.movement_type}
                      </span>
                    </td>
                    <td className={cn("px-6 py-4 font-semibold", movement.quantity_change >= 0 ? "text-green-700" : "text-red-600")}>
                      {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change} {movement.raw_material?.unit ?? ""}
                    </td>
                    <td className="px-6 py-4 text-stone-600">{movement.balance_after ?? "-"} {movement.raw_material?.unit ?? ""}</td>
                    <td className="px-6 py-4 text-stone-600">{movement.task?.title ?? "-"}</td>
                    <td className="px-6 py-4 text-stone-600">{movement.notes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
