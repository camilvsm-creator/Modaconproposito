"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { sendWorkshopActivationEmail } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createWorkshopActivationToken,
  getAdminWorkshopById,
} from "@/lib/workshops";

type Result = { error?: string; activationLink?: string | null };

export async function updateWorkshopStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["pendiente", "activo", "pausado", "rechazado"].includes(status)) {
    return { error: "Solicitud inválida." };
  }

  const updates: Record<string, string | null> = { status };
  if (status === "rechazado") {
    updates.rejected_at = new Date().toISOString();
  }

  const { error } = await admin.from("workshops").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const workshop = await getAdminWorkshopById(id);
  revalidatePath("/admin/talleres");
  revalidatePath(`/admin/talleres/${id}`);
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  revalidatePath("/ver-talleres");
  return {};
}

export async function approveWorkshopAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");

  if (!id) return { error: "ID de taller no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Taller no encontrado." };

  const { error } = await admin
    .from("workshops")
    .update({
      status: "approved_pending_activation",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { activationLink } = await createWorkshopActivationToken(id, user.id);

  revalidatePath("/admin/talleres");
  revalidatePath(`/admin/talleres/${id}`);
  return { activationLink };
}

export async function sendWorkshopActivationEmailAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();

  const workshopId = String(formData.get("workshopId") || "");
  const activationLink = String(formData.get("activationLink") || "");

  if (!workshopId || !activationLink) {
    return { error: "Falta el ID del taller o el link de activación." };
  }

  const workshop = await getAdminWorkshopById(workshopId);
  if (!workshop) return { error: "Taller no encontrado." };

  if (!workshop.email) {
    return { error: "Este taller no tiene correo electrónico registrado." };
  }

  const { error } = await sendWorkshopActivationEmail(
    workshop.email,
    workshop.responsible_name,
    activationLink,
  );

  if (error) return { error: `Error al enviar el correo: ${error}` };

  revalidatePath(`/admin/talleres/${workshopId}`);
  return {};
}

export async function generateWorkshopActivationLinkAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const workshopId = String(formData.get("workshopId") || "");

  if (!workshopId) return { error: "ID de taller no válido.", activationLink: null };

  const workshop = await getAdminWorkshopById(workshopId);
  if (!workshop || workshop.status === "rechazado") {
    return { error: "No puedes generar un link para este taller.", activationLink: null };
  }

  const { activationLink } = await createWorkshopActivationToken(workshopId, user.id);

  revalidatePath(`/admin/talleres/${workshopId}`);
  return { activationLink };
}

export async function updateWorkshopAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!id) return { error: "ID de taller no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Taller no encontrado." };

  const updates: Record<string, unknown> = {};

  const name = String(formData.get("name") || "").trim();
  const responsibleName = String(formData.get("responsibleName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const municipality = String(formData.get("municipality") || "").trim();
  const publicLocation = String(formData.get("publicLocation") || "").trim();
  const whatTheyDo = String(formData.get("whatTheyDo") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (name) updates.name = name;
  if (responsibleName) updates.responsible_name = responsibleName;
  if (email) updates.email = email;
  updates.phone = phone || null;
  updates.whatsapp = whatsapp || null;
  updates.instagram = instagram || null;
  if (state) updates.state = state;
  if (city) updates.city = city;
  updates.municipality = municipality || null;
  updates.public_location = publicLocation || null;
  updates.what_they_do = whatTheyDo || null;
  updates.description = description || null;
  updates.public_name_allowed = formData.get("publicNameAllowed") === "on";
  updates.public_location_allowed = formData.get("publicLocationAllowed") === "on";
  updates.public_instagram_allowed = formData.get("publicInstagramAllowed") === "on";
  updates.public_whatsapp_allowed = formData.get("publicWhatsappAllowed") === "on";
  updates.admin_notes = adminNotes || null;

  if (Object.keys(updates).length === 0) return { error: "No hay campos para actualizar." };

  const { error } = await admin.from("workshops").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/talleres");
  revalidatePath(`/admin/talleres/${id}`);
  if (workshop.slug) revalidatePath(`/${workshop.slug}`);
  revalidatePath("/ver-talleres");
  return {};
}

export async function updateNeedStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["pendiente", "publicada", "cubierta", "cerrada"].includes(status)) {
    return { error: "Solicitud inválida." };
  }

  const updates: Record<string, string | null> = { status };
  if (status === "publicada") updates.published_at = new Date().toISOString();
  if (status === "cerrada") updates.closed_at = new Date().toISOString();

  const { error } = await admin.from("workshop_needs").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const needWorkshopId = (await admin.from("workshop_needs").select("workshop_id").eq("id", id).maybeSingle()).data?.workshop_id;
  const needWorkshop = needWorkshopId ? await getAdminWorkshopById(needWorkshopId) : null;
  revalidatePath("/admin/talleres/necesidades");
  revalidatePath("/admin/talleres");
  revalidatePath("/necesidades");
  if (needWorkshop?.slug) revalidatePath(`/${needWorkshop.slug}`);
  return {};
}

export async function updateNeedAdminNotesAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!id) return { error: "ID de necesidad no válido." };

  const { error } = await admin.from("workshop_needs").update({ admin_notes: adminNotes || null }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/necesidades");
  return {};
}

export async function updatePhotoStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["aprobada", "rechazada"].includes(status)) {
    return { error: "Solicitud inválida." };
  }

  const { error } = await admin
    .from("workshop_photos")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  const photoWorkshopId = (await admin.from("workshop_photos").select("workshop_id").eq("id", id).maybeSingle()).data?.workshop_id;
  const photoWorkshop = photoWorkshopId ? await getAdminWorkshopById(photoWorkshopId) : null;
  revalidatePath("/admin/talleres/fotos");
  if (photoWorkshop?.slug) revalidatePath(`/${photoWorkshop.slug}`);
  return {};
}

export async function updateHelpOfferStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!id || !["recibida", "gestionada", "cerrada"].includes(status)) {
    return { error: "Solicitud inválida." };
  }

  const updates: Record<string, string | null> = { status };
  if (adminNotes) updates.admin_notes = adminNotes;

  const { error } = await admin.from("workshop_help_offers").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const offerWorkshopId = (await admin.from("workshop_help_offers").select("workshop_id").eq("id", id).maybeSingle()).data?.workshop_id;
  const offerWorkshop = offerWorkshopId ? await getAdminWorkshopById(offerWorkshopId) : null;
  revalidatePath("/admin/talleres/ofertas");
  if (offerWorkshop?.slug) revalidatePath(`/${offerWorkshop.slug}`);
  return {};
}
