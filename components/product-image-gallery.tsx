"use client";

import { useState } from "react";

import { getMarketplaceImageUrl } from "@/lib/marketplace-helpers";
import type { MarketplaceProductImage } from "@/lib/types";

export function ProductImageGallery({
  images,
  productName,
}: {
  images: MarketplaceProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];
  const activeUrl = active
    ? getMarketplaceImageUrl(active.storage_path)
    : null;

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-[#FFE6F0] ring-1 ring-stone-200">
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-[#C00253]">
            Moda con Propósito
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const thumbUrl = getMarketplaceImageUrl(image.storage_path);
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#FFE6F0] ring-2 transition ${
                  index === activeIndex
                    ? "ring-[#F6026B]"
                    : "ring-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`${productName} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
