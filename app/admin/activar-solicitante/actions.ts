"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findAidRequesterActivationToken } from "@/lib/requesters";

type Result = { error?: string };

export async function activateRequesterFromTokenAction(formData: FormData): Promise<Result> {
  const admin = createSupabaseAdminClient();

  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const customEmail = String(formData.get("email") || "").trim().toLowerCase();

  if (!token) return { error: "El enlace de activación no es válido." };
  if (!password || password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirmPassword) return { error: "Las contraseñas no coinciden." };

  const activationToken = await findAidRequesterActivationToken(token);
  if (!activationToken) return { error: "El enlace de activación no es válido." };
  if (activationToken.used_at) return { error: "Este enlace ya fue usado." };
  if (new Date(activationToken.expires_at).getTime() < Date.now()) {
    return { error: "Este enlace venció. Solicita uno nuevo al equipo." };
  }

  const requester = activationToken.requester;
  if (!requester) return { error: "Este solicitante ya no está disponible para activación." };
  if (requester.user_id) return { error: "Este solicitante ya tiene una cuenta vinculada." };

  const email = requester.email || customEmail;
  if (!email || !email.includes("@")) {
    return { error: "Se requiere un correo electrónico válido para crear la cuenta." };
  }

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const emailAlreadyExists = existingUsers?.users.some(
    (user) => (user.email ?? "").toLowerCase() === email.toLowerCase(),
  );
  if (emailAlreadyExists) return { error: "Ya existe un usuario registrado con ese correo." };

  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: requester.contact_name || requester.name,
      requester_name: requester.name,
    },
    app_metadata: { role: "solicitante" },
  });

  if (createError || !createdUser?.user) {
    return { error: createError?.message ?? "No pudimos crear la cuenta." };
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    user_id: createdUser.user.id,
  };
  if (!requester.email && customEmail) {
    updates.email = customEmail;
  }

  const { error: updateError } = await admin
    .from("aid_requesters")
    .update(updates)
    .eq("id", requester.id);

  if (updateError) {
    return { error: "Cuenta creada pero no se pudo vincular al solicitante. Contacta al equipo." };
  }

  const { error: tokenError } = await admin
    .from("aid_requester_activation_tokens")
    .update({ used_at: now })
    .eq("id", activationToken.id);

  if (tokenError) {
    return { error: "Cuenta activada, pero no se pudo cerrar el enlace de activación. Contacta al equipo." };
  }

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/ayudas");
  revalidatePath("/admin/entregas");
  return {};
}
