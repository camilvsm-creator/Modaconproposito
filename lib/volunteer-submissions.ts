"use server";

import { revalidatePath } from "next/cache";

import { createSupabasePublicClient } from "@/lib/supabase/public";

type Result = { success: true } | { success: false; error: string };

export async function submitVolunteerRegistration(
  formData: FormData,
): Promise<Result> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const municipality = String(formData.get("municipality") || "").trim();
  const experienceArea = String(formData.get("experienceArea") || "").trim();
  const availability = String(formData.get("availability") || "").trim();
  const experienceDescription = String(formData.get("experienceDescription") || "").trim();
  const howDidYouFindOut = String(formData.get("howDidYouFindOut") || "").trim();

  if (!fullName) return { success: false, error: "Tu nombre es obligatorio." };
  if (!email || !email.includes("@"))
    return { success: false, error: "Correo electrónico inválido." };
  if (!phone) return { success: false, error: "El teléfono es obligatorio." };
  if (!state) return { success: false, error: "El estado es obligatorio." };
  if (!city) return { success: false, error: "La ciudad es obligatoria." };
  if (!experienceArea)
    return { success: false, error: "Selecciona tu área de experiencia." };
  if (!availability)
    return { success: false, error: "Selecciona tu disponibilidad." };
  if (!experienceDescription)
    return { success: false, error: "Cuéntanos sobre tu experiencia." };

  const supabase = createSupabasePublicClient();

  const { error } = await supabase.from("volunteers").insert({
    name: fullName,
    email,
    phone,
    state,
    city,
    skills: experienceArea,
    availability,
    notes: [
      municipality ? `Municipio: ${municipality}` : null,
      whatsapp ? `WhatsApp: ${whatsapp}` : null,
      experienceDescription ? `Experiencia: ${experienceDescription}` : null,
      howDidYouFindOut ? `Cómo se enteró: ${howDidYouFindOut}` : null,
    ].filter(Boolean).join("\n\n") || null,
    status: "postulado",
  });

  if (error) {
    return {
      success: false,
      error: "No pudimos registrar tu postulación. Intenta nuevamente.",
    };
  }

  revalidatePath("/voluntarios");
  return { success: true };
}
