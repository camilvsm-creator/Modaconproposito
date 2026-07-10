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
  if (!workshop || workshop.status !== "approved_pending_activation") {
    return { error: "Este taller ya no está disponible para activación." };
  }

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const emailAlreadyExists = existingUsers?.users.some(
    (u) => (u.email ?? "").toLowerCase() === workshop.email.toLowerCase(),
  );
  if (emailAlreadyExists) {
    return { error: "Ya existe un usuario registrado con ese correo." };
  }

  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email: workshop.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: workshop.responsible_name,
      workshop_name: workshop.name,
    },
    app_metadata: { role: "taller" },
  });

  if (createError || !createdUser?.user) {
    return { error: createError?.message ?? "No pudimos crear la cuenta." };
  }

  const now = new Date().toISOString();

  await admin
    .from("workshop_activation_tokens")
    .update({ used_at: now })
    .eq("id", activationToken.id);

  await admin
    .from("workshops")
    .update({
      status: "activo",
      user_id: createdUser.user.id,
      approved_at: workshop.approved_at ?? now,
    })
    .eq("id", workshop.id);

  revalidatePath("/admin/talleres");
  revalidatePath(`/admin/talleres/${workshop.id}`);
  revalidatePath(`/${workshop.slug}`);
  return {};
}
