"use server";

import { revalidatePath } from "next/cache";

import { createSupabasePublicClient } from "@/lib/supabase/public";

type Result = { success: true } | { success: false; error: string };

export async function submitHelpRequest(formData: FormData): Promise<Result> {
  const fullName = String(formData.get("fullName") || "").trim();
  const organization = String(formData.get("organization") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const requesterType = String(formData.get("requesterType") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const deliveryAddress = String(formData.get("deliveryAddress") || "").trim();
  const productsRaw = String(formData.get("products") || "[]");
  const urgency = String(formData.get("urgency") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!fullName) return { success: false, error: "El nombre completo es obligatorio." };
  if (!phone) return { success: false, error: "El teléfono es obligatorio." };
  if (!email || !email.includes("@")) return { success: false, error: "Correo electrónico inválido." };
  if (!requesterType) return { success: false, error: "Selecciona el tipo de solicitante." };
  if (!state) return { success: false, error: "El estado es obligatorio." };
  if (!city) return { success: false, error: "La ciudad es obligatoria." };
  if (!deliveryAddress) return { success: false, error: "La dirección de entrega es obligatoria." };
  if (!urgency) return { success: false, error: "Selecciona el nivel de urgencia." };
  if (!description) return { success: false, error: "La descripción es obligatoria." };

  let products: { name: string; quantity: number; sizes: { name: string; quantity: number }[] }[];
  try {
    products = JSON.parse(productsRaw);
    if (!Array.isArray(products)) throw new Error();
  } catch {
    return { success: false, error: "Error al procesar los productos." };
  }

  const supabase = createSupabasePublicClient();

  const { error: insertError } = await supabase.from("help_requests").insert({
    full_name: fullName,
    organization: organization || null,
    phone,
    email,
    requester_type: requesterType,
    state,
    city,
    delivery_address: deliveryAddress,
    products,
    urgency,
    description,
    evidence_files: [],
    status: "pendiente",
  });

  if (insertError) {
    return { success: false, error: "No pudimos registrar tu solicitud. Intenta nuevamente." };
  }

  revalidatePath("/admin/talleres/solicitudes-ayuda");
  return { success: true };
}
