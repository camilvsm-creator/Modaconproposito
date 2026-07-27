"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { applyRawMaterialMovement } from "@/lib/raw-materials";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

function toNumberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createRawMaterialAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const unit = String(formData.get("unit") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const stockQuantity = toNumberOrNull(formData.get("stockQuantity"));
  let allyId = String(formData.get("allyId") || "").trim() || null;

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally) throw new Error("No se encontró el aliado vinculado.");
    allyId = ally.id;
  } else {
    await requireWorkshopAdminUser();
  }

  if (!name) throw new Error("El nombre es obligatorio.");
  if (stockQuantity !== null && stockQuantity < 0) {
    throw new Error("El stock no puede ser negativo.");
  }

  const status = (stockQuantity ?? 0) === 0 ? "agotado" : "disponible";
  const { data, error } = await admin
    .from("raw_materials")
    .insert({
      name,
      ally_id: allyId,
      category: category || null,
      unit: unit || null,
      description: description || null,
      notes: notes || null,
      stock_quantity: 0,
      status,
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
    actor_role: role ?? "admin",
    actor_email: user.email,
    context_type: role === "aliado" ? "aliado" : "platform",
    context_id: allyId,
    entity_type: "raw_material",
    entity_id: data.id,
    action: "create",
    new_data: { name, stock_quantity: stockQuantity, unit: unit || null },
  });

  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/tareas");
  revalidatePath("/admin/materia-prima");
}

export async function registerRawMaterialMovementAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const rawMaterialId = String(formData.get("rawMaterialId") || "").trim();
  const movementType = String(formData.get("movementType") || "").trim();
  const quantityValue = String(formData.get("quantity") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const allyId = String(formData.get("allyId") || "").trim() || null;

  if (!rawMaterialId || !movementType) throw new Error("Selecciona el material y el tipo de movimiento.");

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== allyId) throw new Error("No tienes permiso para mover este inventario.");
    const { data: material, error: materialError } = await admin
      .from("raw_materials")
      .select("id, ally_id")
      .eq("id", rawMaterialId)
      .maybeSingle();
    if (materialError) throw new Error(materialError.message);
    if (!material || material.ally_id !== ally.id) throw new Error("Solo puedes mover materia prima de tu inventario propio.");
  } else {
    await requireWorkshopAdminUser();
  }

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
    actor_role: role ?? "admin",
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

export async function assignOwnMaterialToTaskAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  if (user.app_metadata?.role !== "aliado") {
    throw new Error("Esta acción corresponde al inventario propio del aliado.");
  }

  const admin = createSupabaseAdminClient();
  const ally = await getWorkshopByUserId(user.id);
  const allyId = String(formData.get("allyId") || "").trim();
  const rawMaterialId = String(formData.get("rawMaterialId") || "").trim();
  const taskId = String(formData.get("taskId") || "").trim();
  const quantity = toNumberOrNull(formData.get("quantity"));
  const notes = String(formData.get("notes") || "").trim();

  if (!ally || ally.id !== allyId) throw new Error("No tienes permiso para asignar este inventario.");
  if (!rawMaterialId || !taskId || quantity === null || quantity <= 0) throw new Error("Selecciona la tarea, el material y una cantidad válida.");

  const [{ data: material, error: materialError }, { data: task, error: taskError }] = await Promise.all([
    admin.from("raw_materials").select("id, ally_id, name, unit, stock_quantity, status").eq("id", rawMaterialId).maybeSingle(),
    admin.from("assigned_tasks").select("id, ally_id, title").eq("id", taskId).maybeSingle(),
  ]);
  if (materialError) throw new Error(materialError.message);
  if (taskError) throw new Error(taskError.message);
  if (!material || material.ally_id !== ally.id) throw new Error("Solo puedes usar materiales de tu inventario propio.");
  if (!task || task.ally_id !== ally.id) throw new Error("Solo puedes asignar materiales a tus tareas.");
  if (quantity > Number(material.stock_quantity ?? 0)) throw new Error("No hay suficiente stock para esta asignación.");

  const { data: assignment, error } = await admin.from("ally_raw_material_assignments").insert({
    ally_id: ally.id,
    raw_material_id: material.id,
    task_id: task.id,
    name_snapshot: material.name,
    quantity,
    unit: material.unit || null,
    status: "asignada",
    notes: notes || null,
  }).select("id").single();
  if (error) throw new Error(error.message);

  await applyRawMaterialMovement({
    client: admin,
    rawMaterialId: material.id,
    movementType: "asignacion_tarea",
    quantityChange: -quantity,
    notes: notes || `Asignación a tarea ${task.title}`,
    createdByUserId: user.id,
    relatedTaskId: task.id,
    relatedAssignmentId: assignment.id,
  });

  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/tareas");
}

export async function getOwnTaskOptionsAction() {
  const user = await requireWorkshopUser();
  const ally = await getWorkshopByUserId(user.id);
  if (!ally) throw new Error("No se encontró el aliado vinculado.");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("assigned_tasks")
    .select("id, title, status")
    .eq("ally_id", ally.id)
    .not("status", "in", "(completada,cerrada)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
