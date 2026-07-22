import type { SupabaseClient } from "@supabase/supabase-js";

type MovementType = "entrada_inicial" | "entrada" | "devolucion" | "merma" | "ajuste" | "asignacion_tarea";

export async function applyRawMaterialMovement({
  client,
  rawMaterialId,
  movementType,
  quantityChange,
  notes,
  createdByUserId,
  relatedTaskId,
  relatedAssignmentId,
}: {
  client: SupabaseClient;
  rawMaterialId: string;
  movementType: MovementType;
  quantityChange: number;
  notes?: string | null;
  createdByUserId?: string | null;
  relatedTaskId?: string | null;
  relatedAssignmentId?: string | null;
}) {
  const { data: material, error: materialError } = await client
    .from("raw_materials")
    .select("id, stock_quantity")
    .eq("id", rawMaterialId)
    .maybeSingle();

  if (materialError) throw new Error(materialError.message);
  if (!material) throw new Error("La materia prima no existe.");

  const currentStock = Number(material.stock_quantity ?? 0);
  const nextStock = currentStock + quantityChange;
  if (nextStock < 0) {
    throw new Error("El movimiento deja el inventario en negativo.");
  }

  const nextStatus = nextStock <= 0 ? "agotado" : "disponible";

  const { error: updateError } = await client
    .from("raw_materials")
    .update({ stock_quantity: nextStock, status: nextStatus })
    .eq("id", rawMaterialId);

  if (updateError) throw new Error(updateError.message);

  const { data: movement, error: movementError } = await client
    .from("raw_material_movements")
    .insert({
      raw_material_id: rawMaterialId,
      related_task_id: relatedTaskId ?? null,
      related_assignment_id: relatedAssignmentId ?? null,
      movement_type: movementType,
      quantity_change: quantityChange,
      balance_after: nextStock,
      notes: notes ?? null,
      created_by_user_id: createdByUserId ?? null,
    })
    .select("id, balance_after")
    .single();

  if (movementError) throw new Error(movementError.message);

  return { movement, nextStock, nextStatus };
}
