import type {
  AssignedTaskBoardItem,
  DeliveryDetail,
  DeliveryWithRelations,
  RequesterDeliveryWithRelations,
  RawMaterial,
  RawMaterialMovementWithRelations,
  TaskMaterialAssignment,
  TaskIncident,
  PagedResult,
} from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

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

function sanitizeTaskSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

const TASK_LIST_FIELDS = `
  id,
  ally_id,
  aid_request_id,
  title,
  description,
  expected_output,
  urgency,
  status,
  assigned_at,
  due_date,
  completed_at,
  created_at,
  updated_at,
  ally:allies(id, name, slug)
`;

const TASK_BASE_FIELDS = `
  id,
  ally_id,
  aid_request_id,
  title,
  description,
  expected_output,
  urgency,
  status,
  admin_notes,
  ally_notes,
  assigned_at,
  due_date,
  completed_at,
  published_at,
  closed_at,
  created_at,
  updated_at,
  ally:allies(id, name, slug)
`;

const TASK_DETAIL_FIELDS = `
  id,
  ally_id,
  aid_request_id,
  title,
  description,
  expected_output,
  urgency,
  status,
  admin_notes,
  ally_notes,
  assigned_at,
  due_date,
  completed_at,
  published_at,
  closed_at,
  created_at,
  updated_at,
  ally:allies(id, name, slug),
  material_assignments:ally_raw_material_assignments(
    id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
    unit, status, assigned_at, delivered_at, notes, created_at, updated_at,
    raw_material:raw_materials(id, name, unit, stock_quantity, status)
  ),
  deliveries:ally_deliveries(
    id, ally_id, task_id, title, description, quantity, status, scheduled_for,
    delivered_at, received_at, received_by, notes, created_at, updated_at
  ),
  incidents:task_incidents(
    id, task_id, created_by_user_id, created_by_role, description, status,
    resolution_notes, resolved_by_user_id, resolved_at, created_at, updated_at
  )
`;

export async function getTaskBoardPage({
  page = 1,
  limit = 20,
  status,
  q,
  allyId,
}: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  allyId?: string;
} = {}): Promise<PagedResult<AssignedTaskBoardItem>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("assigned_tasks")
    .select(TASK_LIST_FIELDS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (allyId) query = query.eq("ally_id", allyId);
  const searchTerm = q ? sanitizeTaskSearchTerm(q) : "";
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,expected_output.ilike.%${searchTerm}%`);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las tareas");
  const total = count ?? 0;

  return {
    items: (data ?? []).map((task) => normalizeTask(task)) as unknown as AssignedTaskBoardItem[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export const getAdminTaskBoardPage = getTaskBoardPage;

export async function getAllyTaskBoardPage(allyId: string, options: Omit<Parameters<typeof getTaskBoardPage>[0], "allyId"> = {}) {
  return getTaskBoardPage({ ...options, allyId });
}

export async function getAdminTaskBoard(): Promise<AssignedTaskBoardItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(TASK_DETAIL_FIELDS)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas del tablero");
  return (data ?? []).map((task) => normalizeTask(task)) as unknown as AssignedTaskBoardItem[];
}

export async function getAllyTaskBoard(allyId: string): Promise<AssignedTaskBoardItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(TASK_DETAIL_FIELDS)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas del aliado");
  return (data ?? []).map((task) => normalizeTask(task)) as unknown as AssignedTaskBoardItem[];
}

export async function getAdminTaskById(taskId: string): Promise<AssignedTaskBoardItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(TASK_BASE_FIELDS)
    .eq("id", taskId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar la tarea");
  return data ? normalizeTask(data) as unknown as AssignedTaskBoardItem : null;
}

export async function getAllyTaskById(allyId: string, taskId: string): Promise<AssignedTaskBoardItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(TASK_BASE_FIELDS)
    .eq("id", taskId)
    .eq("ally_id", allyId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar la tarea");
  return data ? normalizeTask(data) as unknown as AssignedTaskBoardItem : null;
}

export async function getTaskRelationCounts(taskId: string, allyId?: string) {
  const supabase = await createSupabaseServerClient();
  const assignmentQuery = supabase
    .from("ally_raw_material_assignments")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);
  const deliveryQuery = supabase
    .from("ally_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);
  const incidentQuery = supabase
    .from("task_incidents")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);

  const [assignments, deliveries, incidents] = await Promise.all([
    allyId ? assignmentQuery.eq("ally_id", allyId) : assignmentQuery,
    allyId ? deliveryQuery.eq("ally_id", allyId) : deliveryQuery,
    incidentQuery,
  ]);

  assertQueryOk(assignments.error, "No se pudo contar la materia prima de la tarea");
  assertQueryOk(deliveries.error, "No se pudieron contar las entregas de la tarea");
  assertQueryOk(incidents.error, "No se pudieron contar las incidencias de la tarea");

  return {
    assignments: assignments.count ?? 0,
    deliveries: deliveries.count ?? 0,
    incidents: incidents.count ?? 0,
  };
}

export async function getTaskMaterialAssignments(taskId: string, allyId?: string): Promise<TaskMaterialAssignment[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("ally_raw_material_assignments")
    .select(`
      id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
      unit, status, assigned_at, delivered_at, notes, created_at, updated_at
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (allyId) query = query.eq("ally_id", allyId);

  const { data, error } = await query;
  assertQueryOk(error, "No se pudo cargar la materia prima de la tarea");
  return (data ?? []) as unknown as TaskMaterialAssignment[];
}

