import crypto from "crypto";
import { cache } from "react";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AllyVolunteerAssignmentWithRelations,
  CartucheraDonation,
  Collaborator,
  Workshop,
  WorkshopActivationToken,
  WorkshopHelpOfferWithRelations,
  WorkshopListItem,
  WorkshopNeed,
  WorkshopNeedWithWorkshopName,
  WorkshopPhoto,
  WorkshopVolunteer,
  Volunteer,
  PagedResult,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { HELP_TYPE_GROUPS } from "@/lib/constants";

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function sanitizeAllySearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

const ALLY_DETAIL_FIELDS = `
  id, user_id, category, name, slug, responsible_name, email, phone, whatsapp,
  instagram, state, city, municipality, public_location, description, what_they_do,
  initial_photo_path, avatar_path, identity_document, public_name_allowed,
  public_location_allowed, public_instagram_allowed, public_whatsapp_allowed,
  status, admin_notes, approved_by, approved_at, rejected_at, created_at, updated_at
`;

const TASK_FIELDS = `
  id, ally_id, aid_request_id, title, description, expected_output,
  urgency, status, admin_notes, ally_notes, assigned_at, due_date, completed_at,
  published_at, closed_at, created_at, updated_at
`;

const OFFER_FIELDS = `
  id, ally_id, collaborator_id, aid_request_id, need_id, donor_name, donor_contact,
  donor_email, donor_phone, help_type, description, quantity, availability, location,
  status, admin_notes, created_at, updated_at
`;

function normalizeTask<T extends Record<string, unknown>>(task: T): T & {
  requested_items: string | null;
  workshop_id: string | null;
  workshop?: unknown;
} {
  return {
    ...task,
    requested_items: (task.expected_output as string | null | undefined) ?? null,
    workshop_id: (task.ally_id as string | null | undefined) ?? null,
    workshop: task.ally,
  };
}

function normalizeTasks<T extends Record<string, unknown>>(tasks: T[] | null): Array<T & { requested_items: string | null }> {
  return (tasks ?? []).map((task) => normalizeTask(task));
}

function normalizeOffer<T extends Record<string, unknown>>(offer: T): T & { workshop?: unknown; need?: unknown } {
  return {
    ...offer,
    workshop: offer.ally,
    need: offer.task,
  };
}

