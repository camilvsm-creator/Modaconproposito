import crypto from "crypto";
import { cache } from "react";

import type { AidRequest, AidRequester, AidRequesterActivationToken, AidRequestWithRelations, PagedResult } from "@/lib/types";
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
    .select("id, user_id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at")
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
    .select("id, user_id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (type && type !== "all") query = query.eq("type", type);
  if (q) query = query.or(`name.ilike.%${q}%,contact_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar los solicitantes");
  return (data ?? []) as AidRequester[];
}

export async function getAdminAidRequestersPage({
  page = 1,
  limit = 20,
  q,
  status,
  type,
}: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  type?: string;
} = {}): Promise<PagedResult<AidRequester>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("aid_requesters")
    .select("id, user_id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (type && type !== "all") query = query.eq("type", type);
  if (q) query = query.or(`name.ilike.%${q}%,contact_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los solicitantes");
  const total = count ?? 0;

  return {
    items: (data ?? []) as AidRequester[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
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
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id)
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (requesterId && requesterId !== "all") query = query.eq("requester_id", requesterId);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar las solicitudes de ayuda");
  return (data ?? []) as unknown as AidRequestWithRelations[];
}

export async function getAdminAidRequestsPage({
  page = 1,
  limit = 20,
  q,
  status,
  requesterId,
}: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  requesterId?: string;
} = {}): Promise<PagedResult<AidRequestWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("aid_requests")
    .select(`
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (requesterId && requesterId !== "all") query = query.eq("requester_id", requesterId);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las solicitudes de ayuda");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as AidRequestWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getRequesterAidRequestsPage(
  requesterId: string,
  {
    page = 1,
    limit = 20,
    q,
    status,
  }: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  } = {},
): Promise<PagedResult<AidRequestWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("aid_requests")
    .select(`
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id)
    `, { count: "exact" })
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar tus solicitudes");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as AidRequestWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
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
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id)
    `)
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requested_items.ilike.%${q}%`);

  const { data, error } = await query;

  assertQueryOk(error, "No se pudieron cargar tus solicitudes");
  return (data ?? []) as unknown as AidRequestWithRelations[];
}

export async function getRequesterAidRequestsWithRelations(requesterId: string): Promise<AidRequestWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requests")
    .select(`
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id),
      tasks:assigned_tasks(
        id, title, status, due_date, created_at,
        ally:allies(id, name, slug),
        deliveries:ally_deliveries(
          id, ally_id, task_id, title, description, quantity, status,
          scheduled_for, delivered_at, received_at, received_by, notes,
          created_at, updated_at
        )
      )
    `)
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las solicitudes con entregas");
  return (data ?? []) as unknown as AidRequestWithRelations[];
}

export async function getAidRequesterById(requesterId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requesters")
    .select("id, user_id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at")
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
    .select(`id, requester_id, token_hash, expires_at, used_at, created_by_user_id, created_at, requester:aid_requesters(id, user_id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at)`)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar el token de activación del solicitante");
  if (!data) return null;
  return data as unknown as AidRequesterActivationToken & { requester?: AidRequester | null };
}

export async function getAidRequestById(requestId: string): Promise<AidRequestWithRelations | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("aid_requests")
    .select(`
      id, requester_id, title, description, requested_items, urgency, status,
      admin_notes, created_by_user_id, created_at, updated_at,
      requester:aid_requesters(id, name, type, contact_name, email, user_id),
      tasks:assigned_tasks(
        id, title, description, expected_output, urgency, status,
        due_date, assigned_at, completed_at, created_at,
        ally:allies(id, name, slug),
        deliveries:ally_deliveries(
          id, ally_id, task_id, title, description, quantity, status,
          scheduled_for, delivered_at, received_at, received_by, notes,
          created_at, updated_at
        )
      )
    `)
    .eq("id", requestId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar la solicitud");
  return (data ?? null) as unknown as AidRequestWithRelations | null;
}
