import { ChevronDown, HeartHandshake, Store } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { LinkButton } from "@/components/ui";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { getPublicMarketplaceProductBySlug } from "@/lib/marketplace";
import { formatUsd } from "@/lib/utils";

export default async function MarketplaceProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicMarketplaceProductBySlug(slug);
  if (!product) notFound();

  const images = product.images ?? [];
  const inStock = product.stock_quantity > 0;

  return (
    <div className="full-bleed border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F6026B] hover:underline"
        >
          ← Volver al marketplace
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="mx-auto w-full max-w-[520px]">
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          <div className="space-y-7">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-[#C00253] sm:text-3xl">
                {formatUsd(product.price_usd)}
              </p>
              <p className="text-sm">
                {inStock ? (
                  <span className="font-semibold text-stone-600">
                    <span className="font-bold text-ink">{product.stock_quantity}</span>{" "}
                    {product.stock_quantity === 1 ? "unidad disponible" : "unidades disponibles"}
                  </span>
                ) : (
                  <span className="font-semibold text-stone-400">Producto agotado</span>
                )}
              </p>
            </div>

            <div className="space-y-6 border-t border-stone-100 pt-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-stone-500">Sobre este producto</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                  {product.description || "Este aliado todavía está completando la descripción del producto."}
                </p>
              </div>

              <p className="flex items-center gap-2 text-sm text-stone-500">
                <Store className="h-4 w-4 shrink-0 text-[#F6026B]" />
                <span>
                  Elaborado por{" "}
                  {product.ally?.slug ? (
                    <Link href={`/aliados/${product.ally.slug}`} className="font-bold text-ink hover:underline">
                      {product.ally.name}
                    </Link>
                  ) : (
                    <span className="font-bold text-ink">
                      {product.ally?.name ?? "un aliado de Moda con Propósito"}
                    </span>
                  )}
                </span>
              </p>

              <div className="rounded-2xl border border-[#F6026B]/20 bg-[#FFF8FA] p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#C00253]">
                  <HeartHandshake className="h-4 w-4 shrink-0" />
                  ¿A dónde va tu aporte?
                </h2>
                <p className="mt-3 text-base leading-7 text-stone-700">
                  <strong className="font-black text-[#C00253]">El 100% de tu compra</strong> se destina íntegramente
                  al fondo de la Fundación Juan Pablo 2 Santos.
                </p>
              </div>

              {inStock ? (
                <LinkButton
                  href={`/marketplace/checkout?product=${product.id}`}
                  className="w-full"
                >
                  Comprar producto · {formatUsd(product.price_usd)}
                </LinkButton>
              ) : (
                <EmptyState
                  title="Producto agotado"
                  description="Este aliado actualizará su inventario próximamente."
                />
              )}

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-bold text-stone-600 transition hover:text-ink">
                  ¿Cómo funciona la compra?
                  <ChevronDown className="h-4 w-4 shrink-0 text-stone-400 transition group-open:rotate-180" />
                </summary>
                <ol className="mt-3 space-y-2 border-t border-stone-100 pt-3 text-sm leading-6 text-stone-600">
                  <li><strong className="text-ink">1.</strong> Haz clic en “Comprar producto” y completa tus datos.</li>
                  <li><strong className="text-ink">2.</strong> Elige PayPal u otro método disponible y realiza el pago.</li>
                  <li><strong className="text-ink">3.</strong> El equipo de Moda con Propósito confirmará el pago y coordinará contigo la entrega.</li>
                </ol>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
