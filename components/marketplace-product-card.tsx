import { Images } from "lucide-react";
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
    <div className="h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/marketplace/${product.slug}`}
        className="flex h-full flex-col"
      >
        <div className="relative h-64 bg-stone-50 sm:h-72">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-[#C00253]">
              Moda con Propósito
            </div>
          )}
          {product.images && product.images.length > 1 ? (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-stone-700 shadow-sm">
              <Images className="h-4 w-4 text-[#F6026B]" />
              {product.images.length} fotos
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-black leading-snug tracking-[-0.01em] text-ink">
              {product.name}
            </h2>
            <p className="shrink-0 text-base font-black text-[#C00253]">
              {formatUsd(product.price_usd)}
            </p>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
            {product.description || "Producto elaborado por un aliado de Moda con Propósito."}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            <span className="rounded-full bg-[#FFF0F6] px-2.5 py-1 text-sm font-semibold text-[#C00253]">
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
      </Link>
    </div>
  );
}
