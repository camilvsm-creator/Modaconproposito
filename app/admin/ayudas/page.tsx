import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminRecordsSummary, AdminTabs, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { LazyRequesterSelect } from "@/components/lazy-requester-select";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import {
  AID_REQUEST_STATUSES,
  AID_REQUEST_STATUS_LABELS,
  AID_REQUESTER_STATUS_LABELS,
  AID_REQUESTER_TYPE_LABELS,
  AID_REQUESTER_TYPES,
  URGENCY_LABELS,
  URGENCY_LEVELS,
} from "@/lib/constants";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { getAdminAidRequestersPage, getAdminAidRequestsPage } from "@/lib/requesters";

import { AidRequestsTable } from "./components/aid-requests-table";
import { RequesterForm } from "./components/requester-form";
import { RequestersTable } from "./components/requesters-table";
import { createAidRequestAction } from "../solicitudes/actions";

type AidTab = "solicitantes" | "solicitudes";

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(params: Record<string, string | string[] | undefined>, tab: AidTab, page: number) {
  const search = new URLSearchParams();
  search.set("tab", tab);
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status");
  const type = getStringParam(params, "type");
  if (q) search.set("q", q);
  if (status && status !== "all") search.set("status", status);
  if (tab === "solicitantes" && type && type !== "all") search.set("type", type);
  if (page > 1) search.set("page", String(page));
  return `/admin/ayudas?${search.toString()}`;
}

function tabHref(tab: AidTab) {
  return `/admin/ayudas?tab=${tab}`;
}

export default async function AdminAyudasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const tab: AidTab = getStringParam(params, "tab") === "solicitudes" ? "solicitudes" : "solicitantes";
  const q = getStringParam(params, "q");
  const status = getStringParam(params, "status") ?? "all";
  const type = getStringParam(params, "type") ?? "all";
  const page = getPageParam(params);

  const tabs = (
    <AdminTabs
      tabs={[
        { href: tabHref("solicitantes"), label: "Solicitantes", active: tab === "solicitantes" },
        { href: tabHref("solicitudes"), label: "Solicitudes", active: tab === "solicitudes" },
      ]}
    />
  );

  if (tab === "solicitantes") {
    const result = await getAdminAidRequestersPage({ page, limit: 20, q, status, type });

    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Ayudas" title="Ayudas" description="Gestiona solicitantes y solicitudes de ayuda desde un mismo módulo." />
        {tabs}
        <AdminToolbar
          filters={(
            <AutoSubmitFilterForm action="/admin/ayudas" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_repeat(2,minmax(140px,180px))]">
              <input type="hidden" name="tab" value="solicitantes" />
              <input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, responsable o email" />
              <select name="status" defaultValue={status} className={compactInputClassName}>
                <option value="all">Todos los estados</option>
                {Object.entries(AID_REQUESTER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select name="type" defaultValue={type} className={compactInputClassName}>
                <option value="all">Todos los tipos</option>
                {AID_REQUESTER_TYPES.map((value) => <option key={value} value={value}>{AID_REQUESTER_TYPE_LABELS[value]}</option>)}
              </select>
            </AutoSubmitFilterForm>
          )}
          actions={(
            <Modal triggerLabel="Nuevo solicitante" triggerVariant="primary" title="Crear solicitante" description="Registra una nueva organización solicitante.">
              <RequesterForm />
            </Modal>
          )}
        />
        <AdminRecordsSummary total={result.total} />
        {result.items.length ? <><RequestersTable requesters={result.items} /><AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, tab, nextPage)} /></> : <EmptyState title="No hay solicitantes registrados." description="Crea el primer solicitante para poder registrar solicitudes de ayuda." />}
      </div>
    );
  }

  const result = await getAdminAidRequestsPage({ page, limit: 20, q, status });

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Ayudas" title="Ayudas" description="Gestiona solicitantes y solicitudes de ayuda desde un mismo módulo." />
      {tabs}
      <AdminToolbar
        filters={(
          <AutoSubmitFilterForm action="/admin/ayudas" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(160px,220px)]">
            <input type="hidden" name="tab" value="solicitudes" />
            <input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar texto" />
            <select name="status" defaultValue={status} className={compactInputClassName}>
              <option value="all">Todos los estados</option>
              {AID_REQUEST_STATUSES.map((value) => <option key={value} value={value}>{AID_REQUEST_STATUS_LABELS[value]}</option>)}
            </select>
          </AutoSubmitFilterForm>
        )}
        actions={(
          <Modal triggerLabel="Nueva solicitud" triggerVariant="primary" title="Crear solicitud desde admin" description="Registra una solicitud en nombre de un solicitante existente.">
            <form action={createAidRequestAction} className="grid gap-4 md:grid-cols-2">
              <LazyRequesterSelect />
              <input className={compactInputClassName} name="title" required placeholder="Título" />
              <select className={compactInputClassName} name="urgency" defaultValue=""><option value="">Urgencia</option>{URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}</select>
              <div className="hidden md:block" />
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" placeholder="Describe la necesidad" />
              <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="requestedItems" placeholder="Resultado esperado o cantidades solicitadas" />
              <div className="md:col-span-2"><Button type="submit">Registrar solicitud</Button></div>
            </form>
          </Modal>
        )}
      />
      <AdminRecordsSummary total={result.total} />
      {result.items.length ? <><AidRequestsTable requests={result.items} /><AdminPagination page={result.page} pageCount={result.pageCount} total={result.total} limit={result.limit} hrefForPage={(nextPage) => pageHref(params, tab, nextPage)} /></> : <EmptyState title="Sin solicitudes registradas" description="Las solicitudes aparecerán aquí para convertirlas en tareas y luego en entregas." />}
    </div>
  );
}
