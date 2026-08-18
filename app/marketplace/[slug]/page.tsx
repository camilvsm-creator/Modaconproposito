import { Package, Store } from "lucide-react";
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
          <ProductImageGallery images={images} productName={product.name} />

          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-[#C00253] sm:text-3xl">
                {formatUsd(product.price_usd)}
              </p>
            </div>

            {product.description ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {product.description}
              </p>
            ) : null}

            <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex items-center gap-3 text-sm text-stone-600">
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
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Package className="h-4 w-4 shrink-0 text-[#F6026B]" />
                <span>
                  {inStock ? (
                    <>
                      <span className="font-bold text-ink">
                        {product.stock_quantity}
                      </span>{" "}
                      {product.stock_quantity === 1
                        ? "unidad disponible"
                        : "unidades disponibles"}
                    </>
                  ) : (
                    <span className="font-semibold text-stone-400">
                      Producto agotado
                    </span>
                  )}
                </span>
              </div>
            </div>

            {inStock ? (
              <LinkButton
                href={`/marketplace/checkout?product=${product.id}`}
                className="w-full sm:w-auto"
              >
                Comprar producto
              </LinkButton>
            ) : (
              <EmptyState
                title="Producto agotado"
                description="Este aliado actualizará su inventario próximamente."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
