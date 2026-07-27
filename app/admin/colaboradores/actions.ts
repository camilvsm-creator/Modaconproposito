"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error?: string; success?: boolean };

const TYPES = ["donador", "centro_telas", "proveedor", "empresa", "otro"];
const STATUSES = ["activo", "pausado", "inactivo"];

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createCollaboratorAction(formData: FormData): Promise<ActionResult> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const name = value(formData, "name");
  const type = value(formData, "type");

  if (!name) return { error: "El nombre es obligatorio." };
  if (!TYPES.includes(type)) return { error: "Selecciona un tipo válido." };

  const { error } = await admin.from("collaborators").insert({
    name,
    type,
    contact_name: value(formData, "contactName") || null,
    email: value(formData, "email").toLowerCase() || null,
    phone: value(formData, "phone") || null,
    location: value(formData, "location") || null,
    notes: value(formData, "notes") || null,
    status: "activo",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/colaboradores");
  return { success: true };
}

export async function updateCollaboratorAction(formData: FormData): Promise<ActionResult> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const type = value(formData, "type");
  const status = value(formData, "status");

  if (!id || !name) return { error: "El colaborador y el nombre son obligatorios." };
  if (!TYPES.includes(type) || !STATUSES.includes(status)) return { error: "Datos de colaborador no válidos." };

  const { error } = await admin.from("collaborators").update({
    name,
    type,
    contact_name: value(formData, "contactName") || null,
    email: value(formData, "email").toLowerCase() || null,
    phone: value(formData, "phone") || null,
    location: value(formData, "location") || null,
    notes: value(formData, "notes") || null,
    status,
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/colaboradores");
  return { success: true };
}

export async function updateCollaboratorStatusAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const id = value(formData, "id");
  const status = value(formData, "status");
  if (!id || !STATUSES.includes(status)) throw new Error("Solicitud inválida.");

  const { error } = await admin.from("collaborators").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/colaboradores");
}
