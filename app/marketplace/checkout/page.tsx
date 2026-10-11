import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { MarketplaceCheckoutForm } from "@/components/marketplace-checkout-form";
import { SectionCard } from "@/components/ui";
import { getMarketplacePaymentMethods, getOfficialMarketplaceDollarRate, getPublicMarketplaceProductBySlug, releaseExpiredMarketplaceReservations } from "@/lib/marketplace";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { formatUsd } from "@/lib/utils";

export default async function MarketplaceCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productId = typeof params.product === "string" ? params.product : "";
  await releaseExpiredMarketplaceReservations();
  const supabase = createSupabasePublicClient();
  const { data: productRow } = await supabase.from("marketplace_products").select("slug").eq("id", productId).eq("status", "aprobado").maybeSingle();
  if (!productRow) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="Producto no disponible" description="Regresa al marketplace para elegir otro producto." action={<Link href="/marketplace" className="font-bold text-[#F6026B]">Ver marketplace</Link>} /></div>;
  const product = await getPublicMarketplaceProductBySlug(productRow.slug);
  const paymentMethods = await getMarketplacePaymentMethods();
  const officialDollarRate = await getOfficialMarketplaceDollarRate();
  if (!product || !paymentMethods.length) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="No pudimos preparar la compra" description="El equipo todavía no ha configurado métodos de pago." /></div>;

  return (
    <div className="full-bleed bg-[#FFF8FA] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionCard className="p-6 ring-1 ring-stone-200">
          <Link href={`/marketplace/${product.slug}`} className="text-sm font-bold text-[#F6026B] hover:underline">Volver al producto</Link>
          <h1 className="mt-4 text-2xl font-black text-ink">{product.name}</h1>
          <p className="mt-2 text-2xl font-black text-[#C00253]">{formatUsd(product.price_usd)}</p>
          <p className="mt-3 text-sm text-stone-600">Disponible: {product.stock_quantity} unidades</p>
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#F6026B]/15 bg-[#FFF8FA] p-3 text-sm leading-6 text-stone-600">
            <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#F6026B]" />
            <span>
              <strong className="text-ink">Compra solidaria:</strong> el 100% de lo recaudado a través de este pedido se
              destina directamente al fondo de la Fundación Juan Pablo 2 Santos.
            </span>
          </p>
          <div className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
            <p className="font-bold text-ink">Cómo completar tu compra</p>
            <ol className="mt-3 grid gap-3 leading-6">
              <li><strong className="text-ink">1.</strong> Déjanos tus datos y elige cómo quieres pagar.</li>
              <li><strong className="text-ink">2.</strong> Realiza el pago o sigue las instrucciones del método elegido.</li>
              <li><strong className="text-ink">3.</strong> El equipo de Moda con Propósito verificará el pago y coordinará la entrega contigo.</li>
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-stone-100 p-3 text-sm leading-6"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F6026B]" />El pedido queda pendiente de confirmación hasta que el equipo valide el pago.</p>
          </div>
        </SectionCard>
        <SectionCard className="p-6 ring-1 ring-stone-200 sm:p-8">
          <h2 className="text-2xl font-black text-ink">Completar pedido</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">No necesitas crear una cuenta. Completa tus datos, elige un método de pago y sigue las instrucciones. Podrás cargar el comprobante después de pagar.</p>
           <div className="mt-6"><MarketplaceCheckoutForm product={product} paymentMethods={paymentMethods} officialDollarRate={officialDollarRate} /></div>
        </SectionCard>
      </div>
    </div>
  );
}
