import Link from "next/link";

import { AdminRecordsSummary, AdminStatusBadge, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { CreateMessageThreadModal } from "@/app/admin/mensajes/components/create-message-thread-modal";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { requireOperationsUser } from "@/lib/auth";
import { getMessageThreadsPage } from "@/lib/messages";
import { compactInputClassName } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const MESSAGE_STATUS_TONES: Record<string, string> = {
  open: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function pageHref(page: number, status: string, recipient: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (status !== "all") params.set("status", status);
  if (recipient !== "all") params.set("recipient", recipient);
  const query = params.toString();
  return query ? `/admin/mensajes?${query}` : "/admin/mensajes";
}

function recipientLabel(thread: { ally?: { name: string } | null; requester?: { name: string } | null }) {
  if (thread.ally) return thread.ally.name;
  if (thread.requester) return thread.requester.name;
  return "Destinatario no disponible";
}

function recipientTypeLabel(thread: { ally_id: string | null }) {
  return thread.ally_id ? "Aliado" : "Solicitante";
}

export default async function AdminMensajesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireOperationsUser();
  const params = await searchParams;
  const page = getPageParam(params);
  const status = getStringParam(params, "status") ?? "all";
  const recipient = getStringParam(params, "recipient") ?? "all";
  const result = await getMessageThreadsPage({
    page,
    limit: 20,
    status,
    recipientType: recipient === "aliado" || recipient === "solicitante" ? recipient : "all",
  });
  const role = user.app_metadata?.role as string | undefined;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Mensajes"
        description="Coordina conversaciones con aliados y solicitantes desde un mismo espacio."
      />

      <AdminToolbar
        filters={
          <AutoSubmitFilterForm action="/admin/mensajes" method="get" className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(160px,220px)_minmax(160px,220px)]">
            <select name="status" defaultValue={status} className={compactInputClassName}>
              <option value="all">Todos los estados</option>
              <option value="open">Abiertos</option>
              <option value="closed">Cerrados</option>
            </select>
            {role === "admin" ? (
              <select name="recipient" defaultValue={recipient} className={compactInputClassName}>
                <option value="all">Todos los destinatarios</option>
                <option value="aliado">Aliados</option>
                <option value="solicitante">Solicitantes</option>
              </select>
            ) : null}
          </AutoSubmitFilterForm>
        }
        actions={role === "admin" ? <CreateMessageThreadModal /> : null}
      />

      <AdminRecordsSummary total={result.total} />

      {result.items.length ? (
        <>
          <AdminTableFrame>
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Asunto</th>
                  <th className="px-4 py-3">Destinatario</th>
                  <th className="px-4 py-3">Último mensaje</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((thread) => (
                  <tr key={thread.id} className={thread.is_unread ? "bg-primary-soft/20" : undefined}>
                    <td data-mobile="primary" data-mobile-label="Asunto" className="px-4 py-3 align-top">
                      <Link href={`/admin/mensajes/${thread.id}`} className="font-semibold text-ink hover:text-primary">
                        {thread.subject}
                      </Link>
                      {thread.is_unread ? <span className="ml-2 inline-flex rounded-md bg-primary px-2 py-1 text-sm font-semibold text-white">Nuevo</span> : null}
                    </td>
                    <td data-mobile-label="Destinatario" className="px-4 py-3 align-top text-gray-700">
                      <p className="font-semibold">{recipientLabel(thread)}</p>
                      <p className="text-sm text-gray-500">{recipientTypeLabel(thread)}</p>
                    </td>
                    <td data-mobile-label="Último mensaje" className="max-w-[360px] px-4 py-3 align-top text-gray-600">
                      <span className="line-clamp-2">{thread.latest_message?.body ?? "Sin mensajes todavía"}</span>
                    </td>
                    <td data-mobile-label="Estado" className="px-4 py-3 align-top">
                      <AdminStatusBadge className={MESSAGE_STATUS_TONES[thread.status] ?? "bg-gray-100 text-gray-600"}>
                        {thread.status === "closed" ? "Cerrado" : "Abierto"}
                      </AdminStatusBadge>
                    </td>
                    <td data-mobile-label="Actualizado" className="px-4 py-3 align-top text-gray-500">{formatDateTime(thread.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableFrame>
          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(nextPage) => pageHref(nextPage, status, recipient)}
          />
        </>
      ) : (
        <EmptyState
          title="No hay conversaciones"
          description={role === "admin" ? "Crea un hilo para comenzar a coordinar con un aliado o solicitante." : "Las conversaciones de tu cuenta aparecerán aquí."}
        />
      )}
    </div>
  );
}
