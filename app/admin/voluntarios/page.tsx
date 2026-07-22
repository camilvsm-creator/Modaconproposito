import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { SectionCard, compactInputClassName } from "@/components/ui";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { getActiveAlliesForSelect } from "@/lib/production";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveVolunteers, getAdminVolunteerAssignments } from "@/lib/workshops";
import { formatDate, formatPublicPhone } from "@/lib/utils";
import { VolunteerAdminActions } from "./components/volunteer-admin-actions";

const ROLE_BADGES: Record<string, string> = {
  COSTURERA: "bg-pink-100 text-pink-700",
  COSTURERO: "bg-pink-100 text-pink-700",
  "PATRONISTA DIGITAL": "bg-purple-100 text-purple-700",
  "DISEÑADOR DE MODA": "bg-indigo-100 text-indigo-700",
  LOGISTICA: "bg-blue-100 text-blue-700",
  VOLUNTARIA: "bg-green-100 text-green-700",
};

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function AdminVoluntariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopUser();

  if (user.app_metadata?.role === "aliado") {
    const supabase = await createSupabaseServerClient();
    const { data: ally } = await supabase.from("allies").select("id").eq("user_id", user.id).maybeSingle();
    const { data: assignments } = ally
      ? await supabase
          .from("ally_volunteer_assignments")
          .select("*")
          .eq("ally_id", ally.id)
          .order("assigned_at", { ascending: false })
      : { data: [] };

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Voluntarios"
          description="Voluntarios asignados a tu aliado por el equipo de Promoda."
          navigation={{ baseHref: "/admin/tareas", baseLabel: "Tareas", currentLabel: "Voluntarios" }}
        />

        {assignments?.length ? (
          <SectionCard className="overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                    <th className="px-4 py-2.5">Nombre</th>
                    <th className="px-4 py-2.5">Rol</th>
                    <th className="px-4 py-2.5">Telefono</th>
                    <th className="px-4 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-4 py-2.5 font-semibold text-ink">{assignment.name}</td>
                      <td className="px-4 py-2.5 text-stone-700">{assignment.role ?? "—"}</td>
                      <td className="px-4 py-2.5 text-stone-700">{assignment.phone ? formatPublicPhone(assignment.phone) : "—"}</td>
                      <td className="px-4 py-2.5 text-stone-700">{assignment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : (
          <EmptyState title="Sin voluntarios asignados" description="Las asignaciones de voluntariado aparecerán aquí." />
        )}
      </div>
    );
  }

  await requireWorkshopAdminUser();

  const params = await searchParams;
  const q = getStringParam(params, "q")?.toLowerCase();

  const [assignments, activeVolunteers, allies] = await Promise.all([
    getAdminVolunteerAssignments(),
    getActiveVolunteers(),
    getActiveAlliesForSelect(),
  ]);

  const activeAssignments = assignments.filter((assignment) => assignment.status === "activo");
  const assignedVolunteerIds = new Set(activeAssignments.map((assignment) => assignment.volunteer_id).filter(Boolean));
  const assignmentSummaryByVolunteerId = new Map<string, string[]>();

  for (const assignment of activeAssignments) {
    if (!assignment.volunteer_id || !assignment.ally?.name) continue;
    const current = assignmentSummaryByVolunteerId.get(assignment.volunteer_id) ?? [];
    current.push(assignment.ally.name);
    assignmentSummaryByVolunteerId.set(assignment.volunteer_id, current);
  }

  const filteredAssignments = activeAssignments.filter((assignment) => {
    if (!q) return true;
    return [assignment.name, assignment.role, assignment.ally?.name, assignment.phone, assignment.instagram]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  const unassignedVolunteers = activeVolunteers.filter((volunteer) => !assignedVolunteerIds.has(volunteer.id));
  const filteredUnassignedVolunteers = unassignedVolunteers.filter((volunteer) => {
    if (!q) return true;
    return [volunteer.name, volunteer.email, volunteer.phone, volunteer.instagram, volunteer.skills]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Voluntarios"
        description="Asigna voluntarios a aliados y consulta quiénes ya están asignados o disponibles."
        meta={`${activeVolunteers.length} voluntarios activos`}
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Voluntarios" }}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <form action="/admin/voluntarios" method="get" className="flex w-full max-w-md gap-3">
          <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, rol o aliado" className={compactInputClassName} />
          <button className="rounded-lg bg-[#F74897] px-5 py-2.5 text-sm font-semibold text-white" type="submit">Buscar</button>
        </form>

        <VolunteerAdminActions
          volunteers={activeVolunteers.map((volunteer) => {
            const assignedAllies = assignmentSummaryByVolunteerId.get(volunteer.id) ?? [];

            return {
              id: volunteer.id,
              name: volunteer.name,
              label: assignedAllies.length
                ? `${volunteer.name} - ya asignado a: ${assignedAllies.join(", ")}`
                : volunteer.name,
            };
          })}
          allies={allies.map((ally) => ({ id: ally.id, name: ally.name }))}
        />
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Voluntarios asignados</h2>
        </div>
        {filteredAssignments.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Aliado</th>
                  <th className="px-4 py-2.5">Rol</th>
                  <th className="px-4 py-2.5">Telefono</th>
                  <th className="px-4 py-2.5">Instagram</th>
                  <th className="px-4 py-2.5">Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5 align-top font-semibold text-ink">{assignment.name}</td>
                    <td className="px-4 py-2.5 align-top">
                      {assignment.ally ? (
                        <Link href={`/admin/aliados/${assignment.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{assignment.ally.name}</Link>
                      ) : (
                        <span className="text-stone-400">Sin aliado</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top leading-tight">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${ROLE_BADGES[assignment.role ?? ""] ?? "bg-stone-100 text-stone-600"}`}>{assignment.role ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{assignment.phone ? formatPublicPhone(assignment.phone) : "—"}</td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{assignment.instagram ? `@${assignment.instagram}` : "—"}</td>
                    <td className="px-4 py-2.5 align-top text-stone-500">{assignment.assigned_at ? formatDate(assignment.assigned_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="Sin voluntarios asignados" description="Asigna un voluntario para empezar a vincular apoyo con aliados." />
          </div>
        )}
      </SectionCard>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Voluntarios por asignar</h2>
        </div>
        {filteredUnassignedVolunteers.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Telefono</th>
                  <th className="px-4 py-2.5">Instagram</th>
                  <th className="px-4 py-2.5">Habilidades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredUnassignedVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2.5 align-top font-semibold text-ink">{volunteer.name}</td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{volunteer.email ?? "—"}</td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{volunteer.phone ? formatPublicPhone(volunteer.phone) : "—"}</td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{volunteer.instagram ? `@${volunteer.instagram}` : "—"}</td>
                    <td className="px-4 py-2.5 align-top text-stone-700">{volunteer.skills ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="Sin voluntarios disponibles" description="Todos los voluntarios activos ya tienen asignación o no hay registros activos." />
          </div>
        )}
      </SectionCard>
    </div>
  );
}
