"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { generateWorkshopSlug } from "@/lib/workshops";

type Result = { success: true } | { success: false; error: string };

export async function submitWorkshopRegistration(formData: FormData): Promise<Result> {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "taller").trim();
  const responsibleName = String(formData.get("responsibleName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const municipality = String(formData.get("municipality") || "").trim();
  const publicLocation = String(formData.get("publicLocation") || "").trim();
  const whatTheyDo = String(formData.get("whatTheyDo") || "").trim();
  const initialPhotoPath = String(formData.get("initialPhotoPath") || "").trim();
  const publicNameAllowed = formData.get("publicNameAllowed") === "on";
  const publicLocationAllowed = formData.get("publicLocationAllowed") === "on";
  const publicInstagramAllowed = formData.get("publicInstagramAllowed") === "on";
  const publicWhatsappAllowed = formData.get("publicWhatsappAllowed") === "on";

  if (!name) return { success: false, error: "El nombre del aliado es obligatorio." };
  if (!["academia", "taller", "escuela", "otro"].includes(category)) return { success: false, error: "La categoría del aliado no es válida." };
  if (!responsibleName) return { success: false, error: "El nombre del responsable es obligatorio." };
  if (!email || !email.includes("@")) return { success: false, error: "Correo electrónico inválido." };
  if (!state) return { success: false, error: "El estado es obligatorio." };
  if (!city) return { success: false, error: "La ciudad es obligatoria." };
  if (!publicLocation) return { success: false, error: "La zona o referencia pública es obligatoria." };
  if (!whatTheyDo) return { success: false, error: "Indica qué hace o puede aportar el aliado." };

  if (!publicNameAllowed) {
    return { success: false, error: "Debes autorizar mostrar públicamente el nombre del aliado." };
  }

  const supabase = createSupabasePublicClient();
  const slug = await generateWorkshopSlug(name);

  const { error: insertError } = await supabase.from("allies").insert({
    name,
    category,
    slug,
    responsible_name: responsibleName,
    email,
    whatsapp: whatsapp || null,
    instagram: instagram || null,
    state,
    city,
    municipality: municipality || null,
    public_location: publicLocation,
    what_they_do: whatTheyDo,
    initial_photo_path: initialPhotoPath || null,
    public_name_allowed: publicNameAllowed,
    public_location_allowed: publicLocationAllowed,
    public_instagram_allowed: publicInstagramAllowed,
    public_whatsapp_allowed: publicWhatsappAllowed,
    status: "pendiente",
  });

  if (insertError) {
    return { success: false, error: "No pudimos registrar el aliado. Intenta nuevamente." };
  }

  revalidatePath("/admin/aliados");
  return { success: true };
}

export async function submitWorkshopHelpOffer(formData: FormData): Promise<Result> {
  const workshopId = String(formData.get("workshopId") || "").trim();
  const needId = String(formData.get("needId") || "").trim();
  const donorName = String(formData.get("donorName") || "").trim();
  const donorContact = String(formData.get("donorContact") || "").trim();
  const donorEmail = String(formData.get("donorEmail") || "").trim();
  const donorPhone = String(formData.get("donorPhone") || "").trim();
  const helpType = String(formData.get("helpType") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();
  const availability = String(formData.get("availability") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const location = String(formData.get("location") || "").trim();

  if (!donorName) return { success: false, error: "Tu nombre es obligatorio." };
  if (!donorContact) return { success: false, error: "El contacto es obligatorio." };
  if (!donorEmail || !donorEmail.includes("@")) return { success: false, error: "Correo electrónico inválido." };
  if (!helpType) return { success: false, error: "Selecciona el tipo de ayuda." };
  if (!description) return { success: false, error: "Describe cómo puedes ayudar." };
  if (!location) return { success: false, error: "La ubicación es obligatoria." };

  const supabase = createSupabasePublicClient();

  const { error } = await supabase.from("collaborator_offers").insert({
    ally_id: workshopId || null,
    need_id: needId || null,
    donor_name: donorName,
    donor_contact: donorContact,
    donor_email: donorEmail || null,
    donor_phone: donorPhone || null,
    help_type: helpType,
    description,
    quantity: quantity || null,
    availability: availability || null,
    location: location || null,
    status: "recibida",
  });

  if (error) {
    return { success: false, error: "No pudimos registrar tu oferta. Intenta nuevamente." };
  }

  revalidatePath("/admin/colaboradores");
  return { success: true };
}
