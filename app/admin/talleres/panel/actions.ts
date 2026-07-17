"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";
import { logAuditEvent } from "@/lib/audit";

type Result = { error?: string; success?: boolean };

async function verifyWorkshopAccess(user: { id: string; app_metadata?: Record<string, unknown> }, workshopId: string, admin: ReturnType<typeof createSupabaseAdminClient>) {
  const role = user.app_metadata?.role as string | undefined;
  if (role === "aliado") {
    const workshop = await getWorkshopByUserId(user.id);
    if (!workshop || workshop.id !== workshopId) return null;
    return workshop;
  }
  if (role === "admin" || role === "admin_talleres") {
    const { data } = await admin
      .from("user_workshops")
      .select("id")
      .eq("user_id", user.id)
      .eq("workshop_id", workshopId)
      .maybeSingle();
    if (!data) return null;
    const { data: workshop } = await admin.from("workshops").select("*").eq("id", workshopId).maybeSingle();
    return workshop;
  }
  return null;
}

export async function updateWorkshopProfileAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();

  const workshopId = String(formData.get("workshopId") || "").trim();
  if (!workshopId) return { error: "ID de taller no válido." };

  const workshop = await verifyWorkshopAccess(user, workshopId, admin);
  if (!workshop) return { error: "No tienes permiso para editar este aliado." };

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
  const publicNameAllowed = formData.get("publicNameAllowed") === "on";
  const publicLocationAllowed = formData.get("publicLocationAllowed") === "on";
  const publicInstagramAllowed = formData.get("publicInstagramAllowed") === "on";
  const publicWhatsappAllowed = formData.get("publicWhatsappAllowed") === "on";

  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (responsibleName) updates.responsible_name = responsibleName;
  updates.whatsapp = whatsapp || null;
  updates.instagram = instagram || null;
  if (state) updates.state = state;
  if (city) updates.city = city;
  updates.municipality = municipality || null;
  updates.public_location = publicLocation || null;
  updates.what_they_do = whatTheyDo || null;
  updates.description = description || null;
  updates.public_name_allowed = publicNameAllowed;
  updates.public_location_allowed = publicLocationAllowed;
  updates.public_instagram_allowed = publicInstagramAllowed;
  updates.public_whatsapp_allowed = publicWhatsappAllowed;

  const { error } = await admin.from("workshops").update(updates).eq("id", workshopId);
  if (error) return { error: error.message };

  const role = user.app_metadata?.role as string;
  await logAuditEvent({
    actor_id: user.id,
    actor_role: role,
    actor_email: user.email,
    context_type: role === "aliado" ? "aliado" : "platform",
    context_id: workshopId,
    entity_type: "workshop",
    entity_id: workshopId,
    action: "profile_update",
    new_data: updates,
  });

  revalidatePath("/admin/talleres/panel");
  revalidatePath("/ver-talleres");
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  return { success: true };
}

export async function createWorkshopNeedAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();

  const workshopId = String(formData.get("workshopId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requestedItems = String(formData.get("requestedItems") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();

  if (!workshopId) return { error: "ID de taller no válido." };
  if (!title) return { error: "El título de la necesidad es obligatorio." };

  const workshop = await verifyWorkshopAccess(user, workshopId, admin);
  if (!workshop) return { error: "No tienes permiso para crear necesidades para este aliado." };

  const { error } = await admin.from("workshop_needs").insert({
    workshop_id: workshopId,
    title,
    description: description || null,
    requested_items: requestedItems || null,
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
    context_id: workshopId,
    entity_type: "workshop_need",
    entity_id: null,
    action: "create",
    new_data: { workshop_id: workshopId, title },
  });

  revalidatePath("/admin/talleres/panel/necesidades");
  revalidatePath("/necesidades");
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  return { success: true };
}

export async function closeWorkshopNeedAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();

  const needId = String(formData.get("id") || "");
  const workshopId = String(formData.get("workshopId") || "").trim();

  if (!needId || !workshopId) return { error: "Solicitud inválida." };

  const workshop = await verifyWorkshopAccess(user, workshopId, admin);
  if (!workshop) return { error: "No tienes permiso para cerrar esta necesidad." };

  const { error } = await admin
    .from("workshop_needs")
    .update({ status: "cerrada", closed_at: new Date().toISOString() })
    .eq("id", needId);

  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/panel/necesidades");
  revalidatePath("/necesidades");
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  return { success: true };
}

export async function uploadWorkshopPhotoAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();

  const workshopId = String(formData.get("workshopId") || "").trim();
  const storagePath = String(formData.get("storagePath") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!workshopId) return { error: "ID de taller no válido." };
  if (!storagePath) return { error: "No se recibió la imagen." };

  const workshop = await verifyWorkshopAccess(user, workshopId, admin);
  if (!workshop) return { error: "No tienes permiso para subir fotos a este aliado." };

  const { error } = await admin.from("workshop_photos").insert({
    workshop_id: workshopId,
    storage_path: storagePath,
    title: title || null,
    description: description || null,
    uploaded_by: user.id,
    status: "pendiente",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/panel/fotos");
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  return { success: true };
}

export async function uploadWorkshopAvatarAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopUser();
  const admin = createSupabaseAdminClient();

  const workshopId = String(formData.get("workshopId") || "").trim();
  const storagePath = String(formData.get("storagePath") || "").trim();

  if (!workshopId) return { error: "ID de taller no válido." };

  const workshop = await verifyWorkshopAccess(user, workshopId, admin);
  if (!workshop) return { error: "No tienes permiso para cambiar el avatar de este aliado." };

  const { error } = await admin.from("workshops").update({ avatar_path: storagePath || null }).eq("id", workshopId);
  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/panel");
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  return { success: true };
}
