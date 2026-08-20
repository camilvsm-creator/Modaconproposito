"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { createMarketplaceOrderAction, submitMarketplacePaymentAction } from "@/app/admin/marketplace/actions";
import { Button, compactInputClassName } from "@/components/ui";
import type { MarketplacePaymentMethod, MarketplaceProduct } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

type CreatedOrder = {
  orderId: string;
  orderNumber: string;
  guestAccessToken: string;
  paymentUrl: string | null;
  paymentMethodName: string;
  paymentMethodType: string;
  paymentInstructions: string | null;
  paymentDetails: string | null;
  paymentSupportsAmount: boolean;
  totalUsd: number;
};

function getPaymentUrl(method: CreatedOrder, total: number) {
  if (!method.paymentUrl) return null;
  const url = new URL(method.paymentUrl);
  if (method.paymentSupportsAmount) url.pathname = `${url.pathname.replace(/\/+$/, "")}/${total.toFixed(2)}`;
  return url.toString();
}

export function MarketplaceCheckoutForm({
  product,
  paymentMethods,
}: {
  product: MarketplaceProduct;
  paymentMethods: MarketplacePaymentMethod[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const total = product.price_usd * quantity;

  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const result = await createMarketplaceOrderAction(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error || !result.orderId || !result.orderNumber || !result.guestAccessToken || !result.paymentMethodName || !result.paymentMethodType) {
      setError(result.error ?? "No se pudo preparar el pedido.");
      return;
    }
    setCreatedOrder({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      guestAccessToken: result.guestAccessToken,
      paymentUrl: result.paymentUrl ?? null,
      paymentMethodName: result.paymentMethodName,
      paymentMethodType: result.paymentMethodType,
      paymentInstructions: result.paymentInstructions ?? null,
      paymentDetails: result.paymentDetails ?? null,
      paymentSupportsAmount: result.paymentSupportsAmount ?? false,
      totalUsd: result.totalUsd ?? total,
    });
  }

  async function submitPayment() {
    if (!createdOrder) return;
    setError(undefined);
    setLoading(true);
    const formData = new FormData();
    formData.set("orderId", createdOrder.orderId);
    formData.set("guestAccessToken", createdOrder.guestAccessToken);
    formData.set("paymentReference", paymentReference);
    if (proof) formData.set("paymentProof", proof);
    const result = await submitMarketplacePaymentAction(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.assign(`/marketplace/gracias?pedido=${encodeURIComponent(createdOrder.orderNumber)}`);
  }

  if (createdOrder) {
    const paymentUrl = getPaymentUrl(createdOrder, createdOrder.totalUsd);
    return (
      <div className="grid gap-5">
        <div className="rounded-2xl bg-[#FFF0F6] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" />
            <div>
              <p className="font-black text-ink">Pedido {createdOrder.orderNumber} preparado</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">Total a pagar: <strong className="text-ink">{formatUsd(createdOrder.totalUsd)}</strong>. Completa el pago y luego vuelve a esta pantalla.</p>
            </div>
          </div>
          {createdOrder.paymentDetails ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-stone-700">{createdOrder.paymentDetails}</p> : null}
          {createdOrder.paymentInstructions ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">{createdOrder.paymentInstructions}</p> : null}
          {paymentUrl ? (
            <a href={paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0070BA] px-5 py-3 text-sm font-bold text-white hover:bg-[#005EA6]">
              Abrir {createdOrder.paymentMethodName} y pagar {formatUsd(createdOrder.totalUsd)} <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Referencia de pago <span className="font-normal text-stone-500">(opcional)</span></span><input className={compactInputClassName} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={120} placeholder="Referencia, número de operación o nota" /></label>
        <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Comprobante <span className="font-normal text-stone-500">(opcional)</span></span><input className={compactInputClassName} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} /><span className="text-sm text-stone-500">Puedes cargarlo después de pagar. Máximo 8 MB.</span></label>
        {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
        <Button type="button" onClick={submitPayment} disabled={loading}>{loading ? "Enviando pedido..." : "Ya realicé el pago y continuar"}</Button>
        <p className="text-sm leading-6 text-stone-500">El pedido quedará pendiente de validación. El equipo de Moda con Propósito te contactará para confirmar el pago y coordinar la entrega.</p>
      </div>
    );
  }

  return (
    <form onSubmit={createOrder} className="grid gap-4">
      <input type="hidden" name="productId" value={product.id} />
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Cantidad</span><input className={compactInputClassName} name="quantity" type="number" min="1" max={product.stock_quantity} value={quantity} onChange={(event) => setQuantity(Math.min(Math.max(Number(event.target.value) || 1, 1), product.stock_quantity))} required /></label>
      <div className="rounded-xl bg-stone-50 p-4"><p className="text-sm text-stone-600">Total del pedido</p><p className="mt-1 text-2xl font-black text-[#C00253]">{formatUsd(total)}</p></div>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre completo</span><input className={compactInputClassName} name="buyerName" autoComplete="name" required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={compactInputClassName} name="buyerEmail" type="email" autoComplete="email" required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp</span><input className={compactInputClassName} name="buyerWhatsapp" type="tel" autoComplete="tel" required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Dirección o forma de entrega</span><textarea className={`${compactInputClassName} min-h-[88px]`} name="deliveryAddress" autoComplete="street-address" required placeholder="Indica dónde recibirás el producto o cómo coordinamos la entrega." /></label>
      <fieldset className="grid gap-2"><legend className="text-sm font-medium text-gray-800">Elige cómo pagar</legend>{paymentMethods.map((method) => <label key={method.id} className="flex cursor-pointer items-start gap-3 rounded-xl bg-stone-50 p-4 has-[:checked]:bg-[#FFF0F6]"><input className="mt-1" type="radio" name="paymentMethodId" value={method.id} defaultChecked={method === paymentMethods[0]} required /><span><span className="block text-sm font-bold text-ink">{method.name}</span><span className="mt-1 block text-sm leading-6 text-stone-600">{method.method_type === "link" ? "Se abrirá su enlace de pago con el total." : "Verás los datos e instrucciones después de crear el pedido."}</span></span></label>)}</fieldset>
      {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "Preparando pedido..." : "Continuar al pago"}</Button>
      <p className="text-sm leading-6 text-stone-500">No necesitas crear una cuenta. Guardaremos tus datos solo para gestionar este pedido y coordinar la entrega.</p>
    </form>
  );
}
