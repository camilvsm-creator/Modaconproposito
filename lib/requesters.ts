import crypto from "crypto";
import { cache } from "react";

import type { AidRequest, AidRequester, AidRequesterActivationToken, AidRequestWithRelations } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export const getRequesterByUserId = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requesters")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar el solicitante del usuario");
  return (data ?? null) as AidRequester | null;
});

export async function getAdminAidRequesters(): Promise<AidRequester[]> {
  return getAdminAidRequestersFiltered();
}

export async function getAdminAidRequestersFiltered({
  q,
  status,
  type,
}: {
  q?: string;
  status?: string;
  type?: string;
} = {}): Promise<AidRequester[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("aid_requesters")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (type && type !== "all") query = query.eq("type", type);
  if (q) query = query.or(`name.ilike.%${q}%,contact_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar los solicitantes");
  return (data ?? []) as AidRequester[];
}

export async function getAdminAidRequests(): Promise<AidRequestWithRelations[]> {
  return getAdminAidRequestsFiltered();
}

export async function getAdminAidRequestsFiltered({
  q,
  status,
  requesterId,
}: {
  q?: string;
  status?: string;
  requesterId?: string;
} = {}): Promise<AidRequestWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("aid_requests")
    .select(`
      *,
      requester:aid_requesters(id, name, type, contact_name, email, user_id),
      tasks:assigned_tasks(
        id,
        title,
        status,
        due_date,
        created_at,
        ally:allies(id, name, slug),
        deliveries:ally_deliveries(
          id,
          ally_id,
          task_id,
          title,
          description,
          quantity,
          status,
          scheduled_for,
          delivered_at,
          received_at,
          received_by,
          notes,
          created_at,
          updated_at
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (requesterId && requesterId !== "all") query = query.eq("requester_id", requesterId);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar las solicitudes de ayuda");
  return (data ?? []) as AidRequestWithRelations[];
}

export async function getRequesterAidRequests(
  requesterId: string,
  {
    status,
    q,
  }: {
    status?: string;
    q?: string;
  } = {},
): Promise<AidRequestWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("aid_requests")
    .select(`
      *,
      requester:aid_requesters(id, name, type, contact_name, email, user_id),
      tasks:assigned_tasks(
        id,
        title,
        status,
        due_date,
        created_at,
        ally:allies(id, name, slug),
        deliveries:ally_deliveries(
          id,
          ally_id,
          task_id,
          title,
          description,
          quantity,
          status,
          scheduled_for,
          delivered_at,
          received_at,
          received_by,
          notes,
          created_at,
          updated_at
        )
      )
    `)
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar tus solicitudes");
  return (data ?? []) as AidRequestWithRelations[];
}

export async function getAidRequesterById(requesterId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requesters")
    .select("*")
    .eq("id", requesterId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar el solicitante");
  return (data ?? null) as AidRequester | null;
}

export async function generateAidRequesterActivationToken(
  requesterId: string,
  createdByUserId?: string | null,
) {
  const admin = createSupabaseAdminClient();
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { error: invalidateError } = await admin
    .from("aid_requester_activation_tokens")
    .update({ used_at: now })
    .eq("requester_id", requesterId)
    .is("used_at", null);

  if (invalidateError) throw new Error(invalidateError.message);

  const { error } = await admin.from("aid_requester_activation_tokens").insert({
    requester_id: requesterId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by_user_id: createdByUserId ?? null,
  });

  if (error) throw new Error(error.message);

  const activationUrl = new URL("/admin/activar-solicitante", getSiteUrl());
  activationUrl.searchParams.set("token", token);

  return { token, activationLink: activationUrl.toString(), expiresAt };
}

export async function findAidRequesterActivationToken(rawToken: string) {
  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await admin
    .from("aid_requester_activation_tokens")
    .select("*, requester:aid_requesters(*)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar el token de activación del solicitante");
  if (!data) return null;
  return data as AidRequesterActivationToken & { requester?: AidRequester | null };
}

export async function getAidRequestById(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar la solicitud");
  return (data ?? null) as AidRequest | null;
}
