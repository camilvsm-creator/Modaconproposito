import { getMessageThreadsPage } from "@/lib/messages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardNotification = {
  id: string;
  type: "message" | "ally" | "volunteer";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function getAdminDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: activeAllies, error: activeAlliesError },
    { count: activeTasks, error: activeTasksError },
    { count: activeVolunteers, error: activeVolunteersError },
    { count: allyPostulationsCount, error: allyPostulationsCountError },
    { count: volunteerPostulationsCount, error: volunteerPostulationsCountError },
    { data: allyPostulations, error: allyPostulationsError },
    { data: volunteerPostulations, error: volunteerPostulationsError },
    messageThreads,
  ] = await Promise.all([
    supabase.from("allies").select("id", { count: "exact", head: true }).eq("status", "activo"),
    supabase.from("assigned_tasks").select("id", { count: "exact", head: true }).in("status", ["asignada", "en_progreso"]),
    supabase.from("ally_volunteer_assignments").select("id", { count: "exact", head: true }).eq("status", "activo"),
    supabase.from("allies").select("id", { count: "exact", head: true }).in("status", ["pendiente", "approved_pending_activation"]),
    supabase.from("volunteers").select("id", { count: "exact", head: true }).eq("status", "postulado"),
    supabase
      .from("allies")
      .select("id, name, category, status, created_at")
      .in("status", ["pendiente", "approved_pending_activation"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("volunteers")
      .select("id, name, skills, status, created_at")
      .eq("status", "postulado")
      .order("created_at", { ascending: false })
      .limit(5),
    getMessageThreadsPage({ page: 1, limit: 50 }),
  ]);

  assertQueryOk(activeAlliesError, "No se pudo contar los aliados activos");
  assertQueryOk(activeTasksError, "No se pudo contar las tareas activas");
  assertQueryOk(activeVolunteersError, "No se pudo contar los voluntarios activos");
  assertQueryOk(allyPostulationsCountError, "No se pudo contar las postulaciones de aliados");
  assertQueryOk(volunteerPostulationsCountError, "No se pudo contar las postulaciones de voluntarios");
  assertQueryOk(allyPostulationsError, "No se pudieron cargar las postulaciones de aliados");
  assertQueryOk(volunteerPostulationsError, "No se pudieron cargar las postulaciones de voluntarios");

  const notifications: AdminDashboardNotification[] = [
    ...messageThreads.items
      .filter((thread) => thread.is_unread && thread.latest_message)
      .map((thread) => ({
        id: `message-${thread.id}`,
        type: "message" as const,
        title: "Nuevo mensaje",
        description: `${thread.ally?.name ?? thread.requester?.name ?? "Destinatario"}: ${thread.subject}`,
        href: `/admin/mensajes/${thread.id}`,
        createdAt: thread.latest_message?.created_at ?? thread.updated_at,
      })),
    ...(allyPostulations ?? []).map((ally) => ({
      id: `ally-${ally.id}`,
      type: "ally" as const,
      title: "Nueva postulación de aliado",
      description: `${ally.name} · ${ally.category}`,
      href: `/admin/aliados/${ally.id}`,
      createdAt: ally.created_at,
    })),
    ...(volunteerPostulations ?? []).map((volunteer) => ({
      id: `volunteer-${volunteer.id}`,
      type: "volunteer" as const,
      title: "Nueva postulación de voluntario",
      description: `${volunteer.name}${volunteer.skills ? ` · ${volunteer.skills}` : ""}`,
      href: "/admin/voluntarios?tab=postulaciones",
      createdAt: volunteer.created_at,
    })),
  ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()).slice(0, 8);

  return {
    stats: {
      activeAllies: activeAllies ?? 0,
      activeTasks: activeTasks ?? 0,
      activeVolunteers: activeVolunteers ?? 0,
      unreadMessages: messageThreads.items.filter((thread) => thread.is_unread).length,
      allyPostulations: allyPostulationsCount ?? 0,
      volunteerPostulations: volunteerPostulationsCount ?? 0,
    },
    notifications,
  };
}
