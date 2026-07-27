"use server";

import { revalidatePath } from "next/cache";

import { requireOperationsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { getRequesterByUserId } from "@/lib/requesters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Message, MessageSenderRole } from "@/lib/types";
import { getWorkshopByUserId } from "@/lib/workshops";

type ActionResult = {
  error?: string;
  success?: boolean;
  threadId?: string;
  message?: Message;
};

const ACTIVE_STATUSES = ["activo", "pausado"];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getActorScope(user: { id: string; app_metadata?: Record<string, unknown> }) {
  const role = user.app_metadata?.role as string | undefined;
  if (role === "admin") return { role: "admin" as const, userId: user.id };

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally) throw new Error("Tu cuenta no está vinculada a un aliado.");
    return { role: "aliado" as const, userId: user.id, allyId: ally.id };
  }

  if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester) throw new Error("Tu cuenta no está vinculada a un solicitante.");
    return { role: "solicitante" as const, userId: user.id, requesterId: requester.id };
  }

  throw new Error("Tu usuario no tiene un rol operativo válido.");
}

async function getAccessibleThread(
  user: { id: string; app_metadata?: Record<string, unknown> },
  threadId: string,
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  const scope = await getActorScope(user);
  let query = admin
    .from("message_threads")
    .select("id, ally_id, requester_id, status")
    .eq("id", threadId);

  if (scope.role === "aliado") query = query.eq("ally_id", scope.allyId);
  if (scope.role === "solicitante") query = query.eq("requester_id", scope.requesterId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No tienes acceso a este hilo.");

  return { scope, thread: data as { id: string; ally_id: string | null; requester_id: string | null; status: string } };
}

export async function getMessageRecipientOptionsAction(): Promise<{
  allies: Array<{ id: string; name: string }>;
  requesters: Array<{ id: string; name: string }>;
}> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const [{ data: allies, error: alliesError }, { data: requesters, error: requestersError }] = await Promise.all([
    admin
      .from("allies")
      .select("id, name")
      .in("status", ACTIVE_STATUSES)
      .not("user_id", "is", null)
      .order("name", { ascending: true }),
    admin
      .from("aid_requesters")
      .select("id, name")
      .in("status", ACTIVE_STATUSES)
      .not("user_id", "is", null)
      .order("name", { ascending: true }),
  ]);

  if (alliesError) throw new Error(alliesError.message);
  if (requestersError) throw new Error(requestersError.message);

  return { allies: allies ?? [], requesters: requesters ?? [] };
}

