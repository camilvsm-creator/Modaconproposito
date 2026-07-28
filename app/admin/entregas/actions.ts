"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireOperationsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { getRequesterByUserId } from "@/lib/requesters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

async function syncTaskAndRequestClosure(admin: ReturnType<typeof createSupabaseAdminClient>, taskId: string, aidRequestId?: string | null) {
  const { data: activeDeliveries, error: activeDeliveriesError } = await admin
    .from("ally_deliveries")
    .select("id")
    .eq("task_id", taskId)
    .in("status", ["pendiente", "entregada"])
    .limit(1);

  if (activeDeliveriesError) throw new Error(activeDeliveriesError.message);

  const { data: receivedDeliveries, error: receivedDeliveriesError } = await admin
    .from("ally_deliveries")
    .select("id")
    .eq("task_id", taskId)
    .eq("status", "recibida")
    .limit(1);

  if (receivedDeliveriesError) throw new Error(receivedDeliveriesError.message);

  const shouldCloseTask = (activeDeliveries ?? []).length === 0 && (receivedDeliveries ?? []).length > 0;
  const nextTaskStatus = shouldCloseTask ? "cerrada" : "completada";

  const { error: taskUpdateError } = await admin
    .from("assigned_tasks")
    .update({ status: nextTaskStatus })
    .eq("id", taskId);

  if (taskUpdateError) throw new Error(taskUpdateError.message);

  if (!aidRequestId) return;

  const { data: remainingTasks, error: remainingTasksError } = await admin
    .from("assigned_tasks")
    .select("id")
    .eq("aid_request_id", aidRequestId)
    .neq("status", "cerrada")
    .limit(1);

  if (remainingTasksError) throw new Error(remainingTasksError.message);

  const nextRequestStatus = (remainingTasks ?? []).length === 0 ? "cerrada" : "convertida";
  const { error: requestUpdateError } = await admin
    .from("aid_requests")
    .update({ status: nextRequestStatus })
    .eq("id", aidRequestId);

  if (requestUpdateError) throw new Error(requestUpdateError.message);
}

export async function createDeliveryAction(formData: FormData): Promise<{ success: true; deliveryId: string }> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const taskId = String(formData.get("taskId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();
  const scheduledFor = String(formData.get("scheduledFor") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!taskId) throw new Error("Selecciona una tarea completada.");

  const { data: task, error: taskError } = await admin
    .from("assigned_tasks")
    .select("id, ally_id, aid_request_id, title, description, expected_output, status")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task) throw new Error("La tarea no existe.");
  if (!["completada", "cerrada"].includes(task.status)) throw new Error("La tarea debe estar completada para crear una entrega.");

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== task.ally_id) throw new Error("No tienes acceso a esta tarea.");
  } else {
    await requireWorkshopAdminUser();
  }

  const { data: delivery, error } = await admin
    .from("ally_deliveries")
    .insert({
      ally_id: task.ally_id,
      task_id: taskId,
      title: title || task.title,
      description: description || task.description || null,
      quantity: quantity || task.expected_output || null,
      scheduled_for: scheduledFor || null,
      notes: notes || null,
      status: "pendiente",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logAuditEvent({
    actor_id: user.id,
    actor_role: role ?? "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: task.ally_id,
    entity_type: "ally_delivery",
    entity_id: delivery.id,
    action: "create",
    new_data: { task_id: taskId, title: title || task.title, scheduled_for: scheduledFor || null },
  });

  await syncTaskAndRequestClosure(admin, taskId, task.aid_request_id ?? null);

  revalidatePath("/admin/entregas");
  revalidatePath("/admin/tareas");
  revalidatePath(`/admin/tareas/${taskId}`);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ayudas");

  return { success: true, deliveryId: delivery.id };
}

export async function getDeliveryTaskOptionsAction(allyId?: string): Promise<Array<{ id: string; title: string; ally?: { id: string; name: string } | null }>> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;
  let targetAllyId = allyId || null;

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally) throw new Error("No se encontró el aliado vinculado.");
    targetAllyId = ally.id;
  } else {
    await requireWorkshopAdminUser();
  }

  let query = admin
    .from("assigned_tasks")
    .select("id, title, status, ally:allies(id, name)")
    .in("status", ["completada", "cerrada"])
    .order("created_at", { ascending: false });
  if (targetAllyId) query = query.eq("ally_id", targetAllyId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    ally: Array.isArray(task.ally) ? task.ally[0] ?? null : task.ally ?? null,
  }));
}

