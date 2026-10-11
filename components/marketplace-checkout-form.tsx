"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";

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
  paymentMethodCode: string;
  paymentInstructions: string | null;
  paymentDetails: string | null;
  paymentSupportsAmount: boolean;
  totalUsd: number;
  paymentAmountBs: number | null;
  paymentExchangeRate: number | null;
};

function getPaymentUrl(method: CreatedOrder, total: number) {
  if (!method.paymentUrl) return null;
  const url = new URL(method.paymentUrl);
  if (method.paymentSupportsAmount) url.pathname = `${url.pathname.replace(/\/+$/, "")}/${total.toFixed(2)}`;
  return url.toString();
}

function isPagoMovil(method: MarketplacePaymentMethod | CreatedOrder | null) {
  if (!method) return false;
  const code = "code" in method ? method.code : method.paymentMethodCode;
  return code === "pago-movil" || code === "pago_movil";
}

function CopyValueButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return <button type="button" onClick={copyValue} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#F6026B]/20 px-2.5 text-sm font-semibold text-[#C00253] hover:bg-white">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copiado" : "Copiar"}</button>;
}

function PaymentMobileCard({ method, rate }: { method: MarketplacePaymentMethod; rate: number | null }) {
  return <div className="rounded-2xl border border-[#F6026B]/20 bg-[#FFF0F6] p-5">
    <h3 className="font-black text-ink">Pago Móvil - Fundación Juan Pablo 2 Santos</h3>
    <dl className="mt-4 grid gap-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-stone-600">Banco</dt><dd className="font-bold text-ink">Bancamiga</dd></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-stone-600">RIF</dt><dd className="flex items-center gap-2 font-bold text-ink">J502500073 <CopyValueButton value="J502500073" /></dd></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-stone-600">Teléfono</dt><dd className="flex items-center gap-2 font-bold text-ink">04147775765 <CopyValueButton value="04147775765" /></dd></div>
    </dl>
    <p className="mt-4 border-t border-[#F6026B]/15 pt-4 text-sm leading-6 text-stone-700">Realiza el Pago Móvil desde tu aplicación bancaria utilizando los datos indicados. Una vez completado, adjunta el comprobante para que podamos verificar tu compra.</p>
    {rate ? <p className="mt-3 text-sm font-semibold text-[#C00253]">Tasa oficial consultada: 1 USD = {rate.toFixed(4)} Bs.</p> : null}
    {method.payment_details && method.payment_details.includes("Fundación") === false ? <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">{method.payment_details}</p> : null}
  </div>;
}

export function MarketplaceCheckoutForm({
  product,
  paymentMethods,
  officialDollarRate,
}: {
  product: MarketplaceProduct;
  paymentMethods: MarketplacePaymentMethod[];
  officialDollarRate: { rate: number; updatedAt: string | null } | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSubmissionKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const total = product.price_usd * quantity;
  const selectedMethod = paymentMethods.find((method) => method.id === selectedMethodId) ?? paymentMethods[0];
  const selectedIsPagoMovil = isPagoMovil(selectedMethod);

  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const result = await createMarketplaceOrderAction(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error || !result.orderId || !result.orderNumber || !result.guestAccessToken || !result.paymentMethodName || !result.paymentMethodType || !result.paymentMethodCode) {
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
      paymentMethodCode: result.paymentMethodCode,
      paymentInstructions: result.paymentInstructions ?? null,
      paymentDetails: result.paymentDetails ?? null,
      paymentSupportsAmount: result.paymentSupportsAmount ?? false,
      totalUsd: result.totalUsd ?? total,
      paymentAmountBs: result.paymentAmountBs ?? null,
      paymentExchangeRate: result.paymentExchangeRate ?? null,
    });
  }

  async function submitPayment() {
    if (!createdOrder) return;
    const mobile = isPagoMovil(createdOrder);
    if (mobile && (!paymentReference.trim() || !paymentDate || !proof)) {
      setError("Completa la referencia, la fecha y adjunta el comprobante.");
      return;
    }
    if (mobile && proof && (!["image/jpeg", "image/png", "application/pdf"].includes(proof.type) || proof.size > 8 * 1024 * 1024)) {
      setError("El comprobante debe ser JPG, PNG o PDF de hasta 8 MB.");
      return;
    }
    setError(undefined);
    setLoading(true);
    const formData = new FormData();
    formData.set("orderId", createdOrder.orderId);
    formData.set("guestAccessToken", createdOrder.guestAccessToken);
    formData.set("paymentReference", paymentReference);
    formData.set("paymentDate", paymentDate);
    if (mobile) formData.set("paymentSubmissionKey", paymentSubmissionKey);
    if (proof) formData.set("paymentProof", proof);
    const result = await submitMarketplacePaymentAction(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.assign(`/marketplace/gracias?pedido=${encodeURIComponent(createdOrder.orderNumber)}&metodo=${mobile ? "pago-movil" : "paypal"}`);
  }

  if (createdOrder) {
    const paymentUrl = getPaymentUrl(createdOrder, createdOrder.totalUsd);
    const mobile = isPagoMovil(createdOrder);
    return <div className="grid gap-5">
      <div className="rounded-2xl bg-[#FFF0F6] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" />
          <div>
            <p className="font-black text-ink">Pedido {createdOrder.orderNumber} preparado</p>
            <p className="mt-1 text-sm leading-6 text-stone-600">Total del pedido: <strong className="text-ink">{formatUsd(createdOrder.totalUsd)}</strong>{mobile && createdOrder.paymentAmountBs ? <>. Monto a pagar: <strong className="text-[#C00253]">Bs. {createdOrder.paymentAmountBs.toFixed(2)}</strong></> : null}</p>
          </div>
        </div>
        {createdOrder.paymentDetails && !mobile ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-stone-700">{createdOrder.paymentDetails}</p> : null}
        {createdOrder.paymentInstructions && !mobile ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">{createdOrder.paymentInstructions}</p> : null}
        {paymentUrl ? <a href={paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0070BA] px-5 py-3 text-sm font-bold text-white hover:bg-[#005EA6]">Abrir {createdOrder.paymentMethodName} y pagar {formatUsd(createdOrder.totalUsd)} <ExternalLink className="h-4 w-4" /></a> : null}
      </div>

      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Referencia bancaria {mobile ? <span className="text-danger">*</span> : <span className="font-normal text-stone-500">(opcional)</span>}</span><input className={compactInputClassName} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={120} required={mobile} placeholder="Número de referencia" /></label>
      {mobile ? <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Fecha del pago <span className="text-danger">*</span></span><input className={compactInputClassName} type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} max={new Date().toISOString().slice(0, 10)} required /></label> : null}
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Comprobante {mobile ? <span className="text-danger">*</span> : <span className="font-normal text-stone-500">(opcional)</span>}</span><input className={compactInputClassName} type="file" accept="image/jpeg,image/png,application/pdf" required={mobile} onChange={(event) => setProof(event.target.files?.[0] ?? null)} /><span className="text-sm text-stone-500">JPG, PNG o PDF. Máximo 8 MB{proof ? ` · ${proof.name}` : ""}.</span></label>
      {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <Button type="button" onClick={submitPayment} disabled={loading}>{loading ? "Enviando pedido..." : mobile ? "Enviar pedido y comprobante" : "Ya realicé el pago y continuar"}</Button>
      <p className="text-sm leading-6 text-stone-500">El pedido quedará pendiente de validación. El equipo de Moda con Propósito te contactará para confirmar el pago y coordinar la entrega.</p>
    </div>;
  }

  return <form onSubmit={createOrder} className="grid gap-4">
    <input type="hidden" name="productId" value={product.id} />
    <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Cantidad</span><input className={compactInputClassName} name="quantity" type="number" min="1" max={product.stock_quantity} value={quantity} onChange={(event) => setQuantity(Math.min(Math.max(Number(event.target.value) || 1, 1), product.stock_quantity))} required /></label>
    <div className="rounded-xl bg-stone-50 p-4"><p className="text-sm text-stone-600">Total del pedido</p><p className="mt-1 text-2xl font-black text-[#C00253]">{formatUsd(total)}</p>{selectedIsPagoMovil && officialDollarRate ? <><p className="mt-1 text-sm font-semibold text-[#C00253]">Pago Móvil: Bs. {(Math.round((total * officialDollarRate.rate + Number.EPSILON) * 100) / 100).toFixed(2)}</p><p className="mt-1 text-sm text-stone-500">Tasa oficial BCV consultada en esta visita.</p></> : selectedIsPagoMovil ? <p className="mt-1 text-sm text-danger">No se pudo consultar la tasa oficial. Intenta nuevamente.</p> : null}</div>
    <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre completo</span><input className={compactInputClassName} name="buyerName" autoComplete="name" required /></label>
    <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={compactInputClassName} name="buyerEmail" type="email" autoComplete="email" required /></label>
    <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp</span><input className={compactInputClassName} name="buyerWhatsapp" type="tel" autoComplete="tel" required /></label>
    <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Dirección o forma de entrega</span><textarea className={`${compactInputClassName} min-h-[88px]`} name="deliveryAddress" autoComplete="street-address" required placeholder="Indica dónde recibirás el producto o cómo coordinamos la entrega." /></label>
    <fieldset className="grid gap-3"><legend className="text-sm font-medium text-gray-800">Elige cómo pagar</legend>{paymentMethods.map((method) => <label key={method.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 has-[:checked]:border-[#F6026B]/30 has-[:checked]:bg-[#FFF0F6]"><input className="mt-1" type="radio" name="paymentMethodId" value={method.id} checked={selectedMethodId === method.id} onChange={() => setSelectedMethodId(method.id)} required /><span><span className="block text-sm font-bold text-ink">{method.name}</span><span className="mt-1 block text-sm leading-6 text-stone-600">{method.code === "paypal" ? "Se abrirá un enlace de pago con el total de tu pedido." : "Realiza tu pago directamente a la fundación y adjunta tu comprobante."}</span></span></label>)}</fieldset>
    {selectedIsPagoMovil && selectedMethod ? <PaymentMobileCard method={selectedMethod} rate={officialDollarRate?.rate ?? null} /> : null}
    {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
    <Button type="submit" disabled={loading}>{loading ? "Preparando pedido..." : "Continuar al pago"}</Button>
    <p className="text-sm leading-6 text-stone-500">No necesitas crear una cuenta. Guardaremos tus datos solo para gestionar este pedido y coordinar la entrega.</p>
  </form>;
}
