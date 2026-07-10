"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { PATTERN_STATUSES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Result = { error?: string };

export async function updatePatternStatusAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !PATTERN_STATUSES.includes(status as (typeof PATTERN_STATUSES)[number])) {
    return { error: "Solicitud inválida." };
  }

  const { error } = await admin
    .from("sewing_patterns")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/patrones");
  return {};
}

export async function updatePatternAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const difficulty = String(formData.get("difficulty") || "").trim();
  const category = String(formData.get("category") || "").trim();

  if (!id) return { error: "ID no válido." };
  if (!title) return { error: "El título es obligatorio." };

  const updates: Record<string, string | null> = {
    title,
    description: description || null,
    difficulty: difficulty || null,
    category: category || null,
  };

  const { error } = await admin.from("sewing_patterns").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/patrones");
  return {};
}

export async function createPatternAction(formData: FormData): Promise<Result> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const difficulty = String(formData.get("difficulty") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const filePath = String(formData.get("filePath") || "").trim();
  const fileSizeBytes = Number(formData.get("fileSizeBytes")) || null;
  const imagePath = String(formData.get("imagePath") || "").trim() || null;

  if (!title) return { error: "El título es obligatorio." };
  if (!filePath) return { error: "El archivo del patrón es obligatorio." };

  const { error } = await admin.from("sewing_patterns").insert({
    title,
    description: description || null,
    difficulty: difficulty || null,
    category: category || null,
    file_path: filePath,
    file_size_bytes: fileSizeBytes,
    image_path: imagePath,
    status: "pendiente",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/talleres/patrones");
  return {};
}
