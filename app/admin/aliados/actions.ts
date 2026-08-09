"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { sendWorkshopActivationEmail } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createWorkshopActivationToken,
  generateWorkshopSlug,
  getAdminWorkshopById,
} from "@/lib/workshops";

type Result = { error?: string; activationLink?: string | null; allyId?: string; emailSent?: boolean };

async function sendGeneratedAccessEmail(
  workshop: { email: string | null; responsible_name: string | null; name: string },
  activationLink: string,
): Promise<{ error: string | null; emailSent: boolean }> {
  if (!workshop.email) return { error: null, emailSent: false };

  try {
    const { error } = await sendWorkshopActivationEmail(
      workshop.email,
      workshop.responsible_name ?? workshop.name,
      activationLink,
      workshop.name,
    );

    return error
      ? { error: `No se pudo enviar el correo de acceso: ${error}`, emailSent: false }
      : { error: null, emailSent: true };
  } catch (error) {
    console.error("Error sending generated ally access email:", error);
    return { error: "No se pudo enviar el correo de acceso. El enlace sigue disponible para copiar.", emailSent: false };
  }
}

export async function updateWorkshopStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["pendiente", "activo", "pausado", "rechazado", "desactivado"].includes(status)) {
    return { error: "Solicitud inválida." };
  }

  const updates: Record<string, string | null> = { status };
  if (status === "rechazado") {
    updates.rejected_at = new Date().toISOString();
  }

  const { error } = await admin.from("allies").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const workshop = await getAdminWorkshopById(id);
  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${id}`);
  revalidatePath(`/admin/aliados/${id}`);
  if (workshop?.slug) revalidatePath(`/${workshop.slug}`);
  if (workshop?.slug) revalidatePath(`/aliados/${workshop.slug}`);
  revalidatePath("/aliados");
  return {};
}

export async function approveWorkshopAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");

  if (!id) return { error: "ID de aliado no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Aliado no encontrado." };

  const { error } = await admin
    .from("allies")
    .update({
      status: "approved_pending_activation",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { activationLink } = await createWorkshopActivationToken(id, user.id);
  const emailResult = await sendGeneratedAccessEmail(workshop, activationLink);

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${id}`);
  revalidatePath(`/admin/aliados/${id}`);
  if (emailResult.error) return { error: emailResult.error, activationLink, emailSent: false };
  return { activationLink, emailSent: emailResult.emailSent };
}

export async function sendWorkshopActivationEmailAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();

  const workshopId = String(formData.get("workshopId") || "");
  const activationLink = String(formData.get("activationLink") || "");

  if (!workshopId || !activationLink) {
    return { error: "Falta el ID del aliado o el link de activación." };
  }

  const workshop = await getAdminWorkshopById(workshopId);
  if (!workshop) return { error: "Aliado no encontrado." };

  if (!workshop.email) {
    return { error: "Este aliado no tiene correo electrónico registrado." };
  }

  const { error } = await sendWorkshopActivationEmail(
    workshop.email,
    workshop.responsible_name ?? workshop.name,
    activationLink,
    workshop.name,
  );

  if (error) return { error: `Error al enviar el correo: ${error}` };

  revalidatePath(`/admin/aliados/${workshopId}`);
  revalidatePath(`/admin/aliados/${workshopId}`);
  return {};
}

export async function generateWorkshopActivationLinkAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const workshopId = String(formData.get("workshopId") || "");

  if (!workshopId) return { error: "ID de aliado no válido.", activationLink: null };

  const workshop = await getAdminWorkshopById(workshopId);
  if (!workshop) return { error: "Aliado no encontrado.", activationLink: null };

  if (workshop.user_id) {
    return { error: "Este aliado ya tiene un usuario vinculado.", activationLink: null };
  }

  const blockedStatuses = ["rechazado", "desactivado"];
  if (blockedStatuses.includes(workshop.status)) {
    return { error: "No puedes generar un link para un aliado en este estado.", activationLink: null };
  }

  if (workshop.status === "pendiente") {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("allies").update({
      status: "approved_pending_activation",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    }).eq("id", workshopId);
    if (error) return { error: error.message, activationLink: null };
  }

  const { activationLink } = await createWorkshopActivationToken(workshopId, user.id);
  const emailResult = await sendGeneratedAccessEmail(workshop, activationLink);

  revalidatePath(`/admin/aliados/${workshopId}`);
  revalidatePath(`/admin/aliados/${workshopId}`);
  if (emailResult.error) return { error: emailResult.error, activationLink, emailSent: false };
  return { activationLink, emailSent: emailResult.emailSent };
}

