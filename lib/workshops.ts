import crypto from "crypto";
import { cache } from "react";

import type {
  CartucheraDonation,
  Workshop,
  WorkshopActivationToken,
  WorkshopHelpOffer,
  WorkshopHelpOfferWithRelations,
  WorkshopListItem,
  WorkshopNeed,
  WorkshopNeedWithWorkshopName,
  WorkshopPhoto,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { HELP_TYPE_GROUPS } from "@/lib/constants";

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

// ---- Slug generation ----
export async function generateWorkshopSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "taller";

  const admin = await createSupabaseServerClient();
  const { data } = await admin
    .from("workshops")
    .select("slug")
    .like("slug", `${base}%`);

  const existing = new Set(data?.map((r) => r.slug) ?? []);
  if (!existing.has(base)) return base;

  let counter = 1;
  while (existing.has(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

// ---- Admin queries ----
export async function getAdminWorkshopsPage({
  page = 1,
  limit = 20,
  status,
  tab,
  q,
}: {
  page?: number;
  limit?: number;
  status?: string;
  tab?: "postulaciones" | "talleres";
  q?: string;
} = {}): Promise<PagedResult<WorkshopListItem>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshops")
    .select("id, user_id, name, responsible_name, city, state, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const activeStatuses = ["activo", "pausado", "rechazado", "desactivado"];
  const postulationStatuses = ["pendiente", "approved_pending_activation"];

  if (tab === "postulaciones") {
    query = query.in("status", postulationStatuses);
  } else if (tab === "talleres") {
    query = query.in("status", activeStatuses);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,responsible_name.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los talleres");
  const total = count ?? 0;

  return {
    items: (data ?? []) as WorkshopListItem[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminWorkshopById(id: string) {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin.from("workshops").select("*").eq("id", id).maybeSingle();
  assertQueryOk(error, "No se pudo cargar el taller");
  return (data ?? null) as Workshop | null;
}

export async function getAdminWorkshopNeeds(
  workshopId: string,
): Promise<WorkshopNeed[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshop_needs")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las necesidades del taller");
  return (data ?? []) as WorkshopNeed[];
}

export async function getAdminWorkshopPhotos(
  workshopId: string,
): Promise<WorkshopPhoto[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshop_photos")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las fotos del taller");
  return (data ?? []) as WorkshopPhoto[];
}

export async function getAdminNeedsPage({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PagedResult<WorkshopNeedWithWorkshopName>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshop_needs")
    .select("*, workshop:workshops(id, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las necesidades");
  const total = count ?? 0;

  return {
    items: (data ?? []) as WorkshopNeedWithWorkshopName[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminHelpOffersPage({
  page = 1,
  limit = 20,
  status,
  tipo,
}: {
  page?: number;
  limit?: number;
  status?: string;
  tipo?: string;
} = {}): Promise<PagedResult<WorkshopHelpOfferWithRelations>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshop_help_offers")
    .select("*, workshop:workshops(id, name, slug), need:workshop_needs(id, title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (tipo && tipo !== "all") {
    const group = HELP_TYPE_GROUPS.find((g) => g.label.toLowerCase() === tipo.toLowerCase());
    if (group) {
      query = query.in("help_type", [...group.options]);
    }
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las ofertas de ayuda");
  const total = count ?? 0;

  return {
    items: (data ?? []) as WorkshopHelpOfferWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

// ---- Public queries ----
export async function getPublicWorkshopsPage({
  page = 1,
  limit = 12,
  q,
  state,
  city,
}: {
  page?: number;
  limit?: number;
  q?: string;
  state?: string;
  city?: string;
} = {}): Promise<PagedResult<Workshop & { needs_count: number }>> {
  const supabase = createSupabasePublicClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("workshops")
    .select("*", { count: "exact" })
    .eq("status", "activo")
    .order("name", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,what_they_do.ilike.%${q}%,city.ilike.%${q}%`);
  }
  if (state) {
    query = query.eq("state", state);
  }
  if (city) {
    query = query.eq("city", city);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los talleres públicos");
  const total = count ?? 0;
  const workshops = (data ?? []) as Workshop[];

  const needsCountMap = new Map<string, number>();
  if (workshops.length > 0) {
    const { data: needs, error: needsError } = await supabase
      .from("workshop_needs")
      .select("workshop_id")
      .in("workshop_id", workshops.map((w) => w.id))
      .eq("status", "publicada");
    assertQueryOk(needsError, "No se pudo cargar el conteo de necesidades públicas");

    if (needs) {
      for (const n of needs) {
        needsCountMap.set(n.workshop_id, (needsCountMap.get(n.workshop_id) ?? 0) + 1);
      }
    }
  }

  const items = workshops.map((w) => ({
    ...w,
    needs_count: needsCountMap.get(w.id) ?? 0,
  }));

  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getPublicWorkshopBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("status", "activo")
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el taller público");
  return (data ?? null) as Workshop | null;
}

export async function getPublicWorkshopNeeds(
  workshopId: string,
): Promise<WorkshopNeed[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("workshop_needs")
    .select("id, title, description, requested_items, urgency, status, created_at")
    .eq("workshop_id", workshopId)
    .eq("status", "publicada")
    .order("created_at", { ascending: false })
    .limit(50);
  assertQueryOk(error, "No se pudieron cargar las necesidades públicas del taller");
  return (data ?? []) as WorkshopNeed[];
}

export async function getPublicWorkshopPhotos(
  workshopId: string,
): Promise<WorkshopPhoto[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("workshop_photos")
    .select("id, title, description, storage_path, status, created_at")
    .eq("workshop_id", workshopId)
    .eq("status", "aprobada")
    .order("created_at", { ascending: false })
    .limit(50);
  assertQueryOk(error, "No se pudieron cargar las fotos públicas del taller");
  return (data ?? []) as WorkshopPhoto[];
}

export async function getPublicNeedsPage({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PagedResult<WorkshopNeedWithWorkshopName>> {
  const supabase = createSupabasePublicClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("workshop_needs")
    .select("*, workshop:workshops!inner(id, name, slug, status)", { count: "exact" })
    .eq("status", "publicada")
    .eq("workshop.status", "activo")
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las necesidades públicas");

  const total = count ?? 0;

  return {
    items: (data ?? []) as WorkshopNeedWithWorkshopName[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

// ---- Panel queries (by user_id) ----
export const getWorkshopByUserId = cache(async (userId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshops")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el taller del usuario");
  return (data ?? null) as Workshop | null;
});

export const getWorkshopAvatarPath = cache(async (userId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshops")
    .select("avatar_path")
    .eq("user_id", userId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el avatar del taller");
  return data?.avatar_path ?? null;
});

export async function getWorkshopNeeds(workshopId: string): Promise<WorkshopNeed[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshop_needs")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las necesidades del panel");
  return (data ?? []) as WorkshopNeed[];
}

export async function getWorkshopPhotos(workshopId: string): Promise<WorkshopPhoto[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("workshop_photos")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las fotos del panel");
  return (data ?? []) as WorkshopPhoto[];
}

// ---- Activation tokens ----
export async function createWorkshopActivationToken(
  workshopId: string,
  createdByUserId?: string | null,
) {
  const admin = createSupabaseAdminClient();
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  await admin
    .from("workshop_activation_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("workshop_id", workshopId)
    .is("used_at", null);

  const { error } = await admin.from("workshop_activation_tokens").insert({
    workshop_id: workshopId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by_user_id: createdByUserId ?? null,
  });

  if (error) throw new Error(error.message);

  return {
    token,
    activationLink: `${getSiteUrl()}/admin/activar-taller?token=${token}`,
    expiresAt,
  };
}

export async function findWorkshopActivationToken(rawToken: string) {
  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await admin
    .from("workshop_activation_tokens")
    .select("*, workshop:workshops(*)")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el token de activación");

  return (data ?? null) as (WorkshopActivationToken & { workshop?: Workshop }) | null;
}

export async function getAdminCartucheraDonationsPage({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PagedResult<CartucheraDonation>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await admin
    .from("cartuchera_donations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las donaciones de cartuchera");

  const total = count ?? 0;

  return {
    items: (data ?? []) as CartucheraDonation[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}