export async function generateWorkshopSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "aliado";

  const admin = await createSupabaseServerClient();
  const { data } = await admin
    .from("allies")
    .select("slug")
    .like("slug", `${base}%`);

  const existing = new Set(data?.map((r) => r.slug) ?? []);
  if (!existing.has(base)) return base;

  let counter = 1;
  while (existing.has(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

export const generateAllySlug = generateWorkshopSlug;

export async function getAdminWorkshopsPage({
  page = 1,
  limit = 20,
  status,
  category,
  tab,
  q,
}: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  tab?: "postulaciones" | "aliados";
  q?: string;
} = {}): Promise<PagedResult<WorkshopListItem>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("allies")
    .select("id, user_id, category, name, responsible_name, city, state, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const activeStatuses = ["activo", "pausado", "rechazado", "desactivado"];
  const postulationStatuses = ["pendiente", "approved_pending_activation"];

  if (tab === "postulaciones") {
    query = query.in("status", postulationStatuses);
  } else if (tab === "aliados") {
    query = query.in("status", activeStatuses);
  }

  if (status && status !== "all") query = query.eq("status", status);
  if (category && category !== "all") query = query.eq("category", category);
  const searchTerm = q ? sanitizeAllySearchTerm(q) : "";
  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,responsible_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
    );
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los aliados");

  return {
    items: (data ?? []) as WorkshopListItem[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export const getAdminAlliesPage = getAdminWorkshopsPage;

export async function getAdminWorkshopById(id: string) {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin.from("allies").select(ALLY_DETAIL_FIELDS).eq("id", id).maybeSingle();
  assertQueryOk(error, "No se pudo cargar el aliado");
  return (data ?? null) as Workshop | null;
}

export const getAdminAllyById = getAdminWorkshopById;

export async function getAdminWorkshopNeeds(allyId: string): Promise<WorkshopNeed[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("assigned_tasks")
    .select(TASK_FIELDS)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las tareas del aliado");
  return normalizeTasks(data) as unknown as WorkshopNeed[];
}

export async function getAdminWorkshopNeedsPage({
  allyId,
  page = 1,
  limit = 20,
}: {
  allyId: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<WorkshopNeed>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await admin
    .from("assigned_tasks")
    .select(TASK_FIELDS, { count: "exact" })
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las tareas del aliado");

  const total = count ?? 0;
  return {
    items: normalizeTasks(data) as unknown as WorkshopNeed[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export const getAdminAllyTasks = getAdminWorkshopNeeds;

export async function getAdminWorkshopPhotos(allyId: string): Promise<WorkshopPhoto[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("ally_photos")
    .select("id, ally_id, title, description, storage_path, status, uploaded_by, reviewed_by, reviewed_at, created_at, updated_at")
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las fotos del aliado");
  return (data ?? []) as WorkshopPhoto[];
}

export async function getAdminWorkshopPhotosPage({
  allyId,
  page = 1,
  limit = 20,
}: {
  allyId: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<WorkshopPhoto>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await admin
    .from("ally_photos")
    .select("id, ally_id, title, description, storage_path, status, uploaded_by, reviewed_by, reviewed_at, created_at, updated_at", { count: "exact" })
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las fotos del aliado");

  const total = count ?? 0;
  return {
    items: (data ?? []) as WorkshopPhoto[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
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
    .from("assigned_tasks")
    .select(`${TASK_FIELDS}, ally:allies(id, name)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las tareas");

  return {
    items: normalizeTasks(data) as unknown as WorkshopNeedWithWorkshopName[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
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
    .from("collaborator_offers")
    .select(`${OFFER_FIELDS}, ally:allies(id, name, slug), task:assigned_tasks(id, title)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (tipo && tipo !== "all") {
    const group = HELP_TYPE_GROUPS.find((g) => g.label.toLowerCase() === tipo.toLowerCase());
    if (group) query = query.in("help_type", [...group.options]);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las ofertas de colaboradores");

  return {
    items: (data ?? []).map((offer) => normalizeOffer(offer)) as unknown as WorkshopHelpOfferWithRelations[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export async function getAdminVolunteersPage({
  page = 1,
  limit = 20,
  q,
}: {
  page?: number;
  limit?: number;
  q?: string;
} = {}): Promise<PagedResult<WorkshopVolunteer>> {
  const admin = createSupabaseAdminClient();
  return getAdminVolunteersPageFromClient(admin, { page, limit, q });
}

export async function getAdminVolunteersPageFromClient(
  client: SupabaseClient,
  {
    page = 1,
    limit = 20,
    q,
  }: {
    page?: number;
    limit?: number;
    q?: string;
  } = {},
): Promise<PagedResult<WorkshopVolunteer>> {
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from("ally_volunteer_assignments")
    .select("id, ally_id, volunteer_id, name, role, phone, instagram, status, assigned_at, notes, created_at, updated_at", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los voluntarios asignados");

  return {
    items: (data ?? []) as WorkshopVolunteer[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export async function getAdminCollaboratorsPage({
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
} = {}): Promise<PagedResult<Collaborator>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("collaborators")
    .select("id, name, type, contact_name, email, phone, location, notes, status, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,contact_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  if (status && status !== "all") query = query.eq("status", status);
  if (type && type !== "all") query = query.eq("type", type);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los colaboradores");

  return {
    items: (data ?? []) as Collaborator[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export async function getAdminVolunteerAssignments(): Promise<AllyVolunteerAssignmentWithRelations[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("ally_volunteer_assignments")
    .select(`
      *,
      ally:allies(id, name, slug),
      volunteer:volunteers(*)
    `)
    .order("assigned_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las asignaciones de voluntarios");
  return (data ?? []) as AllyVolunteerAssignmentWithRelations[];
}

export async function getAdminVolunteerAssignmentsPage({
  page = 1,
  limit = 20,
  q,
  allyId,
}: {
  page?: number;
  limit?: number;
  q?: string;
  allyId?: string;
} = {}): Promise<PagedResult<AllyVolunteerAssignmentWithRelations>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = admin
    .from("ally_volunteer_assignments")
    .select(`
      id, ally_id, volunteer_id, name, role, phone, instagram, status,
      assigned_at, notes, created_at, updated_at,
      ally:allies(id, name, slug)
    `, { count: "exact" })
    .eq("status", "activo")
    .order("assigned_at", { ascending: false })
    .range(from, to);
  if (allyId) query = query.eq("ally_id", allyId);
  if (q) query = query.or(`name.ilike.%${q}%,role.ilike.%${q}%,phone.ilike.%${q}%,instagram.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las asignaciones de voluntarios");
  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as AllyVolunteerAssignmentWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminVolunteerListPage({
  page = 1,
  limit = 20,
  q,
  statuses,
}: {
  page?: number;
  limit?: number;
  q?: string;
  statuses?: string[];
} = {}): Promise<PagedResult<Volunteer>> {
  const admin = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = admin
    .from("volunteers")
    .select("id, name, email, phone, instagram, skills, availability, state, city, notes, status, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (statuses?.length) query = query.in("status", statuses);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,skills.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los voluntarios");
  const total = count ?? 0;
  return {
    items: (data ?? []) as Volunteer[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getActiveVolunteers() {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("volunteers")
    .select("id, name, email, phone, instagram, skills, availability, state, city, notes, status, created_at, updated_at")
    .eq("status", "activo")
    .order("name", { ascending: true });

  assertQueryOk(error, "No se pudieron cargar los voluntarios activos");
  return data ?? [];
}

export async function getAllVolunteers() {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("volunteers")
    .select("id, name, email, phone, instagram, skills, availability, state, city, notes, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar los voluntarios");
  return data ?? [];
}

export async function getPublicWorkshopsPage({
  page = 1,
  limit = 12,
  q,
  state,
  city,
  category,
}: {
  page?: number;
  limit?: number;
  q?: string;
  state?: string;
  city?: string;
  category?: string;
} = {}): Promise<PagedResult<Workshop & { needs_count: number }>> {
  const supabase = createSupabasePublicClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("allies")
    .select(ALLY_DETAIL_FIELDS, { count: "exact" })
    .eq("status", "activo")
    .order("name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`name.ilike.%${q}%,what_they_do.ilike.%${q}%,city.ilike.%${q}%`);
  if (state) query = query.eq("state", state);
  if (city) query = query.eq("city", city);
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los aliados públicos");
  const allies = (data ?? []) as Workshop[];

  const tasksCountMap = new Map<string, number>();
  if (allies.length > 0) {
    const { data: tasks, error: tasksError } = await supabase
      .from("assigned_tasks")
      .select("ally_id")
      .in("ally_id", allies.map((a) => a.id))
      .eq("status", "publicada");
    assertQueryOk(tasksError, "No se pudo cargar el conteo de tareas públicas");

    for (const task of tasks ?? []) {
      tasksCountMap.set(task.ally_id, (tasksCountMap.get(task.ally_id) ?? 0) + 1);
    }
  }

  return {
    items: allies.map((ally) => ({ ...ally, needs_count: tasksCountMap.get(ally.id) ?? 0 })),
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export const getPublicAlliesPage = getPublicWorkshopsPage;

export async function getPublicWorkshopBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("allies")
    .select(ALLY_DETAIL_FIELDS)
    .eq("slug", slug)
    .eq("status", "activo")
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el aliado público");
  return (data ?? null) as Workshop | null;
}

export const getPublicAllyBySlug = getPublicWorkshopBySlug;

export async function getPublicWorkshopNeeds(allyId: string): Promise<WorkshopNeed[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select("id, title, description, expected_output, urgency, status, created_at")
    .eq("ally_id", allyId)
    .eq("status", "publicada")
    .order("created_at", { ascending: false })
    .limit(50);
  assertQueryOk(error, "No se pudieron cargar las tareas públicas del aliado");
  return normalizeTasks(data) as unknown as WorkshopNeed[];
}

export async function getPublicWorkshopPhotos(allyId: string): Promise<WorkshopPhoto[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("ally_photos")
    .select("id, title, description, storage_path, status, created_at")
    .eq("ally_id", allyId)
    .eq("status", "aprobada")
    .order("created_at", { ascending: false })
    .limit(50);
  assertQueryOk(error, "No se pudieron cargar las fotos públicas del aliado");
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
    .from("assigned_tasks")
    .select(`${TASK_FIELDS}, ally:allies!inner(id, name, slug, status)`, { count: "exact" })
    .eq("status", "publicada")
    .eq("ally.status", "activo")
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las tareas públicas");

  return {
    items: normalizeTasks(data) as unknown as WorkshopNeedWithWorkshopName[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}

export const getWorkshopByUserId = cache(async (userId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("allies")
    .select(ALLY_DETAIL_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el aliado del usuario");
  return (data ?? null) as Workshop | null;
});

export const getAllyByUserId = getWorkshopByUserId;

export const getWorkshopAvatarPath = cache(async (userId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("allies")
    .select("avatar_path")
    .eq("user_id", userId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el avatar del aliado");
  return data?.avatar_path ?? null;
});

export const getUserLinkedWorkshops = cache(async (userId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("user_allies")
    .select("ally:allies(id, name, slug, avatar_path)")
    .eq("user_id", userId);
  assertQueryOk(error, "No se pudieron cargar los aliados vinculados");
  if (!data) return [];
  return data
    .map((row) => row.ally as unknown as { id: string; name: string; slug: string; avatar_path: string | null })
    .filter(Boolean);
});

export const getUserLinkedAllies = getUserLinkedWorkshops;

export const getWorkshopById = cache(async (allyId: string) => {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("allies")
    .select(ALLY_DETAIL_FIELDS)
    .eq("id", allyId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el aliado");
  return (data ?? null) as Workshop | null;
});

export const getAllyById = getWorkshopById;

export async function getWorkshopNeeds(allyId: string): Promise<WorkshopNeed[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("assigned_tasks")
    .select(TASK_FIELDS)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las tareas del panel");
  return normalizeTasks(data) as unknown as WorkshopNeed[];
}

export const getAllyTasks = getWorkshopNeeds;

export async function getWorkshopPhotos(allyId: string): Promise<WorkshopPhoto[]> {
  const admin = await createSupabaseServerClient();
  const { data, error } = await admin
    .from("ally_photos")
    .select("id, ally_id, title, description, storage_path, status, uploaded_by, reviewed_by, reviewed_at, created_at, updated_at")
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });
  assertQueryOk(error, "No se pudieron cargar las fotos del panel");
  return (data ?? []) as WorkshopPhoto[];
}

export async function createWorkshopActivationToken(
  allyId: string,
  createdByUserId?: string | null,
) {
  const admin = createSupabaseAdminClient();
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { error: invalidateError } = await admin
    .from("ally_activation_tokens")
    .update({ used_at: now })
    .eq("ally_id", allyId)
    .is("used_at", null);

  if (invalidateError) throw new Error(invalidateError.message);

  const { error } = await admin.from("ally_activation_tokens").insert({
    ally_id: allyId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by_user_id: createdByUserId ?? null,
  });

  if (error) throw new Error(error.message);

  const activationUrl = new URL("/admin/activar-aliado", getSiteUrl());
  activationUrl.searchParams.set("token", token);

  return { token, activationLink: activationUrl.toString(), expiresAt };
}

export const createAllyActivationToken = createWorkshopActivationToken;

export async function findWorkshopActivationToken(rawToken: string) {
  const admin = createSupabaseAdminClient();
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data, error } = await admin
    .from("ally_activation_tokens")
    .select(`id, ally_id, token_hash, expires_at, used_at, created_by_user_id, created_at, ally:allies(${ALLY_DETAIL_FIELDS})`)
    .eq("token_hash", tokenHash)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el token de activación");

  if (!data) return null;
  return { ...data, workshop: data.ally } as unknown as (WorkshopActivationToken & { workshop?: Workshop; ally?: Workshop });
}

export const findAllyActivationToken = findWorkshopActivationToken;

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
    .select("id, donor_name, donor_email, donor_phone, help_type, description, quantity, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  assertQueryOk(error, "No se pudieron cargar las donaciones de cartuchera");

  return {
    items: (data ?? []) as CartucheraDonation[],
    total: count ?? 0,
    page,
    limit,
    pageCount: Math.max(Math.ceil((count ?? 0) / limit), 1),
  };
}