export async function generateAccessLinkAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const workshopId = String(formData.get("workshopId") || "");

  if (!workshopId) return { error: "ID de aliado no válido.", activationLink: null };

  const workshop = await getAdminWorkshopById(workshopId);
  if (!workshop) return { error: "Aliado no encontrado.", activationLink: null };

  if (workshop.user_id) {
    return { error: "Este aliado ya tiene un usuario vinculado.", activationLink: null };
  }

  const blockedStatuses = ["rechazado", "desactivado"];
  if (blockedStatuses.includes(workshop.status)) {
    return { error: "No puedes generar acceso para un aliado en este estado.", activationLink: null };
  }

  if (workshop.status === "pendiente") {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("allies").update({
      status: "approved_pending_activation",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    }).eq("id", workshopId);
    if (error) return { error: error.message, activationLink: null };
  }

  const { activationLink } = await createWorkshopActivationToken(workshopId, user.id);
  const emailResult = await sendGeneratedAccessEmail(workshop, activationLink);

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${workshopId}`);
  revalidatePath(`/admin/aliados/${workshopId}`);
  if (emailResult.error) return { error: emailResult.error, activationLink, emailSent: false };
  return { activationLink, emailSent: emailResult.emailSent };
}

export async function updateWorkshopAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!id) return { error: "ID de aliado no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Aliado no encontrado." };

  const updates: Record<string, unknown> = {};

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "taller").trim();
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

  if (!name) return { error: "El nombre del aliado es obligatorio." };
  if (category && !["academia", "taller", "escuela", "otro"].includes(category)) return { error: "La categoría del aliado no es válida." };
  if (!responsibleName) return { error: "El nombre del responsable es obligatorio." };
  if (!email || !email.includes("@")) return { error: "El correo electrónico no es válido." };
  if (!state) return { error: "El estado es obligatorio." };
  if (!city) return { error: "La ciudad es obligatoria." };
  if (!whatTheyDo) return { error: "El campo 'Qué hace o aporta' es obligatorio." };

  if (name) updates.name = name;
  if (category) updates.category = category;
  if (responsibleName) updates.responsible_name = responsibleName;
  if (email) updates.email = email;
  updates.phone = phone || null;
  updates.whatsapp = whatsapp || null;
  updates.instagram = instagram || null;
  if (state) updates.state = state;
  if (city) updates.city = city;
  updates.municipality = municipality || null;
  updates.public_location = publicLocation || null;
  updates.what_they_do = whatTheyDo;
  updates.description = description || null;
  updates.public_name_allowed = formData.get("publicNameAllowed") === "on";
  updates.public_location_allowed = formData.get("publicLocationAllowed") === "on";
  updates.public_instagram_allowed = formData.get("publicInstagramAllowed") === "on";
  updates.public_whatsapp_allowed = formData.get("publicWhatsappAllowed") === "on";
  updates.admin_notes = adminNotes || null;

  if (Object.keys(updates).length === 0) return { error: "No hay campos para actualizar." };

  const { error } = await admin.from("allies").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${id}`);
  revalidatePath(`/admin/aliados/${id}`);
  if (workshop.slug) revalidatePath(`/${workshop.slug}`);
  if (workshop.slug) revalidatePath(`/aliados/${workshop.slug}`);
  revalidatePath("/aliados");
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

  const { error } = await admin.from("assigned_tasks").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const needWorkshopId = (await admin.from("assigned_tasks").select("ally_id").eq("id", id).maybeSingle()).data?.ally_id;
  const needWorkshop = needWorkshopId ? await getAdminWorkshopById(needWorkshopId) : null;
  revalidatePath("/admin/tareas");
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

  const { error } = await admin.from("assigned_tasks").update({ admin_notes: adminNotes || null }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/tareas");
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
    .from("ally_photos")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  const photoWorkshopId = (await admin.from("ally_photos").select("ally_id").eq("id", id).maybeSingle()).data?.ally_id;
  const photoWorkshop = photoWorkshopId ? await getAdminWorkshopById(photoWorkshopId) : null;
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

  const { error } = await admin.from("collaborator_offers").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const offerWorkshopId = (await admin.from("collaborator_offers").select("ally_id").eq("id", id).maybeSingle()).data?.ally_id;
  const offerWorkshop = offerWorkshopId ? await getAdminWorkshopById(offerWorkshopId) : null;
  revalidatePath("/admin/colaboradores");
  if (offerWorkshop?.slug) revalidatePath(`/${offerWorkshop.slug}`);
  return {};
}

