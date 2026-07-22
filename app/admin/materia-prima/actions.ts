"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { applyRawMaterialMovement } from "@/lib/raw-materials";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function toNumberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createRawMaterialAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const unit = String(formData.get("unit") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const stockQuantity = toNumberOrNull(formData.get("stockQuantity"));

  if (!name) throw new Error("El nombre es obligatorio.");
  if (stockQuantity !== null && stockQuantity < 0) {
    throw new Error("El stock no puede ser negativo.");
  }

  const status = (stockQuantity ?? 0) === 0 ? "agotado" : "disponible";
  const { data, error } = await admin
    .from("raw_materials")
    .insert({
      name,
      category: category || null,
      unit: unit || null,
      description: description || null,
      notes: notes || null,
      stock_quantity: 0,
      status: stockQuantity && stockQuantity > 0 ? "agotado" : status,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if ((stockQuantity ?? 0) > 0) {
    await applyRawMaterialMovement({
      client: admin,
      rawMaterialId: data.id,
      movementType: "entrada_inicial",
      quantityChange: stockQuantity ?? 0,
      notes: notes || "Carga inicial de inventario",
      createdByUserId: user.id,
    });
  }

  await logAuditEvent({
    actor_id: user.id,
    actor_role: "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: null,
    entity_type: "raw_material",
    entity_id: data.id,
    action: "create",
    new_data: { name, stock_quantity: stockQuantity, unit: unit || null },
  });

  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/tareas");
}

export async function registerRawMaterialMovementAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const rawMaterialId = String(formData.get("rawMaterialId") || "").trim();
  const movementType = String(formData.get("movementType") || "").trim();
  const quantityValue = String(formData.get("quantity") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!rawMaterialId || !movementType) throw new Error("Selecciona el material y el tipo de movimiento.");

  const quantity = Number(quantityValue);
  if (!Number.isFinite(quantity) || quantity === 0) {
    throw new Error("La cantidad del movimiento es obligatoria.");
  }

  let quantityChange = quantity;
  if (["entrada", "devolucion"].includes(movementType)) {
    if (quantity <= 0) throw new Error("La cantidad debe ser positiva.");
    quantityChange = quantity;
  } else if (movementType === "merma") {
    if (quantity <= 0) throw new Error("La merma debe ser positiva.");
    quantityChange = -quantity;
  } else if (movementType === "ajuste") {
    quantityChange = quantity;
  } else {
    throw new Error("Tipo de movimiento no soportado.");
  }

  await applyRawMaterialMovement({
    client: admin,
    rawMaterialId,
    movementType: movementType as "entrada" | "devolucion" | "merma" | "ajuste",
    quantityChange,
    notes,
    createdByUserId: user.id,
  });

  await logAuditEvent({
    actor_id: user.id,
    actor_role: "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: null,
    entity_type: "raw_material_movement",
    entity_id: null,
    action: movementType,
    new_data: { raw_material_id: rawMaterialId, quantity_change: quantityChange, notes: notes || null },
  });

  revalidatePath("/admin/materia-prima");
}