export async function createMessageThreadAction(formData: FormData): Promise<ActionResult> {
  const user = await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const recipientType = textValue(formData, "recipientType");
  const recipientId = textValue(formData, "recipientId");
  const subject = textValue(formData, "subject");

  if (!recipientId || !["aliado", "solicitante"].includes(recipientType)) {
    return { error: "Selecciona un destinatario válido." };
  }
  if (subject.length < 3) return { error: "El asunto debe tener al menos 3 caracteres." };
  if (subject.length > 160) return { error: "El asunto no puede superar 160 caracteres." };

  let allyId: string | null = null;
  let requesterId: string | null = null;
  let recipientUserId: string | null = null;

  if (recipientType === "aliado") {
    const { data: ally, error } = await admin
      .from("allies")
      .select("id, user_id, status")
      .eq("id", recipientId)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!ally || !ACTIVE_STATUSES.includes(ally.status) || !ally.user_id) {
      return { error: "El aliado no tiene una cuenta activa para recibir mensajes." };
    }
    allyId = ally.id;
    recipientUserId = ally.user_id;
  } else {
    const { data: requester, error } = await admin
      .from("aid_requesters")
      .select("id, user_id, status")
      .eq("id", recipientId)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!requester || !ACTIVE_STATUSES.includes(requester.status) || !requester.user_id) {
      return { error: "El solicitante no tiene una cuenta activa para recibir mensajes." };
    }
    requesterId = requester.id;
    recipientUserId = requester.user_id;
  }

  const { data: thread, error: threadError } = await admin
    .from("message_threads")
    .insert({
      ally_id: allyId,
      requester_id: requesterId,
      subject,
      status: "open",
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (threadError || !thread) return { error: threadError?.message ?? "No se pudo crear el hilo." };

  const participants = [
    { thread_id: thread.id, user_id: user.id, ally_id: null, participant_role: "admin" },
    recipientType === "aliado"
      ? { thread_id: thread.id, user_id: null, ally_id: allyId, participant_role: "aliado" }
      : { thread_id: thread.id, user_id: recipientUserId, ally_id: null, participant_role: "solicitante" },
  ];
  const { error: participantsError } = await admin.from("message_thread_participants").insert(participants);

  if (participantsError) {
    await admin.from("message_threads").delete().eq("id", thread.id);
    return { error: participantsError.message };
  }

  revalidatePath("/admin/mensajes");
  return { success: true, threadId: thread.id };
}

export async function sendMessageAction(formData: FormData): Promise<ActionResult> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();
  const threadId = textValue(formData, "threadId");
  const body = textValue(formData, "body");

  if (!threadId) return { error: "Hilo inválido." };
  if (!body) return { error: "Escribe un mensaje." };
  if (body.length > 4000) return { error: "El mensaje no puede superar 4.000 caracteres." };

  const { scope, thread } = await getAccessibleThread(user, threadId, admin);
  if (thread.status !== "open") return { error: "Este hilo está cerrado." };

  const { data: message, error: messageError } = await admin
    .from("messages")
    .insert({
      thread_id: threadId,
      sender_user_id: user.id,
      sender_role: scope.role,
      body,
    })
    .select("id, thread_id, sender_user_id, sender_role, body, created_at")
    .single();

  if (messageError || !message) return { error: messageError?.message ?? "No se pudo enviar el mensaje." };

  const { error: threadUpdateError } = await admin
    .from("message_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (threadUpdateError) {
    await admin.from("messages").delete().eq("id", message.id);
    return { error: threadUpdateError.message };
  }

  revalidatePath("/admin/mensajes");
  revalidatePath(`/admin/mensajes/${threadId}`);
  return { success: true, message: message as Message };
}

export async function markThreadReadAction(formData: FormData): Promise<ActionResult> {
  const user = await requireOperationsUser();
  const admin = createSupabaseAdminClient();
  const threadId = textValue(formData, "threadId");
  if (!threadId) return { error: "Hilo inválido." };

  const { scope } = await getAccessibleThread(user, threadId, admin);
  const lastReadAt = new Date().toISOString();
  let participantQuery = admin
    .from("message_thread_participants")
    .select("id")
    .eq("thread_id", threadId);

  if (scope.role === "admin" || scope.role === "solicitante") {
    participantQuery = participantQuery.eq("user_id", user.id).eq("participant_role", scope.role);
  } else {
    participantQuery = participantQuery.eq("ally_id", scope.allyId).eq("participant_role", "aliado");
  }

  const { data: participant, error: participantError } = await participantQuery.maybeSingle();
  if (participantError) return { error: participantError.message };

  if (participant) {
    const { error } = await admin
      .from("message_thread_participants")
      .update({ last_read_at: lastReadAt })
      .eq("id", participant.id);
    if (error) return { error: error.message };
  } else if (scope.role === "admin") {
    const { error } = await admin.from("message_thread_participants").insert({
      thread_id: threadId,
      user_id: user.id,
      ally_id: null,
      participant_role: "admin",
      last_read_at: lastReadAt,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/mensajes");
  return { success: true };
}

export async function setMessageThreadStatusAction(formData: FormData): Promise<ActionResult> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const threadId = textValue(formData, "threadId");
  const status = textValue(formData, "status");

  if (!threadId || !["open", "closed"].includes(status)) return { error: "Estado de hilo inválido." };

  const { error } = await admin
    .from("message_threads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", threadId);
  if (error) return { error: error.message };

  revalidatePath("/admin/mensajes");
  revalidatePath(`/admin/mensajes/${threadId}`);
  return { success: true };
}
