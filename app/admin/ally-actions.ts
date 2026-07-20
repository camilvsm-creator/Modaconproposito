"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit";
import { requireWorkshopUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

type Result = { error?: string; success?: boolean };

async function verifyAllyAccess(
  user: { id: string; app_metadata?: Record<string, unknown> },
  allyId: string,
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  const role = user.app_metadata?.role as string | undefined;

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    return ally?.id === allyId ? ally : null;
  }

  return null;
}

export async function updateWorkshopProfileAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const allyId = String(formData.get("workshopId") || "").trim();

  if (!allyId) return { error: "ID de aliado no válido." };

  const ally = await verifyAllyAccess(user, allyId, admin);
  if (!ally) return { error: "No tienes permiso para editar este aliado." };

  const name = String(formData.get("name") || "").trim();
  const responsibleName = String(formData.get("responsibleName") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const municipality = String(formData.get("municipality") || "").trim();
  const publicLocation = String(formData.get("publicLocation") || "").trim();
  const whatTheyDo = String(formData.get("whatTheyDo") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const updates: Record<string, unknown> = {
    whatsapp: whatsapp || null,
    instagram: instagram || null,
    municipality: municipality || null,
    public_location: publicLocation || null,
    what_they_do: whatTheyDo || null,
    description: description || null,
    public_name_allowed: formData.get("publicNameAllowed") === "on",
    public_location_allowed: formData.get("publicLocationAllowed") === "on",
    public_instagram_allowed: formData.get("publicInstagramAllowed") === "on",
    public_whatsapp_allowed: formData.get("publicWhatsappAllowed") === "on",
  };

  if (name) updates.name = name;
  if (responsibleName) updates.responsible_name = responsibleName;
  if (state) updates.state = state;
  if (city) updates.city = city;

  const { error } = await admin.from("allies").update(updates).eq("id", allyId);
  if (error) return { error: error.message };

  const role = user.app_metadata?.role as string;
  await logAuditEvent({
    actor_id: user.id,
    actor_role: role,
    actor_email: user.email,
    context_type: role === "aliado" ? "aliado" : "platform",
    context_id: allyId,
    entity_type: "ally",
    entity_id: allyId,
    action: "profile_update",
    new_data: updates,
  });

  revalidatePath("/admin/perfil");
  revalidatePath("/aliados");
  if (ally.slug) {
    revalidatePath(`/aliados/${ally.slug}`);
    revalidatePath(`/${ally.slug}`);
  }

  return { success: true };
}

export async function createWorkshopNeedAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const allyId = String(formData.get("workshopId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requestedItems = String(formData.get("requestedItems") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();

  if (!allyId) return { error: "ID de aliado no válido." };
  if (!title) return { error: "El título de la necesidad es obligatorio." };

  const ally = await verifyAllyAccess(user, allyId, admin);
  if (!ally) return { error: "No tienes permiso para crear tareas para este aliado." };

  const { error } = await admin.from("assigned_tasks").insert({
    ally_id: allyId,
    title,
    description: description || null,
    expected_output: requestedItems || null,
    urgency: urgency || null,
    status: "pendiente",
  });

  if (error) return { error: error.message };

  const role = user.app_metadata?.role as string;
  await logAuditEvent({
    actor_id: user.id,
    actor_role: role,
    actor_email: user.email,
    context_type: role === "aliado" ? "aliado" : "platform",
    context_id: allyId,
    entity_type: "assigned_task",
    entity_id: null,
    action: "create",
    new_data: { ally_id: allyId, title },
  });

  revalidatePath("/admin/tareas");
  revalidatePath("/necesidades");
  if (ally.slug) {
    revalidatePath(`/aliados/${ally.slug}`);
    revalidatePath(`/${ally.slug}`);
  }

  return { success: true };
}

export async function closeWorkshopNeedAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const taskId = String(formData.get("id") || "").trim();
  const allyId = String(formData.get("workshopId") || "").trim();

  if (!taskId || !allyId) return { error: "Solicitud inválida." };

  const ally = await verifyAllyAccess(user, allyId, admin);
  if (!ally) return { error: "No tienes permiso para cerrar esta tarea." };

  const { error } = await admin
    .from("assigned_tasks")
    .update({ status: "cerrada", closed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("ally_id", allyId);

  if (error) return { error: error.message };

  revalidatePath("/admin/tareas");
  revalidatePath("/necesidades");
  if (ally.slug) {
    revalidatePath(`/aliados/${ally.slug}`);
    revalidatePath(`/${ally.slug}`);
  }

  return { success: true };
}

export async function uploadWorkshopPhotoAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const allyId = String(formData.get("workshopId") || "").trim();
  const storagePath = String(formData.get("storagePath") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!allyId) return { error: "ID de aliado no válido." };
  if (!storagePath) return { error: "No se recibió la imagen." };

  const ally = await verifyAllyAccess(user, allyId, admin);
  if (!ally) return { error: "No tienes permiso para subir fotos a este aliado." };

  const { error } = await admin.from("ally_photos").insert({
    ally_id: allyId,
    storage_path: storagePath,
    title: title || null,
    description: description || null,
    uploaded_by: user.id,
    status: "pendiente",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/perfil");
  if (ally.slug) {
    revalidatePath(`/aliados/${ally.slug}`);
    revalidatePath(`/${ally.slug}`);
  }

  return { success: true };
}

export async function uploadWorkshopAvatarAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();
  const allyId = String(formData.get("workshopId") || "").trim();
  const storagePath = String(formData.get("storagePath") || "").trim();

  if (!allyId) return { error: "ID de aliado no válido." };

  const ally = await verifyAllyAccess(user, allyId, admin);
  if (!ally) return { error: "No tienes permiso para cambiar el avatar de este aliado." };

  const { error } = await admin.from("allies").update({ avatar_path: storagePath || null }).eq("id", allyId);
  if (error) return { error: error.message };

  revalidatePath("/admin/perfil");
  if (ally.slug) {
    revalidatePath(`/aliados/${ally.slug}`);
    revalidatePath(`/${ally.slug}`);
  }

  return { success: true };
}
