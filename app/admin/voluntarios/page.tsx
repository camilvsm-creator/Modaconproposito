import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTabs, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { SectionCard, compactInputClassName } from "@/components/ui";
import { requireWorkshopAdminUser, requireWorkshopUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminVolunteerAssignmentsPage, getAdminVolunteerListPage } from "@/lib/workshops";
import { formatDate, formatPublicPhone } from "@/lib/utils";
import { VOLUNTEER_STATUS_LABELS, VOLUNTEER_STATUS_TONES } from "@/lib/constants";
import { VolunteerAdminActions } from "./components/volunteer-admin-actions";
import { removeVolunteerAssignmentAction, updateVolunteerStatusAction } from "./actions";

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

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

type VolunteerAdminRow = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  skills?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
  role?: string | null;
  assigned_at?: string | null;
  volunteer_id?: string | null;
  ally?: { id: string; name: string; slug?: string | null } | null;
};

type VolunteerAdminPageResult = {
  items: VolunteerAdminRow[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export default async function AdminVoluntariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireWorkshopUser();

  if (user.app_metadata?.role === "aliado") {
    const supabase = await createSupabaseServerClient();
    const { data: ally } = await supabase.from("allies").select("id").eq("user_id", user.id).maybeSingle();
    const params = await searchParams;
    const allyAssignments = ally ? await getAdminVolunteerAssignmentsPage({ allyId: ally.id, page: getPageParam(params), limit: 20 }) : null;
    const assignments = allyAssignments?.items ?? [];

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Cuenta"
          title="Voluntarios"
          description="Voluntarios asignados a tu aliado por el equipo de Promoda."
        />

        <AdminRecordsSummary total={allyAssignments?.total ?? 0} />

        {assignments.length ? (
          <SectionCard className="overflow-hidden">
            <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                    <th className="px-4 py-2.5">Nombre</th>
                    <th className="px-4 py-2.5">Rol</th>
                    <th className="px-4 py-2.5">Telefono</th>
                    <th className="px-4 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td data-mobile="primary" data-mobile-label="Nombre" className="px-4 py-2.5 font-semibold text-ink">{assignment.name}</td>
                      <td data-mobile-label="Rol" className="px-4 py-2.5 text-gray-700">{assignment.role ?? "—"}</td>
                      <td data-mobile-label="Teléfono" className="px-4 py-2.5 text-gray-700">{assignment.phone ? formatPublicPhone(assignment.phone) : "—"}</td>
                      <td data-mobile-label="Estado" className="px-4 py-2.5 text-gray-700">{VOLUNTEER_STATUS_LABELS[assignment.status] ?? assignment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : (
          <EmptyState title="Sin voluntarios asignados" description="Las asignaciones de voluntariado aparecerán aquí." />
        )}
        {allyAssignments && assignments.length ? <AdminPagination page={allyAssignments.page} pageCount={allyAssignments.pageCount} total={allyAssignments.total} limit={allyAssignments.limit} hrefForPage={(page) => page > 1 ? `/admin/voluntarios?page=${page}` : "/admin/voluntarios"} /> : null}
      </div>
    );
  }

  await requireWorkshopAdminUser();

  const params = await searchParams;
  const q = getStringParam(params, "q")?.toLowerCase();
  const tab = getStringParam(params, "tab") === "activos" ? "activos" : "postulaciones";

  const result = (tab === "postulaciones"
    ? await getAdminVolunteerListPage({ page: getPageParam(params), limit: 20, q, statuses: ["postulado", "revisado"] })
    : await getAdminVolunteerAssignmentsPage({ page: getPageParam(params), limit: 20, q })) as unknown as VolunteerAdminPageResult;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Voluntarios"
        description="Asigna voluntarios a aliados y consulta quiénes ya están asignados o disponibles."
      />

      <AdminTabs
        tabs={[
          { href: "/admin/voluntarios?tab=postulaciones", label: "Postulaciones", count: tab === "postulaciones" ? result.total : undefined, active: tab === "postulaciones" },
          { href: "/admin/voluntarios?tab=activos", label: "Activos", count: tab === "activos" ? result.total : undefined, active: tab === "activos" },
        ]}
      />

      <AdminToolbar
        filters={<AutoSubmitFilterForm action="/admin/voluntarios" method="get" className="flex w-full max-w-xl gap-3">
          <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, rol o aliado" className={`${compactInputClassName} min-w-0`} />
          <input type="hidden" name="tab" value={tab} />
        </AutoSubmitFilterForm>}
        actions={<VolunteerAdminActions />}
      />

      <AdminRecordsSummary total={result.total} />

      {tab === "postulaciones" ? (
        <SectionCard className="overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4"><h2 className="text-lg font-semibold text-ink">Postulaciones recibidas</h2></div>
          {result.items.length ? (
            <div className="overflow-x-auto"><table className="admin-mobile-cards min-w-[980px] w-full text-left text-sm"><thead className="bg-gray-50/80 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Contacto</th><th className="px-4 py-2.5">Experiencia</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5">Acciones</th></tr></thead><tbody className="divide-y divide-gray-200">{result.items.map((volunteer) => <tr key={volunteer.id}><td data-mobile="primary" data-mobile-label="Nombre" className="px-4 py-3 align-top font-semibold text-ink">{volunteer.name}<p className="text-sm font-normal text-gray-500">{formatDate(volunteer.created_at)}</p></td><td data-mobile-label="Contacto" className="px-4 py-3 align-top text-gray-700">{volunteer.email ?? "—"}<br />{volunteer.phone ?? "—"}</td><td data-mobile-label="Experiencia" className="px-4 py-3 align-top text-gray-700"><p>{volunteer.skills ?? "—"}</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">{volunteer.notes ?? ""}</p></td><td data-mobile-label="Estado" className="px-4 py-3 align-top text-gray-700"><span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${VOLUNTEER_STATUS_TONES[volunteer.status] ?? "bg-gray-100 text-gray-600"}`}>{VOLUNTEER_STATUS_LABELS[volunteer.status] ?? volunteer.status}</span></td><td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 align-top"><AdminRowActions><AdminActionItem><form action={updateVolunteerStatusAction}><input type="hidden" name="volunteerId" value={volunteer.id} /><input type="hidden" name="status" value="activo" /><button className="text-primary" type="submit">Activar</button></form></AdminActionItem><AdminActionItem><form action={updateVolunteerStatusAction}><input type="hidden" name="volunteerId" value={volunteer.id} /><input type="hidden" name="status" value="inactivo" /><button className="text-danger" type="submit">Descartar</button></form></AdminActionItem></AdminRowActions></td></tr>)}</tbody></table></div>
          ) : <div className="p-6"><EmptyState title="Sin postulaciones pendientes" description="Las nuevas postulaciones aparecerán aquí para revisarlas." /></div>}
        </SectionCard>
      ) : null}

      {tab === "postulaciones" && result.items.length ? <AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => `/admin/voluntarios?tab=postulaciones${nextPage > 1 ? `&page=${nextPage}` : ""}`} /> : null}

      {tab === "activos" ? <SectionCard className="overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Voluntarios asignados</h2>
        </div>
        {result.items.length ? (
          <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[980px] w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Aliado</th>
                  <th className="px-4 py-2.5">Rol</th>
                  <th className="px-4 py-2.5">Telefono</th>
                  <th className="px-4 py-2.5">Instagram</th>
                  <th className="px-4 py-2.5">Asignado</th>
                  <th className="px-4 py-2.5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td data-mobile="primary" data-mobile-label="Nombre" className="px-4 py-2.5 align-top font-semibold text-ink">{assignment.name}</td>
                    <td data-mobile-label="Aliado" className="px-4 py-2.5 align-top">
                      {assignment.ally ? (
                        <Link href={`/admin/aliados/${assignment.ally.id}`} className="font-semibold text-[#F74897] hover:underline">{assignment.ally.name}</Link>
                      ) : (
                        <span className="text-gray-400">Sin aliado</span>
                      )}
                    </td>
                    <td data-mobile-label="Rol" className="px-4 py-2.5 align-top leading-tight">
                      <span className={`inline-block rounded-md px-2.5 py-1 text-sm font-semibold ${ROLE_BADGES[assignment.role ?? ""] ?? "bg-gray-100 text-gray-600"}`}>{assignment.role ?? "—"}</span>
                    </td>
                    <td data-mobile-label="Teléfono" className="px-4 py-2.5 align-top text-gray-700">{assignment.phone ? formatPublicPhone(assignment.phone) : "—"}</td>
                    <td data-mobile="hidden" data-mobile-label="Instagram" className="px-4 py-2.5 align-top text-gray-700">{assignment.instagram ? `@${assignment.instagram}` : "—"}</td>
                    <td data-mobile-label="Asignado" className="px-4 py-2.5 align-top text-gray-500">{assignment.assigned_at ? formatDate(assignment.assigned_at) : "—"}</td>
                    <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-2.5 align-top"><form action={removeVolunteerAssignmentAction}><input type="hidden" name="assignmentId" value={assignment.id} /><input type="hidden" name="volunteerId" value={assignment.volunteer_id ?? ""} /><button className="text-sm font-semibold text-gray-600 hover:text-red-600" type="submit">Quitar</button></form></td>
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
      </SectionCard> : null}

      {tab === "activos" && result.items.length ? <AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => `/admin/voluntarios?tab=activos${nextPage > 1 ? `&page=${nextPage}` : ""}`} /> : null}
    </div>
  );
}
