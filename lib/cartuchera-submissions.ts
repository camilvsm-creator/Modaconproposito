"use server";

import { revalidatePath } from "next/cache";

import { createSupabasePublicClient } from "@/lib/supabase/public";

type Result = { success: true } | { success: false; error: string };

export async function submitCartucheraDonation(
  formData: FormData,
): Promise<Result> {
  const donorName = String(formData.get("donorName") || "").trim();
  const donorEmail = String(formData.get("donorEmail") || "").trim();
  const donorPhone = String(formData.get("donorPhone") || "").trim();
  const helpType = String(formData.get("helpType") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim();

  if (!donorName) return { success: false, error: "Tu nombre es obligatorio." };
  if (!donorEmail || !donorEmail.includes("@"))
    return { success: false, error: "Correo electrónico inválido." };
  if (!helpType) return { success: false, error: "Selecciona el tipo de ayuda." };
  if (!description)
    return { success: false, error: "Contanos cómo querés ayudar." };

  const supabase = createSupabasePublicClient();

  const { error } = await supabase.from("cartuchera_donations").insert({
    donor_name: donorName,
    donor_email: donorEmail,
    donor_phone: donorPhone || null,
    help_type: helpType,
    description,
    quantity: quantity || null,
  });

  if (error) {
    return {
      success: false,
      error: "No pudimos registrar tu donación. Intenta nuevamente.",
    };
  }

  revalidatePath("/adopta-una-cartuchera");
  return { success: true };
}
