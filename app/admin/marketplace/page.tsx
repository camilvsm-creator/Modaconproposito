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
  MARKETPLACE_CONTRIBUTION_STATUS_LABELS,
  MARKETPLACE_CONTRIBUTION_STATUS_TONES,
  MARKETPLACE_CONTRIBUTION_STATUSES,
  MARKETPLACE_PAYMENT_STATUS_LABELS,
  MARKETPLACE_PAYMENT_STATUSES,
  MARKETPLACE_PAYMENT_STATUS_TONES,
  MARKETPLACE_PRODUCT_STATUS_LABELS,
  MARKETPLACE_PRODUCT_STATUS_TONES,
  MARKETPLACE_PRODUCT_STATUSES,
} from "@/lib/constants";
import { requireAdminUser, requireMarketplaceUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getAdminMarketplacePaymentSettings,
  getAdminMarketplacePaymentMethods,
  getMarketplaceAllies,
  getMarketplaceOrdersPage,
  getAdminMarketplaceProductsPage,
  getMarketplaceContributionsPage,
} from "@/lib/marketplace";
import { cn, formatDate, formatUsd } from "@/lib/utils";
import { requireCurrentAlly } from "../ally-scope";
import {
  createMarketplaceProductAction,
  updateMarketplaceOrderDeliveryAction,
  updateMarketplacePaymentSettingsAction,
  saveMarketplacePaymentMethodAction,
  updateMarketplaceProductAction,
  updateMarketplaceProductStatusAction,
  reviewMarketplaceContributionAction,
} from "./actions";

type Tab = "productos" | "pedidos" | "pago" | "aportes";

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
  const paymentStatus = getParam(params, "paymentStatus");
  const paymentMethod = getParam(params, "paymentMethod");
  if (q) query.set("q", q);
  if (status && status !== "all") query.set("status", status);
  if (paymentStatus && paymentStatus !== "all") query.set("paymentStatus", paymentStatus);
  if (paymentMethod && paymentMethod !== "all") query.set("paymentMethod", paymentMethod);
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
      <label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Descripción del producto</span><textarea className={`${compactInputClassName} min-h-[130px]`} name="description" defaultValue={product?.description ?? ""} required placeholder="Cuenta qué es, qué materiales usa, sus medidas, cuidados y cualquier detalle importante para quien compra." /><span className="text-sm text-gray-500">Esta descripción aparecerá en la ficha pública del producto.</span></label>
      <label className="grid gap-1.5 md:col-span-2"><span className="text-sm font-medium text-gray-800">Imágenes</span><input className={compactInputClassName} name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /><span className="text-sm text-gray-500">Hasta 6 imágenes JPG, PNG o WEBP de máximo 5 MB cada una.</span></label>
      <div className="md:col-span-2"><Button type="submit">{product ? "Guardar producto" : "Enviar a revisión"}</Button></div>
    </form>
  );
}