export async function getTaskMaterialAssignmentsPage({
  taskId,
  allyId,
  page = 1,
  limit = 20,
}: {
  taskId: string;
  allyId?: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<TaskMaterialAssignment>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("ally_raw_material_assignments")
    .select(`
      id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
      unit, status, assigned_at, delivered_at, notes, created_at, updated_at
    `, { count: "exact" })
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (allyId) query = query.eq("ally_id", allyId);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudo cargar la materia prima de la tarea");
  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as TaskMaterialAssignment[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getTaskDeliveriesPage({
  taskId,
  allyId,
  page = 1,
  limit = 20,
}: {
  taskId: string;
  allyId?: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<DeliveryWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, description, quantity, status, scheduled_for,
      delivered_at, received_at, received_by, notes, created_at, updated_at
    `, { count: "exact" })
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (allyId) query = query.eq("ally_id", allyId);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las entregas de la tarea");
  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as DeliveryWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getTaskIncidentsPage({
  taskId,
  page = 1,
  limit = 20,
}: {
  taskId: string;
  page?: number;
  limit?: number;
}): Promise<PagedResult<TaskIncident>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count, error } = await supabase
    .from("task_incidents")
    .select(`
      id, task_id, created_by_user_id, created_by_role, description, status,
      resolution_notes, resolved_by_user_id, resolved_at, created_at, updated_at
    `, { count: "exact" })
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .range(from, to);

  assertQueryOk(error, "No se pudieron cargar las incidencias de la tarea");
  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as TaskIncident[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)")
    .order("name", { ascending: true });

  assertQueryOk(error, "No se pudo cargar la materia prima");
  return (data ?? []) as unknown as RawMaterial[];
}

export async function getRawMaterialsPage({
  page = 1,
  limit = 20,
  allyId,
  status,
  q,
}: {
  page?: number;
  limit?: number;
  allyId?: string;
  status?: string;
  q?: string;
} = {}): Promise<PagedResult<RawMaterial>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (allyId) query = query.eq("ally_id", allyId);
  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudo cargar la materia prima");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as RawMaterial[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getRawMaterialById(id: string): Promise<RawMaterial | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)")
    .eq("id", id)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar la materia prima");
  return (data ?? null) as RawMaterial | null;
}

export async function getAllyRawMaterials(allyId: string): Promise<RawMaterial[]> {
  const supabase = await createSupabaseServerClient();
  const { data: ownMaterials, error: ownError } = await supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)")
    .eq("ally_id", allyId)
    .order("name", { ascending: true });
  assertQueryOk(ownError, "No se pudo cargar el inventario propio del aliado");

  const { data: assignments, error: assignmentError } = await supabase
    .from("ally_raw_material_assignments")
    .select("raw_material_id")
    .eq("ally_id", allyId)
    .not("raw_material_id", "is", null);
  assertQueryOk(assignmentError, "No se pudieron cargar las asignaciones del aliado");

  const assignedIds = [...new Set((assignments ?? []).map((assignment) => assignment.raw_material_id).filter(Boolean))] as string[];
  if (!assignedIds.length) return (ownMaterials ?? []) as unknown as RawMaterial[];

  const { data: assignedMaterials, error: assignedError } = await supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)")
    .in("id", assignedIds)
    .order("name", { ascending: true });
  assertQueryOk(assignedError, "No se pudo cargar la materia prima asignada");

  const materials = new Map<string, RawMaterial>();
  for (const material of [...(ownMaterials ?? []), ...(assignedMaterials ?? [])]) {
    materials.set(material.id, material as unknown as RawMaterial);
  }
  return [...materials.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllyRawMaterialsPage({
  allyId,
  page = 1,
  limit = 20,
  status,
  q,
}: {
  allyId: string;
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}): Promise<PagedResult<RawMaterial>> {
  const supabase = await createSupabaseServerClient();
  const [ownMaterials, assignments] = await Promise.all([
    supabase.from("raw_materials").select("id").eq("ally_id", allyId),
    supabase.from("ally_raw_material_assignments").select("raw_material_id").eq("ally_id", allyId).not("raw_material_id", "is", null),
  ]);
  assertQueryOk(ownMaterials.error, "No se pudo cargar el inventario propio del aliado");
  assertQueryOk(assignments.error, "No se pudieron cargar las asignaciones del aliado");

  const materialIds = [...new Set([
    ...(ownMaterials.data ?? []).map((material) => material.id),
    ...(assignments.data ?? []).map((assignment) => assignment.raw_material_id).filter(Boolean),
  ])] as string[];

  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!materialIds.length) {
    return { items: [], total: 0, page, limit, pageCount: 1 };
  }

  let query = supabase
    .from("raw_materials")
    .select("id, ally_id, name, category, unit, description, stock_quantity, notes, status, created_at, updated_at, ally:allies(id, name, slug)", { count: "exact" })
    .in("id", materialIds)
    .order("name", { ascending: true })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudo cargar el inventario del aliado");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as RawMaterial[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getRawMaterialMovements(): Promise<RawMaterialMovementWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raw_material_movements")
    .select(`
      id, raw_material_id, related_task_id, related_assignment_id, movement_type,
      quantity_change, balance_after, notes, created_by_user_id, created_at,
      raw_material:raw_materials(id, name, unit, status),
      task:assigned_tasks(id, title, status),
      assignment:ally_raw_material_assignments(id, name_snapshot, ally_id)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  assertQueryOk(error, "No se pudieron cargar los movimientos de materia prima");
  return (data ?? []) as unknown as RawMaterialMovementWithRelations[];
}

export async function getRawMaterialMovementsPage({
  page = 1,
  limit = 20,
  rawMaterialId,
}: {
  page?: number;
  limit?: number;
  rawMaterialId?: string;
} = {}): Promise<PagedResult<RawMaterialMovementWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("raw_material_movements")
    .select(`
      id, raw_material_id, related_task_id, related_assignment_id, movement_type,
      quantity_change, balance_after, notes, created_by_user_id, created_at,
      raw_material:raw_materials(id, name, unit, status),
      task:assigned_tasks(id, title, status),
      assignment:ally_raw_material_assignments(id, name_snapshot, ally_id)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (rawMaterialId) query = query.eq("raw_material_id", rawMaterialId);
  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los movimientos de materia prima");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as RawMaterialMovementWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminMaterialAssignments(): Promise<TaskMaterialAssignment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_raw_material_assignments")
    .select(`
      id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
      unit, status, assigned_at, delivered_at, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date),
      raw_material:raw_materials(id, name, unit, stock_quantity, status)
    `)
    .order("assigned_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las asignaciones de materia prima");
  return (data ?? []) as unknown as TaskMaterialAssignment[];
}

export async function getMaterialAssignmentsPage({
  page = 1,
  limit = 20,
  allyId,
}: {
  page?: number;
  limit?: number;
  allyId?: string;
} = {}): Promise<PagedResult<TaskMaterialAssignment>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("ally_raw_material_assignments")
    .select(`
      id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
      unit, status, assigned_at, delivered_at, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `, { count: "exact" })
    .order("assigned_at", { ascending: false })
    .range(from, to);

  if (allyId) query = query.eq("ally_id", allyId);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las asignaciones de materia prima");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as TaskMaterialAssignment[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAllyMaterialAssignments(allyId: string): Promise<TaskMaterialAssignment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_raw_material_assignments")
    .select(`
      id, ally_id, raw_material_id, task_id, name_snapshot, quantity, used_quantity,
      unit, status, assigned_at, delivered_at, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .eq("ally_id", allyId)
    .order("assigned_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las asignaciones del aliado");
  return (data ?? []) as unknown as TaskMaterialAssignment[];
}

export async function getAllyTaskOptionsForDelivery(allyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select("id, title, status, expected_output")
    .eq("ally_id", allyId)
    .in("status", ["completada", "cerrada"])
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas para entrega");
  return (data ?? []).map((task) => ({
    ...task,
    requested_items: task.expected_output ?? null,
  }));
}

export async function getAdminDeliveries(): Promise<DeliveryWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, description, quantity, status, scheduled_for,
      delivered_at, received_at, received_by, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las entregas");
  return (data ?? []) as unknown as DeliveryWithRelations[];
}

export async function getDeliveriesPage({
  page = 1,
  limit = 20,
  allyId,
  status,
}: {
  page?: number;
  limit?: number;
  allyId?: string;
  status?: string;
} = {}): Promise<PagedResult<DeliveryWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, quantity, status, scheduled_for,
      delivered_at, received_at, created_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (allyId) query = query.eq("ally_id", allyId);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las entregas");
  const total = count ?? 0;

  return {
    items: (data ?? []) as unknown as DeliveryWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getDeliveryById(deliveryId: string): Promise<DeliveryDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, description, quantity, status, scheduled_for,
      delivered_at, received_at, received_by, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(
        id, title, status, due_date, aid_request_id,
        request:aid_requests(id, title, requester_id)
      )
    `)
    .eq("id", deliveryId)
    .maybeSingle();

  assertQueryOk(error, "No se pudo cargar la entrega");
  return (data ?? null) as unknown as DeliveryDetail | null;
}

export async function getRequesterDeliveriesPage({
  requesterId,
  page = 1,
  limit = 20,
  status,
}: {
  requesterId: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PagedResult<RequesterDeliveryWithRelations>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, quantity, status, scheduled_for,
      delivered_at, received_at, created_at,
      task:assigned_tasks!inner(
        id, title, status, due_date, aid_request_id,
        request:aid_requests!inner(id, title, requester_id)
      )
    `, { count: "exact" })
    .eq("task.request.requester_id", requesterId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;

  assertQueryOk(error, "No se pudieron cargar tus entregas");
  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as RequesterDeliveryWithRelations[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAllyDeliveries(allyId: string): Promise<DeliveryWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_deliveries")
    .select(`
      id, ally_id, task_id, title, description, quantity, status, scheduled_for,
      delivered_at, received_at, received_by, notes, created_at, updated_at,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las entregas del aliado");
  return (data ?? []) as unknown as DeliveryWithRelations[];
}

export async function getActiveAlliesForSelect() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("allies")
    .select("id, name, slug")
    .in("status", ["activo", "pausado", "approved_pending_activation"])
    .order("name", { ascending: true });

  assertQueryOk(error, "No se pudieron cargar los aliados");
  return data ?? [];
}

export async function getTaskOptionsForDelivery() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select("id, title, status, ally:allies(id, name)")
    .in("status", ["completada", "cerrada"])
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas para entrega");
  return (data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    ally: Array.isArray(task.ally) ? task.ally[0] ?? null : task.ally ?? null,
  })) as Array<{
    id: string;
    title: string;
    status: string;
    ally: { id: string; name: string } | null;
  }>;
}
