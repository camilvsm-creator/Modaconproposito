"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

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

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isLightboxOpen]);

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-[#FFE6F0] ring-1 ring-stone-200">
        {activeUrl ? (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="group relative h-full w-full cursor-zoom-in"
            aria-label={`Abrir imagen de ${productName}`}
          >
            <img src={activeUrl} alt={productName} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">Ver imagen grande</span>
          </button>
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

      {isLightboxOpen && activeUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${productName}`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button type="button" onClick={() => setIsLightboxOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Cerrar imagen"><X className="h-6 w-6" /></button>
          {images.length > 1 ? <button type="button" onClick={(event) => { event.stopPropagation(); setActiveIndex((current) => (current - 1 + images.length) % images.length); }} className="absolute left-3 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 sm:left-6" aria-label="Imagen anterior"><ChevronLeft className="h-7 w-7" /></button> : null}
          <img src={activeUrl} alt={productName} className="max-h-[88vh] max-w-[92vw] object-contain" onClick={(event) => event.stopPropagation()} />
          {images.length > 1 ? <button type="button" onClick={(event) => { event.stopPropagation(); setActiveIndex((current) => (current + 1) % images.length); }} className="absolute right-3 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 sm:right-6" aria-label="Imagen siguiente"><ChevronRight className="h-7 w-7" /></button> : null}
        </div>
      ) : null}
    </div>
  );
}