export async function deactivateWorkshopAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  if (!id) return { error: "ID de aliado no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Aliado no encontrado." };

  const { error } = await admin
    .from("allies")
    .update({ status: "desactivado" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${id}`);
  revalidatePath(`/admin/aliados/${id}`);
  if (workshop.slug) revalidatePath(`/${workshop.slug}`);
  if (workshop.slug) revalidatePath(`/aliados/${workshop.slug}`);
  revalidatePath("/aliados");
  return {};
}

export async function reactivateWorkshopAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  if (!id) return { error: "ID de aliado no válido." };

  const workshop = await getAdminWorkshopById(id);
  if (!workshop) return { error: "Aliado no encontrado." };

  const { error } = await admin
    .from("allies")
    .update({ status: "activo" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath(`/admin/aliados/${id}`);
  revalidatePath(`/admin/aliados/${id}`);
  if (workshop.slug) revalidatePath(`/${workshop.slug}`);
  if (workshop.slug) revalidatePath(`/aliados/${workshop.slug}`);
  revalidatePath("/aliados");
  return {};
}

export async function deleteWorkshopAction(formData: FormData): Promise<Result> {
  return deactivateWorkshopAction(formData);
}

export async function createWorkshopAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "taller").trim();
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
  const publicNameAllowed = formData.get("publicNameAllowed") === "on";

  if (!name) return { error: "El nombre del aliado es obligatorio." };
  if (!["academia", "taller", "escuela", "otro"].includes(category)) return { error: "La categoría del aliado no es válida." };
  if (!responsibleName) return { error: "El nombre del responsable es obligatorio." };
  if (!email || !email.includes("@")) return { error: "El correo electrónico no es válido." };
  if (!state) return { error: "El estado es obligatorio." };
  if (!city) return { error: "La ciudad es obligatoria." };
  if (!publicLocation) return { error: "La ubicación pública es obligatoria." };
  if (!whatTheyDo) return { error: "El campo 'Qué hacen' es obligatorio." };

  const slug = await generateWorkshopSlug(name);

  const { data: workshop, error: insertError } = await admin
    .from("allies")
    .insert({
      name,
      category,
      slug,
      responsible_name: responsibleName,
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      state,
      city,
      municipality: municipality || null,
      public_location: publicLocation,
      what_they_do: whatTheyDo,
      description: description || null,
      public_name_allowed: publicNameAllowed,
      public_location_allowed: formData.get("publicLocationAllowed") === "on",
      public_instagram_allowed: formData.get("publicInstagramAllowed") === "on",
      public_whatsapp_allowed: formData.get("publicWhatsappAllowed") === "on",
      status: "approved_pending_activation",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };
  if (!workshop) return { error: "Error al crear el aliado." };

  const { activationLink } = await createWorkshopActivationToken(workshop.id, user.id);

  const emailResult = await sendGeneratedAccessEmail(
    { email, responsible_name: responsibleName, name },
    activationLink,
  );

  if (emailResult.error) {
    revalidatePath("/admin/aliados");
    revalidatePath("/admin/aliados");
    return { error: `Aliado creado, pero no se pudo enviar el correo: ${emailResult.error}`, activationLink, allyId: workshop.id, emailSent: false };
  }

  revalidatePath("/admin/aliados");
  revalidatePath("/admin/aliados");
  revalidatePath("/aliados");
  return { activationLink, allyId: workshop.id, emailSent: emailResult.emailSent };
}

export async function getAllyOptionsAction(): Promise<Array<{ id: string; name: string }>> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("allies")
    .select("id, name")
    .in("status", ["activo", "pausado", "approved_pending_activation"])
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
