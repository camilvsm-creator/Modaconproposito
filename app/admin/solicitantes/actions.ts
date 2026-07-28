"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateAidRequesterActivationToken } from "@/lib/requesters";

type Result = { error?: string; activationLink?: string | null };

function revalidateRequesterModules() {
  revalidatePath("/admin/solicitantes");
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ayudas");
}

export async function createAidRequesterAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "otro").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) throw new Error("El nombre del solicitante es obligatorio.");
  if (!contactName) throw new Error("La persona responsable es obligatoria.");

  const { error } = await admin.from("aid_requesters").insert({
    name,
    type: type || "otro",
    contact_name: contactName,
    email: email || null,
    phone: phone || null,
    location: location || null,
    notes: notes || null,
    status: "activo",
  });

  if (error) throw new Error(error.message);
  revalidateRequesterModules();
}

export async function updateAidRequesterAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const requesterId = String(formData.get("requesterId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "otro").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!requesterId) throw new Error("Solicitante inválido.");
  if (!name) throw new Error("El nombre del solicitante es obligatorio.");
  if (!contactName) throw new Error("La persona responsable es obligatoria.");

  const { error } = await admin.from("aid_requesters").update({
    name,
    type: type || "otro",
    contact_name: contactName,
    email: email || null,
    phone: phone || null,
    location: location || null,
    notes: notes || null,
  }).eq("id", requesterId);

  if (error) throw new Error(error.message);
  revalidateRequesterModules();
}

export async function updateAidRequesterStatusAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const requesterId = String(formData.get("requesterId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  if (!requesterId || !["activo", "pausado", "inactivo"].includes(status)) {
    throw new Error("Solicitud inválida.");
  }

  const { error } = await admin.from("aid_requesters").update({ status }).eq("id", requesterId);
  if (error) throw new Error(error.message);
  revalidateRequesterModules();
}

export async function generateAidRequesterAccessLinkAction(formData: FormData): Promise<Result> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const requesterId = String(formData.get("requesterId") || "").trim();
  if (!requesterId) return { error: "ID de solicitante no válido.", activationLink: null };

  const { data: requester, error } = await admin
    .from("aid_requesters")
    .select("id, user_id, status")
    .eq("id", requesterId)
    .maybeSingle();

  if (error) return { error: error.message, activationLink: null };
  if (!requester) return { error: "Solicitante no encontrado.", activationLink: null };
  if (requester.user_id) return { error: "Este solicitante ya tiene un usuario vinculado.", activationLink: null };
  if (requester.status !== "activo") return { error: "Solo puedes generar acceso para solicitantes activos.", activationLink: null };

  const { activationLink } = await generateAidRequesterActivationToken(requesterId, user.id);
  revalidateRequesterModules();
  return { activationLink };
}

export async function getAidRequesterOptionsAction(): Promise<Array<{ id: string; name: string }>> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("aid_requesters")
    .select("id, name")
    .eq("status", "activo")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