export async function updateDeliveryLogisticsAction(formData: FormData): Promise<void> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const deliveryId = String(formData.get("deliveryId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();
  const scheduledFor = String(formData.get("scheduledFor") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!deliveryId) throw new Error("Entrega inválida.");
  if (!title) throw new Error("El título de la entrega es obligatorio.");

  const { data: delivery, error: deliveryError } = await admin
    .from("ally_deliveries")
    .select("id, ally_id, task_id, status, ally:allies(id, user_id)")
    .eq("id", deliveryId)
    .maybeSingle();

  if (deliveryError) throw new Error(deliveryError.message);
  if (!delivery) throw new Error("La entrega no existe.");
  if (["recibida", "cancelada"].includes(delivery.status)) {
    throw new Error("No puedes editar una entrega cerrada o cancelada.");
  }

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== delivery.ally_id) throw new Error("No tienes acceso a esta entrega.");
  } else {
    await requireWorkshopAdminUser();
  }

  const { error } = await admin
    .from("ally_deliveries")
    .update({
      title,
      description: description || null,
      quantity: quantity || null,
      scheduled_for: scheduledFor || null,
      notes: notes || null,
    })
    .eq("id", deliveryId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    actor_id: user.id,
    actor_role: role ?? "admin",
    actor_email: user.email,
    context_type: "platform",
    context_id: null,
    entity_type: "ally_delivery",
    entity_id: deliveryId,
    action: "update_logistics",
    new_data: { title, quantity: quantity || null, scheduled_for: scheduledFor || null },
  });

  revalidatePath("/admin/entregas");
  revalidatePath("/admin/tareas");
  if (delivery.task_id) revalidatePath(`/admin/tareas/${delivery.task_id}`);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ayudas");
}

export async function updateDeliveryStatusAction(formData: FormData): Promise<void> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();

  const deliveryId = String(formData.get("deliveryId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const receivedBy = String(formData.get("receivedBy") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!deliveryId || !status) throw new Error("Solicitud inválida.");

  const { data: delivery, error: deliveryError } = await admin
    .from("ally_deliveries")
    .select("id, ally_id, task_id, status, notes, ally:allies(id, user_id, slug), task:assigned_tasks(id, aid_request_id)")
    .eq("id", deliveryId)
    .maybeSingle();

  if (deliveryError) throw new Error(deliveryError.message);
  if (!delivery) throw new Error("La entrega no existe.");
  const deliveryTask = Array.isArray(delivery.task) ? delivery.task[0] ?? null : delivery.task ?? null;

  const role = user.app_metadata?.role as string | undefined;
  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== delivery.ally_id) {
      throw new Error("No tienes acceso a esta entrega.");
    }

    if (!["pendiente", "entregada", "cancelada"].includes(status)) {
      throw new Error("El aliado solo puede gestionar estados de envío de su entrega.");
    }
  } else if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester) throw new Error("Tu cuenta no está vinculada a un solicitante.");
    if (status !== "recibida") {
      throw new Error("El solicitante solo puede confirmar la recepción de la entrega.");
    }
    if (!deliveryTask?.aid_request_id) {
      throw new Error("Esta entrega no está vinculada a una solicitud de ayuda.");
    }

    const { data: request, error: requestError } = await admin
      .from("aid_requests")
      .select("id, requester_id")
      .eq("id", deliveryTask.aid_request_id)
      .maybeSingle();

    if (requestError) throw new Error(requestError.message);
    if (!request || request.requester_id !== requester.id) {
      throw new Error("No tienes acceso a esta entrega.");
    }
  } else {
    await requireWorkshopAdminUser();
    if (!["recibida", "cancelada", "pendiente"].includes(status)) {
      throw new Error("Estado de entrega no permitido.");
    }
  }

  const updates: Record<string, string | null> = {
    status,
    notes: notes || delivery.notes || null,
  };

  if (status === "entregada") {
    updates.delivered_at = new Date().toISOString();
  }

  if (status === "pendiente") {
    updates.delivered_at = null;
    updates.received_at = null;
    updates.received_by = null;
  }

  if (status === "recibida") {
    updates.received_by = receivedBy || (role === "solicitante" ? user.email || "Solicitante" : "Promoda");
    updates.received_at = new Date().toISOString();
  }

  const { error } = await admin.from("ally_deliveries").update(updates).eq("id", deliveryId);
  if (error) throw new Error(error.message);

  if (["recibida", "cancelada", "pendiente"].includes(status) && delivery.task_id) {
    await syncTaskAndRequestClosure(admin, delivery.task_id, deliveryTask?.aid_request_id);
  }

  revalidatePath("/admin/entregas");
  revalidatePath("/admin/tareas");
  if (delivery.task_id) revalidatePath(`/admin/tareas/${delivery.task_id}`);
  revalidatePath("/admin/materia-prima");
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ayudas");
}
