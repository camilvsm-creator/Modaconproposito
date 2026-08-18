import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getMarketplaceImageUrl } from "@/lib/marketplace";
import type { MarketplaceProduct } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function MarketplaceProductCard({
  product,
}: {
  product: MarketplaceProduct;
}) {
  const imageUrl = getMarketplaceImageUrl(product.images?.[0]?.storage_path);
  const inStock = product.stock_quantity > 0;

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ring-1 ring-[#F6026B]/10 transition-colors hover:border-[#F6026B]">
      <Link
        href={`/marketplace/${product.slug}`}
        className="flex h-full flex-col"
      >
        <div className="aspect-[4/3] bg-[#FFE6F0]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-[#C00253]">
              Moda con Propósito
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-black leading-snug tracking-[-0.01em] text-ink">
              {product.name}
            </h2>
            <p className="shrink-0 text-lg font-black text-[#C00253]">
              {formatUsd(product.price_usd)}
            </p>
          </div>
          {product.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
              {product.description}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <span className="rounded-full bg-[#FFE6F0] px-2.5 py-0.5 text-sm font-semibold text-[#C00253]">
              {product.ally?.name ?? "Aliado de la red"}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                inStock ? "bg-stone-100 text-stone-600" : "bg-stone-100 text-stone-400"
              }`}
            >
              {inStock ? `${product.stock_quantity} disp.` : "Agotado"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end border-t border-stone-100 px-5 py-3">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#F6026B]">
            Comprar
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}
