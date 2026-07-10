import crypto from "crypto";

import type {
  CartucheraDonation,
  Workshop,
  WorkshopActivationToken,
  WorkshopHelpOffer,
  WorkshopNeed,
  WorkshopPhoto,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getSiteUrl } from "@/lib/site-url";
import { HELP_TYPE_GROUPS } from "@/lib/constants";

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

// ---- Slug generation ----
export async function generateWorkshopSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "taller";

  const admin = createSupabaseAdminClient();
  let slug = base;
  let counter = 1;
  while (true) {
    const { data } = await admin
      .from("workshops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
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
} = {}): Promise<PagedResult<Workshop>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshops")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const activeStatuses = ["activo", "pausado", "rechazado"];
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
    query = query.or(`name.ilike.%${q}%,responsible_name.ilike.%${q}%,email.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const total = count ?? 0;

  return {
    items: (data ?? []) as Workshop[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminWorkshopById(id: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("workshops").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as Workshop | null;
}

export async function getAdminWorkshopNeeds(
  workshopId: string,
): Promise<WorkshopNeed[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshop_needs")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopNeed[];
}

export async function getAdminWorkshopPhotos(
  workshopId: string,
): Promise<WorkshopPhoto[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshop_photos")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopPhoto[];
}

export async function getAdminWorkshopHelpOffers(
  workshopId: string,
): Promise<WorkshopHelpOffer[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshop_help_offers")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopHelpOffer[];
}

export async function getAdminNeedsPage({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PagedResult<WorkshopNeed & { workshop?: Workshop }>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshop_needs")
    .select("*, workshop:workshops(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count } = await query;
  const total = count ?? 0;

  return {
    items: (data ?? []) as (WorkshopNeed & { workshop?: Workshop })[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminPhotosPage({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PagedResult<WorkshopPhoto & { workshop?: Workshop }>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshop_photos")
    .select("*, workshop:workshops(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count } = await query;
  const total = count ?? 0;

  return {
    items: (data ?? []) as (WorkshopPhoto & { workshop?: Workshop })[],
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
} = {}): Promise<PagedResult<WorkshopHelpOffer>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("workshop_help_offers")
    .select("*, workshop:workshops(id, name, slug), need:workshop_needs(id, title)")
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

  const { data, count } = await query;
  const total = count ?? 0;

  return {
    items: (data ?? []) as (WorkshopHelpOffer & { workshop?: { id: string; name: string; slug: string }; need?: { id: string; title: string } })[],
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

  const { data, count } = await query;
  const total = count ?? 0;
  const workshops = (data ?? []) as Workshop[];

  const needsCountMap = new Map<string, number>();
  if (workshops.length > 0) {
    const { data: needs } = await supabase
      .from("workshop_needs")
      .select("workshop_id")
      .in("workshop_id", workshops.map((w) => w.id))
      .eq("status", "publicada");

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
  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("status", "activo")
    .maybeSingle();
  return (data ?? null) as Workshop | null;
}

export async function getPublicWorkshopNeeds(
  workshopId: string,
): Promise<WorkshopNeed[]> {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("workshop_needs")
    .select("*")
    .eq("workshop_id", workshopId)
    .eq("status", "publicada")
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopNeed[];
}

export async function getPublicWorkshopPhotos(
  workshopId: string,
): Promise<WorkshopPhoto[]> {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("workshop_photos")
    .select("*")
    .eq("workshop_id", workshopId)
    .eq("status", "aprobada")
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopPhoto[];
}

export async function getPublicNeedsPage({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PagedResult<WorkshopNeed & { workshop?: Workshop }>> {
  const supabase = createSupabasePublicClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await supabase
    .from("workshop_needs")
    .select("*, workshop:workshops!inner(*)")
    .eq("status", "publicada")
    .eq("workshop.status", "activo")
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return {
    items: (data ?? []) as (WorkshopNeed & { workshop?: Workshop })[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

// ---- Panel queries (by user_id) ----
export async function getWorkshopByUserId(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshops")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data ?? null) as Workshop | null;
}

export async function getWorkshopNeeds(workshopId: string): Promise<WorkshopNeed[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshop_needs")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  return (data ?? []) as WorkshopNeed[];
}

export async function getWorkshopPhotos(workshopId: string): Promise<WorkshopPhoto[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshop_photos")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
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

  const { data } = await admin
    .from("workshop_activation_tokens")
    .select("*, workshop:workshops(*)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  return (data ?? null) as (WorkshopActivationToken & { workshop?: Workshop }) | null;
}

export async function getWorkshopActivationWorkshop(rawToken: string) {
  const token = await findWorkshopActivationToken(rawToken);
  if (!token) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workshops")
    .select("*")
    .eq("id", token.workshop_id)
    .maybeSingle();
  return (data ?? null) as Workshop | null;
}

export async function getAdminCartucheraDonationsPage({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PagedResult<CartucheraDonation>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count } = await admin
    .from("cartuchera_donations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;

  return {
    items: (data ?? []) as CartucheraDonation[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}
