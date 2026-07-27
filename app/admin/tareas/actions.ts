"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { closeWorkshopNeedAction } from "@/app/admin/ally-actions";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { applyRawMaterialMovement } from "@/lib/raw-materials";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

const TASK_ACTION_FIELDS = `
  id, ally_id, aid_request_id, title, description, expected_output,
  urgency, status, admin_notes, ally_notes, assigned_at, due_date, completed_at,
  published_at, closed_at, created_at, updated_at, ally:allies(id, name, slug)
`;

function toNumberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function closeOwnTaskAction(formData: FormData): Promise<void> {
  const result = await closeWorkshopNeedAction(formData);
  if (result.error) throw new Error(result.error);
}

async function getTaskForAlly(userId: string, taskId: string) {
  const admin = createSupabaseAdminClient();
  const ally = await getWorkshopByUserId(userId);
  if (!ally) return null;

  const { data, error } = await admin
    .from("assigned_tasks")
    .select(TASK_ACTION_FIELDS)
    .eq("id", taskId)
    .eq("ally_id", ally.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return { task: data, ally };
}

async function getTaskForAdmin(taskId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("assigned_tasks")
    .select(TASK_ACTION_FIELDS)
    .eq("id", taskId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

async function hasLockedDelivery(taskId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ally_deliveries")
    .select("status")
    .eq("task_id", taskId)
    .in("status", ["recibida", "cancelada"])
    .limit(1);

  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

async function saveMaterialUsage({
  allyId,
  taskId,
  formData,
}: {
  allyId: string;
  taskId: string;
  formData: FormData;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data: assignments, error } = await admin
    .from("ally_raw_material_assignments")
    .select("id, quantity, used_quantity")
    .eq("ally_id", allyId)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  for (const assignment of assignments ?? []) {
    const value = toNumberOrNull(formData.get(`usedQuantity:${assignment.id}`));
    if (value === null) continue;
    if (value < 0) {
      throw new Error("La cantidad usada no puede ser negativa.");
    }
    if (assignment.quantity !== null && value > Number(assignment.quantity)) {
      throw new Error("La cantidad usada no puede superar la cantidad asignada.");
    }

    const nextStatus = value > 0 ? "usada" : "asignada";
    const { error: updateError } = await admin
      .from("ally_raw_material_assignments")
      .update({ used_quantity: value, status: nextStatus })
      .eq("id", assignment.id);

    if (updateError) throw new Error(updateError.message);
  }

}

export async function createAssignedTaskAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const allyId = String(formData.get("allyId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const expectedOutput = String(formData.get("expectedOutput") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();

  if (!allyId) throw new Error("Selecciona un aliado.");
  if (!title) throw new Error("El título de la tarea es obligatorio.");

  const { data: task, error } = await admin
    .from("assigned_tasks")
    .insert({
      ally_id: allyId,
      title,
      description: description || null,
      expected_output: expectedOutput || null,
      urgency: urgency || null,
      due_date: dueDate || null,
      status: "asignada",
      assigned_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logAuditEvent({
    actor_id: user.id,
    actor_role: "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: null,
    entity_type: "assigned_task",
    entity_id: task.id,
    action: "create",
    new_data: { ally_id: allyId, title, due_date: dueDate || null },
  });

  revalidatePath("/admin/tareas");
  revalidatePath("/admin/entregas");
}

export async function updateAssignedTaskAdminAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const taskId = String(formData.get("taskId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const expectedOutput = String(formData.get("expectedOutput") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!taskId) throw new Error("Tarea inválida.");
  if (!title) throw new Error("El título es obligatorio.");

  const validStatuses = ["pendiente", "publicada", "cubierta", "asignada", "en_progreso", "completada", "cerrada"];
  if (!validStatuses.includes(status)) throw new Error("Estado de tarea no válido.");

  const { error } = await admin
    .from("assigned_tasks")
    .update({
      title,
      description: description || null,
      expected_output: expectedOutput || null,
      urgency: urgency || null,
      due_date: dueDate || null,
      status,
      admin_notes: adminNotes || null,
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    actor_id: user.id,
    actor_role: "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: null,
    entity_type: "assigned_task",
    entity_id: taskId,
    action: "admin_update",
    new_data: { title, status, due_date: dueDate || null },
  });

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
  revalidatePath("/admin/entregas");
  revalidatePath("/admin/solicitudes");
}

export async function assignMaterialToTaskAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const taskId = String(formData.get("taskId") || "").trim();
  const rawMaterialId = String(formData.get("rawMaterialId") || "").trim();
  const quantity = toNumberOrNull(formData.get("quantity"));
  const notes = String(formData.get("notes") || "").trim();

  if (!taskId || !rawMaterialId) throw new Error("Selecciona la tarea y la materia prima.");
  if (quantity === null || quantity <= 0) throw new Error("La cantidad asignada debe ser mayor que cero.");

  const { data: task, error: taskError } = await admin
    .from("assigned_tasks")
    .select("id, ally_id, title")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task) throw new Error("La tarea no existe.");

  const { data: material, error: materialError } = await admin
    .from("raw_materials")
    .select("id, name, unit, stock_quantity, status")
    .eq("id", rawMaterialId)
    .maybeSingle();

  if (materialError) throw new Error(materialError.message);
  if (!material) throw new Error("La materia prima no existe.");
  if (material.status === "archivado") throw new Error("No puedes asignar materia prima archivada.");

  const currentStock = material.stock_quantity === null ? 0 : Number(material.stock_quantity);
  if (quantity > currentStock) {
    throw new Error("No hay suficiente stock para esta asignación.");
  }

  const { data: assignment, error } = await admin
    .from("ally_raw_material_assignments")
    .insert({
      ally_id: task.ally_id,
      raw_material_id: rawMaterialId,
      task_id: taskId,
      name_snapshot: material.name,
      quantity,
      unit: material.unit || null,
      status: "asignada",
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await applyRawMaterialMovement({
    client: admin,
    rawMaterialId,
    movementType: "asignacion_tarea",
    quantityChange: -quantity,
    notes: notes || `Asignación a tarea ${task.title}`,
    createdByUserId: user.id,
    relatedTaskId: taskId,
    relatedAssignmentId: assignment.id,
  });

  await logAuditEvent({
    actor_id: user.id,
    actor_role: "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: task.ally_id,
    entity_type: "ally_raw_material_assignment",
    entity_id: assignment.id,
    action: "assign",
    new_data: { task_id: taskId, raw_material_id: rawMaterialId, quantity },
  });

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/entregas");
}

export async function startAssignedTaskAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  if (user.app_metadata?.role !== "aliado") {
    throw new Error("Solo el aliado puede iniciar la tarea.");
  }

  const taskId = String(formData.get("taskId") || "").trim();
  if (!taskId) throw new Error("Tarea inválida.");

  const context = await getTaskForAlly(user.id, taskId);
  if (!context) throw new Error("No tienes acceso a esta tarea.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("assigned_tasks")
    .update({ status: "en_progreso" })
    .eq("id", taskId)
    .eq("ally_id", context.ally.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
}

export async function saveTaskMaterialUsageAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  if (user.app_metadata?.role !== "aliado") {
    throw new Error("Solo el aliado puede reportar uso de materia prima.");
  }

  const taskId = String(formData.get("taskId") || "").trim();
  const intent = String(formData.get("intent") || "save").trim();
  const allyNotes = String(formData.get("allyNotes") || "").trim();

  if (!taskId) throw new Error("Tarea inválida.");

  const context = await getTaskForAlly(user.id, taskId);
  if (!context) throw new Error("No tienes acceso a esta tarea.");
  if (await hasLockedDelivery(taskId)) {
    throw new Error("La entrega ya fue cerrada y no admite más cambios de consumo.");
  }

  if (!["asignada", "en_progreso", "completada"].includes(context.task.status)) {
    throw new Error("Esta tarea ya no admite cambios de consumo.");
  }

  await saveMaterialUsage({
    allyId: context.ally.id,
    taskId,
    formData,
  });

  const admin = createSupabaseAdminClient();
  const taskUpdates: Record<string, string | null> = {
    ally_notes: allyNotes || null,
  };

  if (intent === "complete") {
    taskUpdates.status = "completada";
    taskUpdates.completed_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("assigned_tasks")
    .update(taskUpdates)
    .eq("id", taskId)
    .eq("ally_id", context.ally.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/entregas");
}

export async function createTaskIncidentAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const taskId = String(formData.get("taskId") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!taskId) throw new Error("Tarea inválida.");
  if (!description) throw new Error("Describe la incidencia o bloqueo.");

  const task = role === "aliado" ? await getTaskForAlly(user.id, taskId) : await getTaskForAdmin(taskId);
  if (!task) throw new Error("No tienes acceso a esta tarea.");

  const { error } = await admin.from("task_incidents").insert({
    task_id: taskId,
    created_by_user_id: user.id,
    created_by_role: role === "aliado" ? "aliado" : "admin",
    description,
    status: "open",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
}

export async function resolveTaskIncidentAction(formData: FormData): Promise<void> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const incidentId = String(formData.get("incidentId") || "").trim();
  const taskId = String(formData.get("taskId") || "").trim();
  const resolutionNotes = String(formData.get("resolutionNotes") || "").trim();

  if (!incidentId || !taskId) throw new Error("Incidencia inválida.");

  const task = role === "aliado" ? await getTaskForAlly(user.id, taskId) : await getTaskForAdmin(taskId);
  if (!task) throw new Error("No tienes acceso a esta tarea.");

  const { error } = await admin
    .from("task_incidents")
    .update({
      status: "resolved",
      resolution_notes: resolutionNotes || null,
      resolved_by_user_id: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", incidentId)
    .eq("task_id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
}
