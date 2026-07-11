"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findWorkshopActivationToken } from "@/lib/workshops";

type Result = { error?: string };

export async function activateWorkshopFromTokenAction(formData: FormData): Promise<Result> {
  const admin = createSupabaseAdminClient();

  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const customEmail = String(formData.get("email") || "").trim().toLowerCase();

  if (!token) return { error: "El enlace de activación no es válido." };
  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const activationToken = await findWorkshopActivationToken(token);
  if (!activationToken) {
    return { error: "El enlace de activación no es válido." };
  }

  if (activationToken.used_at) {
    return { error: "Este enlace ya fue usado." };
  }

  if (new Date(activationToken.expires_at).getTime() < Date.now()) {
    return { error: "Este enlace venció. Solicita uno nuevo al equipo." };
  }

  const workshop = activationToken.workshop;
  if (!workshop) {
    return { error: "Este taller ya no está disponible para activación." };
  }

  const isApprovedPending = workshop.status === "approved_pending_activation";
  const isActiveWithoutUser = workshop.status === "activo" && !workshop.user_id;

  if (!isApprovedPending && !isActiveWithoutUser) {
    return { error: "Este taller ya no está disponible para activación." };
  }

  const email = workshop.email || customEmail;

  if (!email || !email.includes("@")) {
    return { error: "Se requiere un correo electrónico válido para crear la cuenta." };
  }

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const emailAlreadyExists = existingUsers?.users.some(
    (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
  );
  if (emailAlreadyExists) {
    return { error: "Ya existe un usuario registrado con ese correo." };
  }

  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: workshop.responsible_name || workshop.name,
      workshop_name: workshop.name,
    },
    app_metadata: { role: "taller" },
  });

  if (createError || !createdUser?.user) {
    return { error: createError?.message ?? "No pudimos crear la cuenta." };
  }

  const now = new Date().toISOString();

  const workshopUpdates: Record<string, unknown> = {
    user_id: createdUser.user.id,
  };

  if (isApprovedPending) {
    workshopUpdates.status = "activo";
    workshopUpdates.approved_at = workshop.approved_at ?? now;
  }

  if (!workshop.email && customEmail) {
    workshopUpdates.email = customEmail;
  }

  const { error: updateError } = await admin
    .from("workshops")
    .update(workshopUpdates)
    .eq("id", workshop.id);

  if (updateError) {
    return { error: "Cuenta creada pero no se pudo vincular al taller. Contacta al equipo." };
  }

  await admin
    .from("workshop_activation_tokens")
    .update({ used_at: now })
    .eq("id", activationToken.id);

  revalidatePath("/admin/talleres");
  revalidatePath(`/admin/talleres/listado/${workshop.id}`);
  revalidatePath(`/${workshop.slug}`);
  revalidatePath("/ver-talleres");
  return {};
}
