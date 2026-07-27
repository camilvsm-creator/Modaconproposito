"use server";

import { revalidatePath } from "next/cache";

import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error?: string; success?: boolean };

export async function createVolunteerAction(formData: FormData): Promise<ActionResult> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const skills = String(formData.get("skills") || "").trim();
  const availability = String(formData.get("availability") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) return { error: "El nombre es obligatorio." };

  const { error } = await admin.from("volunteers").insert({
    name,
    email: email || null,
    phone: phone || null,
    instagram: instagram || null,
    skills: skills || null,
    availability: availability || null,
    state: state || null,
    city: city || null,
    notes: notes || null,
    status: "activo",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/voluntarios");
  return { success: true };
}

export async function updateVolunteerStatusAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const volunteerId = String(formData.get("volunteerId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  if (!volunteerId || !["postulado", "revisado", "activo", "asignado", "inactivo"].includes(status)) {
    throw new Error("Estado de voluntario no válido.");
  }

  const { error } = await admin.from("volunteers").update({ status }).eq("id", volunteerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/voluntarios");
}

export async function assignVolunteerToAllyAction(formData: FormData): Promise<ActionResult> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const volunteerId = String(formData.get("volunteerId") || "").trim();
  const allyId = String(formData.get("allyId") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!volunteerId) return { error: "Selecciona un voluntario." };
  if (!allyId) return { error: "Selecciona un aliado." };

  const { data: volunteer, error: volunteerError } = await admin
    .from("volunteers")
    .select("id, name, phone, instagram, skills, status")
    .eq("id", volunteerId)
    .maybeSingle();

  if (volunteerError) return { error: volunteerError.message };
  if (!volunteer) return { error: "El voluntario no existe." };
  if (!["activo", "asignado"].includes(volunteer.status)) return { error: "Primero revisa y activa la postulación." };

  const { data: existing, error: existingError } = await admin
    .from("ally_volunteer_assignments")
    .select("id")
    .eq("volunteer_id", volunteerId)
    .eq("ally_id", allyId)
    .eq("status", "activo")
    .maybeSingle();

  if (existingError) return { error: existingError.message };
  if (existing) return { error: "Ese voluntario ya está asignado a este aliado." };

  const { error } = await admin.from("ally_volunteer_assignments").insert({
    ally_id: allyId,
    volunteer_id: volunteerId,
    name: volunteer.name,
    role: role || volunteer.skills || null,
    phone: volunteer.phone || null,
    instagram: volunteer.instagram || null,
    status: "activo",
    notes: notes || null,
  });

  if (error) return { error: error.message };

  await admin.from("volunteers").update({ status: "asignado" }).eq("id", volunteerId);

  revalidatePath("/admin/voluntarios");
  revalidatePath("/admin/aliados");
  return { success: true };
}

export async function removeVolunteerAssignmentAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const assignmentId = String(formData.get("assignmentId") || "").trim();
  const volunteerId = String(formData.get("volunteerId") || "").trim();
  if (!assignmentId || !volunteerId) throw new Error("Asignación inválida.");

  const { error } = await admin
    .from("ally_volunteer_assignments")
    .update({ status: "inactivo" })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);

  await admin.from("volunteers").update({ status: "activo" }).eq("id", volunteerId);
  revalidatePath("/admin/voluntarios");
}

export async function getVolunteerOptionsAction(): Promise<Array<{ id: string; name: string }>> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("volunteers")
    .select("id, name")
    .in("status", ["activo", "asignado"])
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
