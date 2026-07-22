import type {
  AssignedTaskBoardItem,
  DeliveryWithRelations,
  RawMaterial,
  RawMaterialMovementWithRelations,
  TaskMaterialAssignment,
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

export async function getAdminTaskBoard(): Promise<AssignedTaskBoardItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(`
      *,
      ally:allies(id, name, slug),
      material_assignments:ally_raw_material_assignments(
        id,
        ally_id,
        raw_material_id,
        task_id,
        name_snapshot,
        quantity,
        used_quantity,
        unit,
        status,
        assigned_at,
        delivered_at,
        notes,
        created_at,
        updated_at,
        raw_material:raw_materials(id, name, unit, stock_quantity, status)
      ),
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
      ),
      incidents:task_incidents(
        id,
        task_id,
        created_by_user_id,
        created_by_role,
        description,
        status,
        resolution_notes,
        resolved_by_user_id,
        resolved_at,
        created_at,
        updated_at
      )
    `)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas del tablero");
  return (data ?? []).map((task) => normalizeTask(task)) as AssignedTaskBoardItem[];
}

export async function getAllyTaskBoard(allyId: string): Promise<AssignedTaskBoardItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assigned_tasks")
    .select(`
      *,
      ally:allies(id, name, slug),
      material_assignments:ally_raw_material_assignments(
        id,
        ally_id,
        raw_material_id,
        task_id,
        name_snapshot,
        quantity,
        used_quantity,
        unit,
        status,
        assigned_at,
        delivered_at,
        notes,
        created_at,
        updated_at
      ),
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
      ),
      incidents:task_incidents(
        id,
        task_id,
        created_by_user_id,
        created_by_role,
        description,
        status,
        resolution_notes,
        resolved_by_user_id,
        resolved_at,
        created_at,
        updated_at
      )
    `)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las tareas del aliado");
  return (data ?? []).map((task) => normalizeTask(task)) as AssignedTaskBoardItem[];
}

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raw_materials")
    .select("*")
    .order("name", { ascending: true });

  assertQueryOk(error, "No se pudo cargar la materia prima");
  return (data ?? []) as RawMaterial[];
}

export async function getRawMaterialMovements(): Promise<RawMaterialMovementWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("raw_material_movements")
    .select(`
      *,
      raw_material:raw_materials(id, name, unit, status),
      task:assigned_tasks(id, title, status),
      assignment:ally_raw_material_assignments(id, name_snapshot, ally_id)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  assertQueryOk(error, "No se pudieron cargar los movimientos de materia prima");
  return (data ?? []) as RawMaterialMovementWithRelations[];
}

export async function getAdminMaterialAssignments(): Promise<TaskMaterialAssignment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_raw_material_assignments")
    .select(`
      *,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date),
      raw_material:raw_materials(id, name, unit, stock_quantity, status)
    `)
    .order("assigned_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las asignaciones de materia prima");
  return (data ?? []) as TaskMaterialAssignment[];
}

export async function getAllyMaterialAssignments(allyId: string): Promise<TaskMaterialAssignment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_raw_material_assignments")
    .select(`
      *,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .eq("ally_id", allyId)
    .order("assigned_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las asignaciones del aliado");
  return (data ?? []) as TaskMaterialAssignment[];
}

export async function getAdminDeliveries(): Promise<DeliveryWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_deliveries")
    .select(`
      *,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las entregas");
  return (data ?? []) as DeliveryWithRelations[];
}

export async function getAllyDeliveries(allyId: string): Promise<DeliveryWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ally_deliveries")
    .select(`
      *,
      ally:allies(id, name, slug),
      task:assigned_tasks(id, title, status, due_date)
    `)
    .eq("ally_id", allyId)
    .order("created_at", { ascending: false });

  assertQueryOk(error, "No se pudieron cargar las entregas del aliado");
  return (data ?? []) as DeliveryWithRelations[];
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
