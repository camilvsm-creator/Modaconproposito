"use client";

import { useState } from "react";

import { createMarketplaceOrderAction } from "@/app/admin/marketplace/actions";
import { Button, compactInputClassName } from "@/components/ui";
import type { MarketplaceCustomer, MarketplaceProduct } from "@/lib/types";

export function MarketplaceCheckoutForm({
  product,
  customer,
}: {
  product: MarketplaceProduct;
  customer: MarketplaceCustomer;
}) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    const result = await createMarketplaceOrderAction(new FormData(event.currentTarget));
    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <input type="hidden" name="productId" value={product.id} />
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Cantidad</span><input className={compactInputClassName} name="quantity" type="number" min="1" max={product.stock_quantity} defaultValue="1" required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre completo</span><input className={compactInputClassName} name="buyerName" defaultValue={customer.full_name} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={compactInputClassName} name="buyerEmail" type="email" defaultValue={customer.email} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp</span><input className={compactInputClassName} name="buyerWhatsapp" defaultValue={customer.whatsapp} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Dirección de entrega</span><textarea className={`${compactInputClassName} min-h-[88px]`} name="deliveryAddress" defaultValue={customer.address} required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Comprobante de pago</span><input className={compactInputClassName} name="paymentProof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /><span className="text-sm text-gray-500">JPG, PNG, WEBP o PDF. Máximo 8 MB.</span></label>
      {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "Enviando pedido..." : "Enviar pedido"}</Button>
    </form>
  );
}
