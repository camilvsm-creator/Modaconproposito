import Link from "next/link";

import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { EmptyState } from "@/components/empty-state";
import { LinkButton, compactInputClassName } from "@/components/ui";
import { ALLY_DELIVERY_STATUSES, DELIVERY_STATUS_LABELS, DELIVERY_STATUS_TONES } from "@/lib/constants";
import { requireOperationsUser, requireWorkshopAdminUser } from "@/lib/auth";
import { getDeliveriesPage, getRequesterDeliveriesPage } from "@/lib/production";
import type { DeliveryWithRelations, RequesterDeliveryWithRelations } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

import { requireCurrentAlly } from "../ally-scope";
import { requireCurrentRequester } from "../requester-scope";

const PAGE_SIZE = 20;

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(page: number, status: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/entregas?${query}` : "/admin/entregas";
}

function deliveryDate(delivery: DeliveryWithRelations) {
  return delivery.received_at ?? delivery.delivered_at ?? delivery.scheduled_for ?? delivery.created_at;
}

function DeliveryStatus({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", DELIVERY_STATUS_TONES[status] ?? "bg-gray-100 text-gray-600")}>
      {DELIVERY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function DeliveryActions({ deliveryId }: { deliveryId: string }) {
  return (
    <AdminRowActions>
      <AdminActionItem>
        <Link href={`/admin/entregas/${deliveryId}`} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Ver detalle
        </Link>
      </AdminActionItem>
    </AdminRowActions>
  );
}

function AllyDeliveryTable({ deliveries }: { deliveries: DeliveryWithRelations[] }) {
  return (
    <AdminTableFrame className="border-y border-gray-200">
      <table className="admin-mobile-cards min-w-[780px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Entrega</th>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Último movimiento</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <tr key={delivery.id} className="hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Entrega" className="px-4 py-3">
                <Link href={`/admin/entregas/${delivery.id}`} className="font-semibold text-ink hover:text-primary">
                  {delivery.title}
                </Link>
                {delivery.quantity ? <p className="mt-1 text-sm text-gray-500">Cantidad: {delivery.quantity}</p> : null}
              </td>
              <td data-mobile-label="Tarea" className="px-4 py-3 text-gray-600">{delivery.task?.title ?? "Sin tarea"}</td>
              <td data-mobile-label="Estado" className="px-4 py-3"><DeliveryStatus status={delivery.status} /></td>
              <td data-mobile-label="Fecha" className="px-4 py-3 text-gray-500">{formatDate(deliveryDate(delivery))}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right"><DeliveryActions deliveryId={delivery.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function AdminDeliveryTable({ deliveries }: { deliveries: DeliveryWithRelations[] }) {
  return (
    <AdminTableFrame className="border-y border-gray-200">
      <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Entrega</th>
            <th className="px-4 py-3">Aliado</th>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <tr key={delivery.id} className="hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Entrega" className="px-4 py-3">
                <Link href={`/admin/entregas/${delivery.id}`} className="font-semibold text-ink hover:text-primary">
                  {delivery.title}
                </Link>
                {delivery.quantity ? <p className="mt-1 text-sm text-gray-500">Cantidad: {delivery.quantity}</p> : null}
              </td>
              <td data-mobile-label="Aliado" className="px-4 py-3 text-gray-600">{delivery.ally?.name ?? "Sin aliado"}</td>
              <td data-mobile-label="Tarea" className="px-4 py-3 text-gray-600">{delivery.task?.title ?? "Sin tarea"}</td>
              <td data-mobile-label="Estado" className="px-4 py-3"><DeliveryStatus status={delivery.status} /></td>
              <td data-mobile-label="Fecha" className="px-4 py-3 text-gray-500">{formatDate(deliveryDate(delivery))}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right"><DeliveryActions deliveryId={delivery.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function RequesterDeliveryTable({ deliveries }: { deliveries: RequesterDeliveryWithRelations[] }) {
  return (
    <AdminTableFrame className="border-y border-gray-200">
      <table className="admin-mobile-cards min-w-[820px] w-full text-left text-sm">
        <thead className="bg-gray-50 text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Entrega</th>
            <th className="px-4 py-3">Solicitud / tarea</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <tr key={delivery.id} className="hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Entrega" className="px-4 py-3">
                <Link href={`/admin/entregas/${delivery.id}`} className="font-semibold text-ink hover:text-primary">
                  {delivery.title}
                </Link>
                {delivery.quantity ? <p className="mt-1 text-sm text-gray-500">Cantidad: {delivery.quantity}</p> : null}
              </td>
              <td data-mobile-label="Solicitud / tarea" className="px-4 py-3 text-gray-600">
                <p>{delivery.request.title}</p>
                <p className="mt-1 text-sm text-gray-500">{delivery.task.title}</p>
              </td>
              <td data-mobile-label="Estado" className="px-4 py-3"><DeliveryStatus status={delivery.status} /></td>
              <td data-mobile-label="Fecha" className="px-4 py-3 text-gray-500">{formatDate(deliveryDate(delivery))}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 text-right"><DeliveryActions deliveryId={delivery.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function DeliveryStatusFilter({ status }: { status: string }) {
  return (
    <AutoSubmitFilterForm action="/admin/entregas" method="get" className="flex w-full max-w-xs gap-3">
      <select name="status" defaultValue={status} className={compactInputClassName}>
        <option value="all">Todos los estados</option>
        {ALLY_DELIVERY_STATUSES.map((value) => <option key={value} value={value}>{DELIVERY_STATUS_LABELS[value]}</option>)}
      </select>
    </AutoSubmitFilterForm>
  );
}

export default async function AdminEntregasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireOperationsUser();
  const params = await searchParams;
  const page = getPageParam(params);
  const status = getStringParam(params, "status") ?? "all";
  const role = user.app_metadata?.role;

  if (role === "aliado") {
    const ally = await requireCurrentAlly();
    if (!ally) return null;
    const deliveries = await getDeliveriesPage({ allyId: ally.id, page, limit: PAGE_SIZE, status });

    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Cuenta" title="Entregas" description="Consulta el estado de tus entregas y abre el detalle para gestionarlas." />
        <AdminToolbar filters={<DeliveryStatusFilter status={status} />} actions={<LinkButton href="/admin/entregas/crear">Nueva entrega</LinkButton>} />
        <AdminRecordsSummary total={deliveries.total} />
        {deliveries.items.length ? <><AllyDeliveryTable deliveries={deliveries.items} /><AdminPagination page={deliveries.page} pageCount={deliveries.pageCount} total={deliveries.total} limit={deliveries.limit} hrefForPage={(nextPage) => pageHref(nextPage, status)} /></> : <EmptyState title="Sin entregas registradas" description="Las entregas de tus tareas completadas aparecerán aquí." />}
      </div>
    );
  }

  if (role === "solicitante") {
    const requester = await requireCurrentRequester();
    const deliveries = await getRequesterDeliveriesPage({ requesterId: requester.id, page, limit: PAGE_SIZE, status });

    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Cuenta" title="Entregas" description="Consulta las entregas asociadas a tus solicitudes y abre el detalle para confirmar su recepción." />
        <AdminToolbar filters={<DeliveryStatusFilter status={status} />} />
        <AdminRecordsSummary total={deliveries.total} />
        {deliveries.items.length ? <><RequesterDeliveryTable deliveries={deliveries.items} /><AdminPagination page={deliveries.page} pageCount={deliveries.pageCount} total={deliveries.total} limit={deliveries.limit} hrefForPage={(nextPage) => pageHref(nextPage, status)} /></> : <EmptyState title="Sin entregas registradas" description="Las entregas asociadas a tus solicitudes aparecerán aquí." />}
      </div>
    );
  }

  await requireWorkshopAdminUser();
  const deliveries = await getDeliveriesPage({ page, limit: PAGE_SIZE, status });

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Promoda" title="Entregas" description="Consulta el flujo de entregas y abre el detalle para gestionar logística y recepción." />
      <AdminToolbar filters={<DeliveryStatusFilter status={status} />} actions={<LinkButton href="/admin/entregas/crear">Nueva entrega</LinkButton>} />
      <AdminRecordsSummary total={deliveries.total} />
      {deliveries.items.length ? <><AdminDeliveryTable deliveries={deliveries.items} /><AdminPagination page={deliveries.page} pageCount={deliveries.pageCount} total={deliveries.total} limit={deliveries.limit} hrefForPage={(nextPage) => pageHref(nextPage, status)} /></> : <EmptyState title="Sin entregas registradas" description="Crea una entrega desde una tarea completada para cerrar el flujo." />}
    </div>
  );
}
