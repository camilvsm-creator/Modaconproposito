import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

import { reviewMarketplacePaymentAction, updateMarketplaceOrderDeliveryAction } from "@/app/admin/marketplace/actions";
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

function whatsappHref(phone: string, orderNumber: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola ${orderNumber}, te escribimos sobre tu pedido en el marketplace de Moda con Propósito.`)}` : null;
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
  if (role === "aliado") {
    const admin = createSupabaseAdminClient();
    const { data: ally } = await admin.from("allies").select("id").eq("user_id", user.id).maybeSingle();
    if (!ally || ally.id !== order.ally_id) notFound();
  }

  const isAdmin = role === "admin";
  const isAlly = role === "aliado";
  let proofUrl: string | null = null;
  let proofUrls: Array<{ name: string; url: string }> = [];
  if (order.payment_proof_path && (isAdmin || isAlly)) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.storage.from("marketplace-payment-proofs").createSignedUrl(order.payment_proof_path, 60 * 15);
    proofUrl = data?.signedUrl ?? null;
  }
  if (isAdmin || isAlly) {
    const admin = createSupabaseAdminClient();
    proofUrls = (await Promise.all((order.proofs ?? []).map(async (proof) => {
      const { data } = await admin.storage.from("marketplace-payment-proofs").createSignedUrl(proof.storage_path, 60 * 15);
      return data?.signedUrl ? { name: proof.original_name, url: data.signedUrl } : null;
    }))).filter((proof): proof is { name: string; url: string } => Boolean(proof));
  }

  return (
    <div className="space-y-6">
      {order.payment_amount_bs !== null || order.payment_date ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Datos del Pago Móvil</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Monto pagado en bolívares</dt><dd className="mt-1 text-sm font-medium text-ink">Bs. {order.payment_amount_bs?.toFixed(2) ?? "-"}</dd></div><div><dt className="text-sm text-gray-500">Tasa aplicada</dt><dd className="mt-1 text-sm font-medium text-ink">{order.payment_exchange_rate ? `${order.payment_exchange_rate.toFixed(4)} Bs/USD` : "-"}</dd></div><div><dt className="text-sm text-gray-500">Fecha del pago</dt><dd className="mt-1 text-sm font-medium text-ink">{order.payment_date ?? "-"}</dd></div><div><dt className="text-sm text-gray-500">Referencia bancaria</dt><dd className="mt-1 text-sm font-medium text-ink">{order.payment_reference ?? "-"}</dd></div></dl></AdminDetailPanel> : null}
       {order.reviewed_at ? <p className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">Pago revisado por <strong className="text-ink">{order.reviewed_by ?? "administración"}</strong> el {formatDateTime(order.reviewed_at)}.</p> : null}
       <AdminPageHeader eyebrow="Marketplace" title={`Pedido ${order.order_number}`} description="Consulta el pago, los datos de entrega y el seguimiento del pedido." navigation={{ baseHref: "/admin/marketplace", baseLabel: "Marketplace", currentLabel: order.order_number }} />
      {query.created === "1" ? <div className="rounded-md bg-success-soft px-4 py-3 text-sm font-semibold text-success">Pedido creado. El pago y el comprobante quedan pendientes de validación.</div> : null}
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/marketplace" className="text-sm font-semibold text-primary hover:underline">Volver a pedidos</Link><div className="flex flex-wrap gap-2"><Badge label={MARKETPLACE_PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status} tone={MARKETPLACE_PAYMENT_STATUS_TONES[order.payment_status] ?? "bg-gray-100 text-gray-700"} /><Badge label={MARKETPLACE_ORDER_STATUS_LABELS[order.order_status] ?? order.order_status} tone={MARKETPLACE_ORDER_STATUS_TONES[order.order_status] ?? "bg-gray-100 text-gray-700"} /></div></div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Resumen del pedido</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Producto</dt><dd className="mt-1 text-sm font-medium text-ink">{order.product_name_snapshot}</dd></div><div><dt className="text-sm text-gray-500">Aliado</dt><dd className="mt-1 text-sm font-medium text-ink">{order.ally?.name ?? "-"}</dd></div><div><dt className="text-sm text-gray-500">Cantidad</dt><dd className="mt-1 text-sm font-medium text-ink">{order.quantity}</dd></div><div><dt className="text-sm text-gray-500">Total</dt><dd className="mt-1 text-sm font-medium text-ink">{formatUsd(order.total_usd)}</dd></div><div><dt className="text-sm text-gray-500">Creado</dt><dd className="mt-1 text-sm font-medium text-ink">{formatDateTime(order.created_at)}</dd></div></dl></AdminDetailPanel>
        <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Datos de entrega</h2><dl className="mt-5 grid gap-5"><div><dt className="text-sm text-gray-500">Comprador</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_name}</dd></div><div><dt className="text-sm text-gray-500">Correo</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_email}</dd><dd className="mt-2"><a href={`mailto:${order.buyer_email}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><Mail className="h-4 w-4" /> Escribir correo</a></dd></div><div><dt className="text-sm text-gray-500">WhatsApp</dt><dd className="mt-1 text-sm font-medium text-ink">{order.buyer_whatsapp}</dd><dd className="mt-2">{whatsappHref(order.buyer_whatsapp, order.order_number) ? <a href={whatsappHref(order.buyer_whatsapp, order.order_number) ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#168A3D] hover:underline"><MessageCircle className="h-4 w-4" /> Contactar por WhatsApp</a> : null}</dd></div><div><dt className="text-sm text-gray-500">Dirección</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-ink">{order.delivery_address}</dd></div></dl></AdminDetailPanel>
      </div>

      <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Pago</h2><div className="mt-4 grid gap-5 md:grid-cols-2"><div className="text-sm text-gray-600"><p>Medio: <strong className="text-ink">{order.payment_method_name_snapshot ?? order.payment_method?.name ?? "No especificado"}</strong></p>{order.payment_method_url_snapshot ?? order.paypal_url_snapshot ? <a href={order.payment_method_url_snapshot ?? order.paypal_url_snapshot ?? "#"} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">Abrir enlace de pago usado</a> : null}{order.payment_reference ?? order.paypal_reference ? <p className="mt-4">Referencia: <strong className="text-ink">{order.payment_reference ?? order.paypal_reference}</strong></p> : null}</div><div>{order.payment_method_details_snapshot ? <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">{order.payment_method_details_snapshot}</p> : null}{order.payment_instructions_snapshot ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{order.payment_instructions_snapshot}</p> : null}{proofUrl ? <a href={proofUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">Ver comprobante privado</a> : null}{proofUrls.length ? <div className="mt-3 grid gap-2">{proofUrls.map((proof) => <a key={proof.url} href={proof.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">Ver {proof.name}</a>)}</div> : null}{!proofUrl && !proofUrls.length ? <p className="mt-3 text-sm text-gray-500">El comprobante puede llegar por WhatsApp o cargarse desde el checkout.</p> : null}</div></div>{order.payment_review_notes ? <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">Nota de revisión: {order.payment_review_notes}</p> : null}</AdminDetailPanel>

       {isAdmin && ["en_revision", "rechazado", "pendiente_comprobante"].includes(order.payment_status) ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Revisar pago</h2><p className="mt-2 text-sm leading-6 text-gray-600">Verifica el método, el monto, la referencia y el comprobante antes de actualizar el estado de pago.</p><div className="mt-4 flex flex-wrap gap-2"><Modal triggerLabel="Confirmar pago" triggerVariant="primary" title="Confirmar pago" description="El pedido quedará aprobado para continuar con la gestión de entrega."><form action={reviewMarketplacePaymentAction} className="grid gap-4"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="paymentStatus" value="aprobado" /><textarea className={`${compactInputClassName} min-h-[90px]`} name="notes" defaultValue={order.payment_review_notes ?? ""} placeholder="Notas de revisión (opcional)" /><Button type="submit">Confirmar pago</Button></form></Modal><Modal triggerLabel="Rechazar pago" triggerVariant="secondary" title="Rechazar pago" description="El pago quedará rechazado y la reserva de inventario se liberará según las reglas actuales."><form action={reviewMarketplacePaymentAction} className="grid gap-4"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="paymentStatus" value="rechazado" /><textarea className={`${compactInputClassName} min-h-[90px]`} name="notes" defaultValue={order.payment_review_notes ?? ""} placeholder="Indica el motivo del rechazo" required /><Button type="submit" variant="secondary">Rechazar pago</Button></form></Modal></div></AdminDetailPanel> : null}

      {(isAdmin || isAlly) && order.payment_status === "aprobado" && !["entregado", "cancelado"].includes(order.order_status) ? <AdminDetailPanel><h2 className="text-lg font-semibold text-ink">Gestionar entrega</h2><form action={updateMarketplaceOrderDeliveryAction} className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"><input type="hidden" name="orderId" value={order.id} /><select className={compactInputClassName} name="orderStatus" defaultValue={order.order_status === "pago_aprobado" ? "en_preparacion" : order.order_status}><option value="en_preparacion">En preparación</option><option value="enviado">Enviado</option><option value="entregado">Entregado</option><option value="cancelado">Cancelado</option></select><input className={compactInputClassName} name="deliveryNotes" defaultValue={order.delivery_notes ?? ""} placeholder="Notas de entrega" /><Button type="submit">Actualizar estado</Button></form></AdminDetailPanel> : null}

      {isAdmin && !["entregado", "cancelado"].includes(order.order_status) ? <Modal triggerLabel="Cancelar pedido" triggerVariant="secondary" title="Cancelar pedido" description="El pedido quedará cancelado. La devolución del inventario debe revisarse manualmente."><form action={updateMarketplaceOrderDeliveryAction} className="grid gap-4"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="orderStatus" value="cancelado" /><textarea className={`${compactInputClassName} min-h-[90px]`} name="deliveryNotes" placeholder="Motivo de cancelación" /><Button type="submit" variant="secondary">Confirmar cancelación</Button></form></Modal> : null}
    </div>
  );
}
