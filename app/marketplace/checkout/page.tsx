import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { MarketplaceCheckoutForm } from "@/components/marketplace-checkout-form";
import { LinkButton, SectionCard } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getMarketplaceCustomerByUserId, getMarketplacePaymentSettings, getPublicMarketplaceProductBySlug } from "@/lib/marketplace";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { formatUsd } from "@/lib/utils";

export default async function MarketplaceCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productId = typeof params.product === "string" ? params.product : "";
  const user = await getCurrentUser();
  const redirectTo = `/marketplace/checkout?product=${encodeURIComponent(productId)}`;
  if (!user) redirect(`/marketplace/ingresar?redirectTo=${encodeURIComponent(redirectTo)}`);
  if (user.app_metadata?.role !== "comprador") {
    return (
      <div className="full-bleed bg-[#FFF8FA] px-4 py-10 sm:px-6">
        <SectionCard className="mx-auto max-w-xl p-8 text-center ring-1 ring-stone-200">
          <h1 className="text-2xl font-black text-ink">Necesitas una cuenta de comprador</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Tu sesión actual corresponde a otro tipo de usuario. Crea o inicia una cuenta de comprador para completar esta compra.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><LinkButton href={`/marketplace/registro?redirectTo=${encodeURIComponent(redirectTo)}`}>Crear cuenta</LinkButton><LinkButton href={`/marketplace/ingresar?redirectTo=${encodeURIComponent(redirectTo)}`} variant="secondary">Ingresar</LinkButton></div>
        </SectionCard>
      </div>
    );
  }

  const supabase = createSupabasePublicClient();
  const { data: productRow } = await supabase.from("marketplace_products").select("slug").eq("id", productId).eq("status", "aprobado").maybeSingle();
  if (!productRow) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="Producto no disponible" description="Regresa al marketplace para elegir otro producto." action={<Link href="/marketplace" className="font-bold text-[#F6026B]">Ver marketplace</Link>} /></div>;
  const product = await getPublicMarketplaceProductBySlug(productRow.slug);
  const customer = await getMarketplaceCustomerByUserId(user.id);
  const settings = await getMarketplacePaymentSettings();
  if (!product || !customer || !settings) return <div className="mx-auto max-w-3xl px-4 py-10"><EmptyState title="No pudimos preparar la compra" description="Intenta nuevamente en unos minutos." /></div>;

  return (
    <div className="full-bleed bg-[#FFF8FA] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionCard className="p-6 ring-1 ring-stone-200">
          <Link href={`/marketplace/${product.slug}`} className="text-sm font-bold text-[#F6026B] hover:underline">Volver al producto</Link>
          <h1 className="mt-4 text-2xl font-black text-ink">{product.name}</h1>
          <p className="mt-2 text-2xl font-black text-[#C00253]">{formatUsd(product.price_usd)}</p>
          <p className="mt-3 text-sm text-stone-600">Disponible: {product.stock_quantity} unidades</p>
          <div className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
            <p className="font-bold text-ink">Pago Móvil</p>
            <p className="mt-2">Teléfono: <span className="font-semibold text-ink">{settings.phone}</span></p>
            <p className="mt-1">Banco: <span className="font-semibold text-ink">{settings.bank}</span></p>
            <p className="mt-1">RIF: <span className="font-semibold text-ink">{settings.rif}</span></p>
            <p className="mt-1">Titular: <span className="font-semibold text-ink">{settings.account_holder}</span></p>
            {settings.instructions ? <p className="mt-3 whitespace-pre-wrap leading-6">{settings.instructions}</p> : null}
          </div>
        </SectionCard>
        <SectionCard className="p-6 ring-1 ring-stone-200 sm:p-8">
          <h2 className="text-2xl font-black text-ink">Completar pedido</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Realiza el pago y adjunta el comprobante. El equipo revisará el pago antes de enviarlo al aliado.</p>
          <div className="mt-6"><MarketplaceCheckoutForm product={product} customer={customer} /></div>
        </SectionCard>
      </div>
    </div>
  );
}
