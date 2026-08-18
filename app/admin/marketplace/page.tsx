import Link from "next/link";

import { AdminActionItem, AdminRecordsSummary, AdminRowActions, AdminTableFrame, AdminTabs, AdminToolbar } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { Button, SectionCard, compactInputClassName } from "@/components/ui";
import {
  MARKETPLACE_ORDER_STATUS_LABELS,
  MARKETPLACE_ORDER_STATUS_TONES,
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_PAYMENT_STATUS_LABELS,
  MARKETPLACE_PAYMENT_STATUS_TONES,
  MARKETPLACE_PRODUCT_STATUS_LABELS,
  MARKETPLACE_PRODUCT_STATUS_TONES,
  MARKETPLACE_PRODUCT_STATUSES,
} from "@/lib/constants";
import { requireAdminUser, requireMarketplaceUser } from "@/lib/auth";
import {
  getAdminMarketplacePaymentSettings,
  getMarketplaceAllies,
  getMarketplaceCustomerByUserId,
  getMarketplaceOrdersPage,
  getAdminMarketplaceProductsPage,
} from "@/lib/marketplace";
import { cn, formatDate, formatUsd } from "@/lib/utils";
import { requireCurrentAlly } from "../ally-scope";
import {
  createMarketplaceProductAction,
  updateMarketplaceCustomerAction,
  updateMarketplaceOrderDeliveryAction,
  updateMarketplacePaymentSettingsAction,
  updateMarketplaceProductAction,
  updateMarketplaceProductStatusAction,
} from "./actions";

type Tab = "productos" | "pedidos" | "pago";

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(tab: Tab, params: Record<string, string | string[] | undefined>, page: number) {
  const query = new URLSearchParams({ tab });
  const q = getParam(params, "q");
  const status = getParam(params, "status");
  if (q) query.set("q", q);
  if (status && status !== "all") query.set("status", status);
  if (page > 1) query.set("page", String(page));
  return `/admin/marketplace?${query.toString()}`;
}

function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", tone)}>{label}</span>;
}

function ProductForm({
  product,
  allyId,
  allies,
}: {
  product?: { id: string; name: string; description: string | null; price_usd: number; stock_quantity: number; ally_id: string };
  allyId?: string;
  allies?: Array<{ id: string; name: string }>;
}) {
  return (
    <form action={product ? updateMarketplaceProductAction : createMarketplaceProductAction} className="grid gap-4 md:grid-cols-2">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}
      {allyId ? <input type="hidden" name="allyId" value={allyId} /> : null}
      {!allyId && allies ? <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Aliado</span><select className={compactInputClassName} name="allyId" defaultValue={product?.ally_id ?? ""} required><option value="">Selecciona un aliado</option>{allies.map((ally) => <option key={ally.id} value={ally.id}>{ally.name}</option>)}</select></label> : null}
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre del producto</span><input className={compactInputClassName} name="name" defaultValue={product?.name ?? ""} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Precio en USD</span><input className={compactInputClassName} name="priceUsd" type="number" min="0.01" step="0.01" defaultValue={product?.price_usd ?? ""} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Inventario disponible</span><input className={compactInputClassName} name="stockQuantity" type="number" min="0" step="1" defaultValue={product?.stock_quantity ?? 0} required /></label>
      <label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Descripción</span><textarea className={`${compactInputClassName} min-h-[110px]`} name="description" defaultValue={product?.description ?? ""} /></label>
      <label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Imágenes</span><input className={compactInputClassName} name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /><span className="text-sm text-gray-500">Hasta 6 imágenes JPG, PNG o WEBP de máximo 5 MB cada una.</span></label>
      <div className="md:col-span-2"><Button type="submit">{product ? "Guardar producto" : "Enviar a revisión"}</Button></div>
    </form>
  );
}

