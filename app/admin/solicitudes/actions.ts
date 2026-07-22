"use server";

import { revalidatePath } from "next/cache";

import { requireRequestsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { AID_REQUEST_STATUSES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateAidRequesterActivationToken, getAidRequestById, getAidRequesterById, getRequesterByUserId } from "@/lib/requesters";

type Result = { error?: string; activationLink?: string | null };

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

  revalidatePath("/admin/solicitudes");
}

export async function updateAidRequesterAction(formData: FormData): Promise<void> {
  const user = await requireRequestsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

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

  let targetRequesterId = requesterId;
  if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester) throw new Error("Tu cuenta no está vinculada a un solicitante.");
    targetRequesterId = requester.id;
  }

  const { error } = await admin.from("aid_requesters").update({
    name,
    type: type || "otro",
    contact_name: contactName,
    email: email || null,
    phone: phone || null,
    location: location || null,
    notes: notes || null,
  }).eq("id", targetRequesterId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
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

  revalidatePath("/admin/solicitudes");
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
  revalidatePath("/admin/solicitudes");
  return { activationLink };
}

export async function createAidRequestAction(formData: FormData): Promise<void> {
  const user = await requireRequestsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requestedItems = String(formData.get("requestedItems") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const requesterIdFromForm = String(formData.get("requesterId") || "").trim();

  if (!title) throw new Error("El título de la solicitud es obligatorio.");

  let requesterId = requesterIdFromForm;
  if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester) throw new Error("Tu cuenta no está vinculada a un solicitante.");
    requesterId = requester.id;
  } else if (!requesterId) {
    throw new Error("Selecciona un solicitante.");
  }

  const { error } = await admin.from("aid_requests").insert({
    requester_id: requesterId,
    title,
    description: description || null,
    requested_items: requestedItems || null,
    urgency: urgency || null,
    status: "recibida",
    created_by_user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
}

export async function updateAidRequestAction(formData: FormData): Promise<void> {
  const user = await requireRequestsUser();
  const admin = createSupabaseAdminClient();
  const role = user.app_metadata?.role as string | undefined;

  const requestId = String(formData.get("requestId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requestedItems = String(formData.get("requestedItems") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!requestId) throw new Error("Solicitud inválida.");
  if (!title) throw new Error("El título de la solicitud es obligatorio.");

  const request = await getAidRequestById(requestId);
  if (!request) throw new Error("La solicitud no existe.");

  if (role === "solicitante") {
    const requester = await getRequesterByUserId(user.id);
    if (!requester || requester.id !== request.requester_id) {
      throw new Error("No tienes acceso a esta solicitud.");
    }
    if (!["recibida", "en_revision"].includes(request.status)) {
      throw new Error("Solo puedes editar solicitudes abiertas o en revisión.");
    }

    const { error } = await admin.from("aid_requests").update({
      title,
      description: description || null,
      requested_items: requestedItems || null,
      urgency: urgency || null,
    }).eq("id", requestId);

    if (error) throw new Error(error.message);
  } else {
    const updates: Record<string, string | null> = {
      title,
      description: description || null,
      requested_items: requestedItems || null,
      urgency: urgency || null,
      admin_notes: adminNotes || null,
    };
    if (status && AID_REQUEST_STATUSES.includes(status as (typeof AID_REQUEST_STATUSES)[number])) {
      updates.status = status;
    }

    const { error } = await admin.from("aid_requests").update(updates).eq("id", requestId);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/solicitudes");
}

export async function updateAidRequestStatusAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();
  const requestId = String(formData.get("requestId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!requestId || !AID_REQUEST_STATUSES.includes(status as (typeof AID_REQUEST_STATUSES)[number])) {
    throw new Error("Solicitud inválida.");
  }

  const { error } = await admin.from("aid_requests").update({ status }).eq("id", requestId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
}

export async function createTaskFromAidRequestAction(formData: FormData): Promise<void> {
  await requireWorkshopAdminUser();
  const admin = createSupabaseAdminClient();

  const requestId = String(formData.get("requestId") || "").trim();
  const allyId = String(formData.get("allyId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const expectedOutput = String(formData.get("expectedOutput") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const adminNotes = String(formData.get("adminNotes") || "").trim();

  if (!requestId || !allyId) throw new Error("Selecciona la solicitud y el aliado.");
  if (!title) throw new Error("El título de la tarea es obligatorio.");

  const { error } = await admin.from("assigned_tasks").insert({
    ally_id: allyId,
    aid_request_id: requestId,
    title,
    description: description || null,
    expected_output: expectedOutput || null,
    urgency: urgency || null,
    due_date: dueDate || null,
    admin_notes: adminNotes || null,
    status: "asignada",
    assigned_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  const { error: requestError } = await admin
    .from("aid_requests")
    .update({ status: "convertida" })
    .eq("id", requestId);

  if (requestError) throw new Error(requestError.message);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/tareas");
}
