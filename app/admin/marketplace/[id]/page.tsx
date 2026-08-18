import Link from "next/link";
import { notFound } from "next/navigation";

import { reviewMarketplacePaymentAction, updateMarketplaceOrderDeliveryAction, uploadMarketplacePaymentProofAction } from "@/app/admin/marketplace/actions";
import { AdminDetailPanel } from "@/components/admin-data-ui";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import { MARKETPLACE_ORDER_STATUS_LABELS, MARKETPLACE_ORDER_STATUS_TONES, MARKETPLACE_PAYMENT_STATUS_LABELS, MARKETPLACE_PAYMENT_STATUS_TONES } from "@/lib/constants";
import { requireMarketplaceUser } from "@/lib/auth";
import { getMarketplaceOrderById } from "@/lib/marketplace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn, formatDateTime, formatUsd } from "@/lib/utils";

function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold", tone)}>{label}</span>;
}

export default async function MarketplaceOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireMarketplaceUser();
  const { id } = await params;
  const query = await searchParams;
  const order = await getMarketplaceOrderById(id);
  if (!order) notFound();

  const role = user.app_metadata?.role as string | undefined;
  if (role === "comprador" && order.customer_user_id !== user.id) notFound();
  if (role === "aliado") {
    const admin = createSupabaseAdminClient();
    const { data: ally } = await admin.from("allies").select("id").eq("user_id", user.id).maybeSingle();
    if (!ally || ally.id !== order.ally_id) notFound();
  }

  const isAdmin = role === "admin";
  const isAlly = role === "aliado";
  const isBuyer = role === "comprador";
  let proofUrl: string | null = null;
  if (order.payment_proof_path && (isAdmin || isAlly)) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.storage.from("marketplace-payment-proofs").createSignedUrl(order.payment_proof_path, 60 * 15);
    proofUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Marketplace" title={`Pedido ${order.order_number}`} description="Consulta el pago, los datos de entrega y el seguimiento del pedido." navigation={{ baseHref: "/admin/marketplace", baseLabel: isBuyer ? "Mis pedidos" : "Marketplace", currentLabel: order.order_number }} />
      {query.created === "1" ? <div className="rounded-md bg-success-soft px-4 py-3 text-sm font-semibold text-success">Pedido creado. El comprobante quedó en revisión.</div> : null}
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/marketplace" className="text-sm font-semibold text-primary hover:underline">Volver a pedidos</Link><div className="flex flex-wrap gap-2"><Badge label={MARKETPLACE_PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status} tone={MARKETPLACE_PAYMENT_STATUS_TONES[order.payment_status] ?? "bg-gray-100 text-gray-700"} /><Badge label={MARKETPLACE_ORDER_STATUS_LABELS[order.order_status] ?? order.order_status} tone={MARKETPLACE_ORDER_STATUS_TONES[order.order_status] ?? "bg-gray-100 text-gray-700"} /></div></div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Resumen del pedido</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Producto</dt><dd className="mt-1 text-sm font-medium text-ink">{order.product_name_snapshot}</dd></div><div><dt className="text-sm text-gray-500">Aliado</dt><dd className="mt-1 text-sm font-medium text-ink">{order.ally?.name ?? "-"}</dd></div><div><dt className="text-sm text-gray-500">Cantidad</dt><dd className="mt-1 text-sm font-medium text-ink">{order.quantity}</dd></div><div><dt className="text-sm text-gray-500">Total</dt><dd className="mt-1 text-sm font-medium text-ink">{formatUsd(order.total_usd)}</dd></div><div><dt className="text-sm text-gray-500">Creado</dt><dd className="mt-1 text-sm font-medium text-ink">{formatDateTime(order.created_at)}</dd></div></dl></AdminDetailPanel>
        <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Datos de entrega</h2><dl className="mt-5 grid gap-5"><div><dt className="text-sm text-gray-500">Comprador</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_name}</dd></div><div><dt className="text-sm text-gray-500">Correo</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_email}</dd></div><div><dt className="text-sm text-gray-500">WhatsApp</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_whatsapp}</dd></div><div><dt className="text-sm text-gray-500">Dirección</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-ink">{order.delivery_address}</dd></div></dl></AdminDetailPanel>
      </div>

      <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Pago</h2><div className="mt-4 grid gap-5 md:grid-cols-2"><div className="text-sm text-gray-600"><p>Teléfono: <strong className="text-ink">{order.payment_phone_snapshot}</strong></p><p className="mt-1">Banco: <strong className="text-ink">{order.payment_bank_snapshot}</strong></p><p className="mt-1">RIF: <strong className="text-ink">{order.payment_rif_snapshot}</strong></p><p className="mt-1">Titular: <strong className="text-ink">{order.payment_holder_snapshot}</strong></p></div><div>{order.payment_instructions_snapshot ? <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">{order.payment_instructions_snapshot}</p> : null}{proofUrl ? <a href={proofUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">Ver comprobante privado</a> : isBuyer && order.payment_proof_path ? <p className="text-sm text-gray-500">Comprobante enviado al equipo.</p> : <p className="text-sm text-gray-500">Sin comprobante cargado.</p>}</div></div>{order.payment_review_notes ? <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">Nota de revisión: {order.payment_review_notes}</p> : null}</AdminDetailPanel>

      {isAdmin && ["en_revision", "rechazado"].includes(order.payment_status) ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Revisar comprobante</h2><form action={reviewMarketplacePaymentAction} className="mt-4 grid gap-4"><input type="hidden" name="orderId" value={order.id} /><textarea className={`${compactInputClassName} min-h-[90px]`} name="notes" defaultValue={order.payment_review_notes ?? ""} placeholder="Notas para la revisión" /><div className="flex flex-wrap gap-2"><button className="min-h-11 rounded-md bg-success px-4 py-2.5 text-sm font-semibold text-white" name="paymentStatus" value="aprobado" type="submit">Aprobar pago</button><button className="min-h-11 rounded-md bg-danger px-4 py-2.5 text-sm font-semibold text-white" name="paymentStatus" value="rechazado" type="submit">Rechazar comprobante</button></div></form></AdminDetailPanel> : null}

      {isBuyer && !["entregado", "cancelado"].includes(order.order_status) ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Actualizar comprobante</h2><form action={uploadMarketplacePaymentProofAction} className="mt-4 flex flex-wrap items-end gap-3"><input type="hidden" name="orderId" value={order.id} /><label className="grid flex-1 gap-1.5"><span className="text-sm font-medium text-gray-800">Nuevo comprobante</span><input className={compactInputClassName} name="paymentProof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label><Button type="submit" variant="secondary">Enviar comprobante</Button></form></AdminDetailPanel> : null}

      {(isAdmin || isAlly) && order.payment_status === "aprobado" && !["entregado", "cancelado"].includes(order.order_status) ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Gestionar entrega</h2><form action={updateMarketplaceOrderDeliveryAction} className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"><input type="hidden" name="orderId" value={order.id} /><select className={compactInputClassName} name="orderStatus" defaultValue={order.order_status === "pago_aprobado" ? "en_preparacion" : order.order_status}><option value="en_preparacion">En preparación</option><option value="enviado">Enviado</option><option value="entregado">Entregado</option><option value="cancelado">Cancelado</option></select><input className={compactInputClassName} name="deliveryNotes" defaultValue={order.delivery_notes ?? ""} placeholder="Notas de entrega" /><Button type="submit">Actualizar estado</Button></form></AdminDetailPanel> : null}

      {isAdmin && !["entregado", "cancelado"].includes(order.order_status) ? <Modal triggerLabel="Cancelar pedido" triggerVariant="secondary" title="Cancelar pedido" description="El pedido quedará cancelado. La devolución del inventario debe revisarse manualmente."><form action={updateMarketplaceOrderDeliveryAction} className="grid gap-4"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="orderStatus" value="cancelado" /><textarea className={`${compactInputClassName} min-h-[90px]`} name="deliveryNotes" placeholder="Motivo de cancelación" /><Button type="submit" variant="secondary">Confirmar cancelación</Button></form></Modal> : null}
    </div>
  );
}