function ProductTable({ products, isAdmin }: { products: Awaited<ReturnType<typeof getAdminMarketplaceProductsPage>>["items"]; isAdmin: boolean }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[1040px] w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Aliado</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Inventario</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Registro</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="align-top hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Producto" className="px-4 py-4"><p className="font-semibold text-ink">{product.name}</p><p className="mt-1 text-sm text-gray-500">{product.images?.length ?? 0} imágenes</p></td>
              <td data-mobile-label="Aliado" className="px-4 py-4 text-gray-600">{product.ally?.name ?? "-"}</td>
              <td data-mobile-label="Precio" className="px-4 py-4 font-semibold text-ink">{formatUsd(product.price_usd)}</td>
              <td data-mobile-label="Inventario" className="px-4 py-4 text-gray-600">{product.stock_quantity}</td>
              <td data-mobile-label="Estado" className="px-4 py-4"><Badge label={MARKETPLACE_PRODUCT_STATUS_LABELS[product.status] ?? product.status} tone={MARKETPLACE_PRODUCT_STATUS_TONES[product.status] ?? "bg-gray-100 text-gray-700"} /></td>
              <td data-mobile-label="Registro" className="px-4 py-4 text-gray-500">{formatDate(product.created_at)}</td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right">
                <AdminRowActions>
                  <AdminActionItem><Modal triggerLabel="Editar" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title={product.name} description="Actualiza la información e inventario del producto."><ProductForm product={product} /></Modal></AdminActionItem>
                  {isAdmin && product.status === "pendiente_revision" ? <><AdminActionItem><form action={updateMarketplaceProductStatusAction}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="status" value="aprobado" /><button type="submit" className="text-primary">Aprobar</button></form></AdminActionItem><AdminActionItem><Modal triggerLabel="Rechazar" triggerClassName="!w-full !justify-start !px-3 !py-2 !text-left !text-sm" title="Rechazar producto" description="Indica el motivo para que el aliado pueda corregirlo."><form action={updateMarketplaceProductStatusAction} className="grid gap-4"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="status" value="rechazado" /><textarea className={`${compactInputClassName} min-h-[100px]`} name="rejectionReason" required placeholder="Motivo del rechazo" /><Button type="submit" variant="secondary">Confirmar rechazo</Button></form></Modal></AdminActionItem></> : null}
                  {isAdmin && product.status !== "rechazado" ? <AdminActionItem><form action={updateMarketplaceProductStatusAction}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="status" value={product.status === "pausado" ? "aprobado" : "pausado"} /><button type="submit" className="text-gray-700">{product.status === "pausado" ? "Reactivar" : "Pausar"}</button></form></AdminActionItem> : null}
                </AdminRowActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function OrderTable({ orders }: { orders: Awaited<ReturnType<typeof getMarketplaceOrdersPage>>["items"] }) {
  return (
    <AdminTableFrame>
      <table className="admin-mobile-cards min-w-[1050px] w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Pago</th><th className="px-4 py-3">Entrega</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="align-top hover:bg-gray-50">
              <td data-mobile="primary" data-mobile-label="Pedido" className="px-4 py-4"><Link href={`/admin/marketplace/${order.id}`} className="font-semibold text-primary hover:underline">{order.order_number}</Link><p className="mt-1 text-sm text-gray-500">{formatDate(order.created_at)}</p></td>
              <td data-mobile-label="Producto" className="px-4 py-4 text-gray-600">{order.product_name_snapshot}<p className="mt-1 text-sm text-gray-500">Cantidad: {order.quantity}</p></td>
              <td data-mobile-label="Cliente" className="px-4 py-4 text-gray-600">{order.buyer_name}<p className="mt-1 text-sm text-gray-500">{order.buyer_email}</p></td>
              <td data-mobile-label="Total" className="px-4 py-4 font-semibold text-ink">{formatUsd(order.total_usd)}</td>
              <td data-mobile-label="Pago" className="px-4 py-4"><Badge label={MARKETPLACE_PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status} tone={MARKETPLACE_PAYMENT_STATUS_TONES[order.payment_status] ?? "bg-gray-100 text-gray-700"} /></td>
              <td data-mobile-label="Entrega" className="px-4 py-4"><Badge label={MARKETPLACE_ORDER_STATUS_LABELS[order.order_status] ?? order.order_status} tone={MARKETPLACE_ORDER_STATUS_TONES[order.order_status] ?? "bg-gray-100 text-gray-700"} /></td>
              <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right"><Link href={`/admin/marketplace/${order.id}`} className="text-sm font-semibold text-primary hover:underline">Ver detalle</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

export default async function AdminMarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireMarketplaceUser();
  const role = user.app_metadata?.role as string | undefined;
  const params = await searchParams;
  const tab: Tab = getParam(params, "tab") === "pedidos" ? "pedidos" : getParam(params, "tab") === "pago" ? "pago" : "productos";
  const page = pageParam(params);
  const status = getParam(params, "status") ?? "all";
  const q = getParam(params, "q");

  if (role === "comprador") {
    const customer = await getMarketplaceCustomerByUserId(user.id);
    const orders = await getMarketplaceOrdersPage({ customerUserId: user.id, page, limit: 20, status });
    return <BuyerMarketplacePage customer={customer} orders={orders} status={status} params={params} />;
  }

  const isAdmin = role === "admin";
  let allyId: string | undefined;
  if (!isAdmin) {
    const ally = await requireCurrentAlly();
    allyId = ally?.id;
  }

  const products = await getAdminMarketplaceProductsPage({ page, limit: 20, q, status, allyId });
  const orders = tab === "pedidos" ? await getMarketplaceOrdersPage({ page, limit: 20, status, allyId }) : null;
  const allies = isAdmin ? await getMarketplaceAllies() : [];
  const paymentSettings = isAdmin && tab === "pago" ? await getAdminMarketplacePaymentSettings() : null;
  const tabs = <AdminTabs tabs={[{ href: "/admin/marketplace?tab=productos", label: "Productos", active: tab === "productos" }, { href: "/admin/marketplace?tab=pedidos", label: "Pedidos", active: tab === "pedidos" }, ...(isAdmin ? [{ href: "/admin/marketplace?tab=pago", label: "Pago Móvil", active: tab === "pago" }] : [])]} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={isAdmin ? "Promoda" : "Aliado"} title="Marketplace" description={isAdmin ? "Aprueba productos, revisa pagos y coordina pedidos." : "Gestiona tus productos, inventario y entregas del marketplace."} />
      {tabs}
      {tab === "pago" && isAdmin ? <SectionCard className="max-w-3xl p-6 ring-1 ring-gray-200"><h2 className="text-xl font-bold text-ink">Datos globales de Pago Móvil</h2><p className="mt-2 text-sm text-gray-600">Estos datos se mostrarán en todos los pedidos y serán los mismos para toda la plataforma.</p><form action={updateMarketplacePaymentSettingsAction} className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Teléfono</span><input className={compactInputClassName} name="phone" defaultValue={paymentSettings?.phone ?? ""} required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Banco</span><input className={compactInputClassName} name="bank" defaultValue={paymentSettings?.bank ?? ""} required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">RIF</span><input className={compactInputClassName} name="rif" defaultValue={paymentSettings?.rif ?? ""} required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Titular</span><input className={compactInputClassName} name="accountHolder" defaultValue={paymentSettings?.account_holder ?? "Moda con Propósito"} required /></label><label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Instrucciones adicionales</span><textarea className={`${compactInputClassName} min-h-[100px]`} name="instructions" defaultValue={paymentSettings?.instructions ?? ""} /></label><div className="md:col-span-2"><Button type="submit">Guardar datos de pago</Button></div></form></SectionCard> : null}
      {tab === "productos" ? <><AdminToolbar filters={<form action="/admin/marketplace" method="get" className="grid flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_200px]"><input type="hidden" name="tab" value="productos" /><input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar producto" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todos los estados</option>{MARKETPLACE_PRODUCT_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_PRODUCT_STATUS_LABELS[item]}</option>)}</select></form>} actions={<Modal triggerLabel="Nuevo producto" triggerVariant="primary" title="Nuevo producto" description="Registra un producto para enviarlo a aprobación."><ProductForm allyId={allyId} allies={allies} /></Modal>} /><AdminRecordsSummary total={products.total} />{products.items.length ? <><ProductTable products={products.items} isAdmin={isAdmin} /><AdminPagination page={products.page} pageCount={products.pageCount} total={products.total} limit={products.limit} hrefForPage={(nextPage) => pageHref("productos", params, nextPage)} /></> : <EmptyState title="No hay productos registrados." description="Crea el primer producto para comenzar a vender en el marketplace." />}</> : null}
      {tab === "pedidos" ? <><AdminToolbar filters={<form action="/admin/marketplace" method="get" className="flex flex-1 gap-3"><input type="hidden" name="tab" value="pedidos" /><select className={`${compactInputClassName} max-w-xs`} name="status" defaultValue={status}><option value="all">Todos los estados</option>{MARKETPLACE_ORDER_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_ORDER_STATUS_LABELS[item]}</option>)}</select></form>} /><AdminRecordsSummary total={orders?.total ?? 0} />{orders?.items.length ? <><OrderTable orders={orders.items} /><AdminPagination page={orders.page} pageCount={orders.pageCount} total={orders.total} limit={orders.limit} hrefForPage={(nextPage) => pageHref("pedidos", params, nextPage)} /></> : <EmptyState title="No hay pedidos registrados." description="Los pedidos pagados aparecerán aquí para ser gestionados." />}</> : null}
    </div>
  );
}

async function BuyerMarketplacePage({ customer, orders, status, params }: { customer: Awaited<ReturnType<typeof getMarketplaceCustomerByUserId>>; orders: Awaited<ReturnType<typeof getMarketplaceOrdersPage>>; status: string; params: Record<string, string | string[] | undefined> }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Mi cuenta" title="Mis pedidos" description="Consulta tus pedidos y mantén actualizados tus datos de entrega." />
      <SectionCard className="max-w-3xl p-6 ring-1 ring-gray-200"><h2 className="text-xl font-bold text-ink">Datos de comprador</h2><form action={updateMarketplaceCustomerAction} className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre completo</span><input className={compactInputClassName} name="fullName" defaultValue={customer?.full_name ?? ""} required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo</span><input className={compactInputClassName} name="email" type="email" defaultValue={customer?.email ?? ""} required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp</span><input className={compactInputClassName} name="whatsapp" defaultValue={customer?.whatsapp ?? ""} required /></label><label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Dirección</span><textarea className={`${compactInputClassName} min-h-[80px]`} name="address" defaultValue={customer?.address ?? ""} required /></label><div className="md:col-span-2"><Button type="submit" variant="secondary">Guardar datos</Button></div></form></SectionCard>
      <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Historial</p><h2 className="mt-1 text-xl font-bold text-ink">Pedidos realizados</h2></div><Link href="/marketplace" className="text-sm font-semibold text-primary hover:underline">Ver productos</Link></div>
      <AdminRecordsSummary total={orders.total} />
      {orders.items.length ? <><OrderTable orders={orders.items} /><AdminPagination page={orders.page} pageCount={orders.pageCount} total={orders.total} limit={orders.limit} hrefForPage={(nextPage) => `/admin/marketplace?page=${nextPage}${status !== "all" ? `&status=${encodeURIComponent(status)}` : ""}`} /></> : <EmptyState title="Todavía no tienes pedidos." description="Cuando realices una compra podrás consultar su estado aquí." />}
    </div>
  );
}