function PaymentMethodForm({ method }: { method?: Awaited<ReturnType<typeof getAdminMarketplacePaymentMethods>>[number] }) {
  return (
    <form action={saveMarketplacePaymentMethodAction} className="grid gap-4">
      {method ? <input type="hidden" name="methodId" value={method.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre</span><input className={compactInputClassName} name="name" defaultValue={method?.name ?? ""} required placeholder="PayPal, Zelle, Pago Móvil..." /></label>
        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Código interno</span><input className={compactInputClassName} name="code" defaultValue={method?.code ?? ""} required placeholder="paypal" /><span className="text-sm text-gray-500">No se muestra al comprador.</span></label>
        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Tipo</span><select className={compactInputClassName} name="methodType" defaultValue={method?.method_type ?? "manual"}><option value="link">Enlace de pago</option><option value="manual">Datos e instrucciones</option></select></label>
        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Orden</span><input className={compactInputClassName} name="sortOrder" type="number" step="1" defaultValue={method?.sort_order ?? 0} /></label>
      </div>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Enlace de pago</span><input className={compactInputClassName} name="paymentUrl" type="url" defaultValue={method?.payment_url ?? ""} placeholder="https://..." /><span className="text-sm text-gray-500">Déjalo vacío para métodos manuales.</span></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Datos para pagar</span><textarea className={`${compactInputClassName} min-h-[100px]`} name="paymentDetails" defaultValue={method?.payment_details ?? ""} placeholder="Correo, teléfono, banco, titular u otros datos." /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Instrucciones</span><textarea className={`${compactInputClassName} min-h-[90px]`} name="instructions" defaultValue={method?.instructions ?? ""} placeholder="Indica qué debe hacer el comprador y cómo enviar el comprobante." /></label>
      <div className="flex flex-wrap gap-5 text-sm text-gray-700"><label className="inline-flex items-center gap-2"><input type="checkbox" name="supportsAmount" defaultChecked={method?.supports_amount ?? false} /> El enlace admite agregar el monto</label><label className="inline-flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={method?.is_active ?? true} /> Mostrar en checkout</label></div>
      <div><Button type="submit">{method ? "Guardar método" : "Agregar método"}</Button></div>
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

function paymentMethodLabel(code: string | null) {
  return code === "pago-movil" || code === "pago_movil" ? "Pago Móvil" : code === "paypal" ? "PayPal" : code ?? "No especificado";
}

function OrderTable({ orders }: { orders: Awaited<ReturnType<typeof getMarketplaceOrdersPage>>["items"] }) {
  return <AdminTableFrame><table className="admin-mobile-cards min-w-[1220px] w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Método de pago</th><th className="px-4 py-3">Verificación</th><th className="px-4 py-3">Entrega</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-gray-200">{orders.map((order) => <tr key={order.id} className="align-top hover:bg-gray-50"><td data-mobile="primary" data-mobile-label="Pedido" className="px-4 py-4"><Link href={`/admin/marketplace/${order.id}`} className="font-semibold text-primary hover:underline">{order.order_number}</Link><p className="mt-1 text-sm text-gray-500">{formatDate(order.created_at)}</p></td><td data-mobile-label="Producto" className="px-4 py-4 text-gray-600">{order.product_name_snapshot}<p className="mt-1 text-sm text-gray-500">Cantidad: {order.quantity}</p></td><td data-mobile-label="Cliente" className="px-4 py-4 text-gray-600">{order.buyer_name}<p className="mt-1 text-sm text-gray-500">{order.buyer_email}</p></td><td data-mobile-label="Total" className="px-4 py-4 font-semibold text-ink">{formatUsd(order.total_usd)}{order.payment_amount_bs !== null ? <p className="mt-1 text-sm font-normal text-gray-500">Bs. {order.payment_amount_bs.toFixed(2)}</p> : null}</td><td data-mobile-label="Método de pago" className="px-4 py-4 font-medium text-ink">{paymentMethodLabel(order.payment_method_code_snapshot)}</td><td data-mobile-label="Verificación" className="px-4 py-4"><Badge label={MARKETPLACE_PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status} tone={MARKETPLACE_PAYMENT_STATUS_TONES[order.payment_status] ?? "bg-gray-100 text-gray-700"} />{order.payment_status === "en_revision" ? <p className="mt-2 font-semibold text-[#C00253]">Pendiente de verificación</p> : null}{order.payment_proof_path || order.proofs?.length ? <p className="mt-1 text-sm text-gray-500">Comprobante adjunto</p> : null}</td><td data-mobile-label="Entrega" className="px-4 py-4"><Badge label={MARKETPLACE_ORDER_STATUS_LABELS[order.order_status] ?? order.order_status} tone={MARKETPLACE_ORDER_STATUS_TONES[order.order_status] ?? "bg-gray-100 text-gray-700"} /></td><td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-4 text-right"><Link href={`/admin/marketplace/${order.id}`} className="text-sm font-semibold text-primary hover:underline">Ver detalle</Link></td></tr>)}</tbody></table></AdminTableFrame>;
}

async function ContributionTable({ contributions }: { contributions: Awaited<ReturnType<typeof getMarketplaceContributionsPage>>["items"] }) {
  const admin = createSupabaseAdminClient();
  const rows = await Promise.all(contributions.map(async (contribution) => {
    const { data } = await admin.storage.from("marketplace-payment-proofs").createSignedUrl(contribution.proof_storage_path, 60 * 15);
    return { contribution, proofUrl: data?.signedUrl ?? null };
  }));
  return <AdminTableFrame><table className="admin-mobile-cards min-w-[1050px] w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600"><tr><th className="px-4 py-3">Donante</th><th className="px-4 py-3">Método</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Referencia</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Comprobante</th><th className="px-4 py-3">Revisión</th></tr></thead><tbody className="divide-y divide-gray-200">{rows.map(({ contribution, proofUrl }) => <tr key={contribution.id} className="align-top hover:bg-gray-50"><td data-mobile="primary" data-mobile-label="Donante" className="px-4 py-4"><p className="font-semibold text-ink">{contribution.donor_name}</p><p className="mt-1 text-sm text-gray-500">{contribution.donor_email}</p></td><td data-mobile-label="Método" className="px-4 py-4 text-gray-600">{contribution.payment_method === "pago_movil" ? "Pago Móvil" : "Transferencia"}</td><td data-mobile-label="Monto" className="px-4 py-4 font-semibold text-ink">Bs. {contribution.amount_bs.toFixed(2)}</td><td data-mobile-label="Referencia" className="px-4 py-4 text-gray-600">{contribution.payment_reference}<p className="mt-1 text-sm text-gray-500">{contribution.payment_date}</p></td><td data-mobile-label="Estado" className="px-4 py-4"><Badge label={MARKETPLACE_CONTRIBUTION_STATUS_LABELS[contribution.status] ?? contribution.status} tone={MARKETPLACE_CONTRIBUTION_STATUS_TONES[contribution.status] ?? "bg-gray-100 text-gray-700"} /></td><td data-mobile-label="Comprobante" className="px-4 py-4">{proofUrl ? <a href={proofUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Ver comprobante</a> : <span className="text-gray-500">No disponible</span>}</td><td data-mobile-label="Revisión" className="px-4 py-4">{contribution.status === "pendiente_verificacion" ? <form action={reviewMarketplaceContributionAction} className="grid gap-2"><input type="hidden" name="contributionId" value={contribution.id} /><input className={compactInputClassName} name="notes" placeholder="Nota opcional" /><div className="flex gap-2"><button className="text-sm font-semibold text-success" name="status" value="confirmado" type="submit">Confirmar</button><button className="text-sm font-semibold text-danger" name="status" value="rechazado" type="submit">Rechazar</button></div></form> : <span className="text-gray-500">{contribution.review_notes ?? "Revisado"}</span>}</td></tr>)}</tbody></table></AdminTableFrame>;
}

export default async function AdminMarketplacePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireMarketplaceUser();
  const role = user.app_metadata?.role as string | undefined;
  const params = await searchParams;
  const tabValue = getParam(params, "tab");
  const tab: Tab = tabValue === "pedidos" ? "pedidos" : tabValue === "pago" ? "pago" : tabValue === "aportes" ? "aportes" : "productos";
  const page = pageParam(params);
  const status = getParam(params, "status") ?? "all";
  const paymentStatus = getParam(params, "paymentStatus") ?? "all";
  const paymentMethod = getParam(params, "paymentMethod") ?? "all";
  const q = getParam(params, "q");

  const isAdmin = role === "admin";
  let allyId: string | undefined;
  if (!isAdmin) {
    const ally = await requireCurrentAlly();
    allyId = ally?.id;
  }

  const products = await getAdminMarketplaceProductsPage({ page, limit: 20, q, status, allyId });
  const orders = tab === "pedidos" ? await getMarketplaceOrdersPage({ page, limit: 20, status, paymentStatus, paymentMethod, allyId }) : null;
  const contributions = tab === "aportes" && isAdmin ? await getMarketplaceContributionsPage({ page, limit: 20, status }) : null;
  const allies = isAdmin ? await getMarketplaceAllies() : [];
  const paymentSettings = isAdmin && tab === "pago" ? await getAdminMarketplacePaymentSettings() : null;
  const paymentMethods = isAdmin && tab === "pago" ? await getAdminMarketplacePaymentMethods() : [];
  const tabs = <AdminTabs tabs={[{ href: "/admin/marketplace?tab=productos", label: "Productos", active: tab === "productos" }, { href: "/admin/marketplace?tab=pedidos", label: "Pedidos", active: tab === "pedidos" }, ...(isAdmin ? [{ href: "/admin/marketplace?tab=aportes", label: "Aportes", active: tab === "aportes" }, { href: "/admin/marketplace?tab=pago", label: "PayPal", active: tab === "pago" }] : [])]} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow={isAdmin ? "Promoda" : "Aliado"} title="Marketplace" description={isAdmin ? "Aprueba productos, revisa pagos y coordina pedidos." : "Gestiona tus productos, inventario y entregas del marketplace."} />
      {tabs}
      {tab === "pago" && isAdmin ? <div className="grid gap-5"><SectionCard className="max-w-3xl p-6 ring-1 ring-gray-200"><h2 className="text-xl font-bold text-ink">Métodos de pago</h2><p className="mt-2 text-sm leading-6 text-gray-600">Agrega los métodos que verá el comprador. PayPal puede abrirse con el monto exacto; los métodos manuales muestran los datos que coloques aquí.</p><div className="mt-5 grid gap-3">{paymentMethods.map((method) => <div key={method.id} className="flex flex-col justify-between gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center"><div><p className="font-bold text-ink">{method.name} {!method.is_active ? <span className="text-sm font-normal text-gray-500">(oculto)</span> : null}</p><p className="mt-1 text-sm text-gray-600">{method.method_type === "link" ? "Enlace de pago" : "Datos e instrucciones"}</p></div><Modal triggerLabel="Editar" triggerVariant="secondary" title={`Editar ${method.name}`} description="Actualiza los datos que verá el comprador."><PaymentMethodForm method={method} /></Modal></div>)}</div><div className="mt-5"><Modal triggerLabel="Agregar método de pago" triggerVariant="primary" title="Nuevo método de pago" description="Configura PayPal, Zelle, Pago Móvil u otra opción."><PaymentMethodForm /></Modal></div></SectionCard><SectionCard className="max-w-3xl p-6 ring-1 ring-gray-200"><h2 className="text-xl font-bold text-ink">Contacto por WhatsApp</h2><p className="mt-2 text-sm leading-6 text-gray-600">Se mostrará únicamente después de crear el pedido, para enviar comprobantes y coordinar la entrega.</p><form action={updateMarketplacePaymentSettingsAction} className="mt-5 grid gap-4"><input type="hidden" name="paypalUrl" value={paymentSettings?.paypal_url ?? ""} /><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp de contacto</span><input className={compactInputClassName} name="contactWhatsapp" type="tel" defaultValue={paymentSettings?.contact_whatsapp ?? "584222600032"} placeholder="+58 422 2600032" required /></label><label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Mensaje general</span><textarea className={`${compactInputClassName} min-h-[100px]`} name="instructions" defaultValue={paymentSettings?.instructions ?? "Después de crear tu pedido, puedes enviar el comprobante por WhatsApp."} /></label><div><Button type="submit">Guardar contacto</Button></div></form></SectionCard></div> : null}
      {tab === "productos" ? <><AdminToolbar filters={<form action="/admin/marketplace" method="get" className="grid flex-1 gap-3 md:grid-cols-[minmax(180px,1fr)_200px]"><input type="hidden" name="tab" value="productos" /><input className={compactInputClassName} name="q" defaultValue={q ?? ""} placeholder="Buscar producto" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todos los estados</option>{MARKETPLACE_PRODUCT_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_PRODUCT_STATUS_LABELS[item]}</option>)}</select></form>} actions={<Modal triggerLabel="Nuevo producto" triggerVariant="primary" title="Nuevo producto" description="Registra un producto para enviarlo a aprobación."><ProductForm allyId={allyId} allies={allies} /></Modal>} /><AdminRecordsSummary total={products.total} />{products.items.length ? <><ProductTable products={products.items} isAdmin={isAdmin} /><AdminPagination page={products.page} pageCount={products.pageCount} total={products.total} limit={products.limit} hrefForPage={(nextPage) => pageHref("productos", params, nextPage)} /></> : <EmptyState title="No hay productos registrados." description="Crea el primer producto para comenzar a vender en el marketplace." />}</> : null}
       {tab === "pedidos" ? <><AdminToolbar filters={<form action="/admin/marketplace" method="get" className="grid flex-1 gap-3 md:grid-cols-3"><input type="hidden" name="tab" value="pedidos" /><select className={compactInputClassName} name="status" defaultValue={status}><option value="all">Todas las entregas</option>{MARKETPLACE_ORDER_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_ORDER_STATUS_LABELS[item]}</option>)}</select><select className={compactInputClassName} name="paymentStatus" defaultValue={paymentStatus}><option value="all">Todos los pagos</option>{MARKETPLACE_PAYMENT_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_PAYMENT_STATUS_LABELS[item]}</option>)}</select><select className={compactInputClassName} name="paymentMethod" defaultValue={paymentMethod}><option value="all">Todos los métodos</option><option value="paypal">PayPal</option><option value="pago-movil">Pago Móvil</option></select></form>} /><AdminRecordsSummary total={orders?.total ?? 0} />{orders?.items.length ? <><OrderTable orders={orders.items} /><AdminPagination page={orders.page} pageCount={orders.pageCount} total={orders.total} limit={orders.limit} hrefForPage={(nextPage) => pageHref("pedidos", params, nextPage)} /></> : <EmptyState title="No hay pedidos registrados." description="Los pedidos recibidos aparecerán aquí para ser gestionados." />}</> : null}
      {tab === "aportes" && isAdmin ? <><AdminToolbar filters={<form action="/admin/marketplace" method="get" className="flex flex-1 gap-3"><input type="hidden" name="tab" value="aportes" /><select className={`${compactInputClassName} max-w-xs`} name="status" defaultValue={status}><option value="all">Todos los estados</option>{MARKETPLACE_CONTRIBUTION_STATUSES.map((item) => <option key={item} value={item}>{MARKETPLACE_CONTRIBUTION_STATUS_LABELS[item]}</option>)}</select></form>} /><AdminRecordsSummary total={contributions?.total ?? 0} />{contributions?.items.length ? <><ContributionTable contributions={contributions.items} /><AdminPagination page={contributions.page} pageCount={contributions.pageCount} total={contributions.total} limit={contributions.limit} hrefForPage={(nextPage) => pageHref("aportes", params, nextPage)} /></> : <EmptyState title="No hay aportes registrados." description="Los comprobantes enviados desde la card de aportes aparecerán aquí." />}</> : null}
    </div>
  );
}
