import Link from "next/link";
import { HeartHandshake, PackageCheck, WalletCards } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { MarketplaceProductCard } from "@/components/marketplace-product-card";
import { getPublicMarketplaceProductsPage, releaseExpiredMarketplaceReservations } from "@/lib/marketplace";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Marketplace — Moda con Propósito",
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pageHref(page: number) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pageValue = Number(getParam(params, "page"));
  const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
  await releaseExpiredMarketplaceReservations();
  const result = await getPublicMarketplaceProductsPage({ page, limit: 12 });
  const hasPrevious = result.page > 1;
  const hasNext = result.page < result.pageCount;

  return (
    <div>
      <section className="full-bleed bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#FFFFFF] p-6 sm:p-8">
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">Productos de nuestra red de aliados</h1>
              {/* <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4"><WalletCards className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" /><span className="text-sm leading-6 text-stone-600"><strong className="block text-ink">Pago sencillo</strong>Usamos PayPal para recibir tu pago.</span></div>
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" /><span className="text-sm leading-6 text-stone-600"><strong className="block text-ink">Confirmación humana</strong>Revisamos cada pedido antes de prepararlo.</span></div>
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4"><HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[#F6026B]" /><span className="text-sm leading-6 text-stone-600"><strong className="block text-ink">Impacto real</strong>Tu compra fortalece a un aliado local.</span></div>
              </div> */}
            </div>
            {result.items.length ? (
              <>
                <p className="text-sm text-stone-500">
                  {result.total} {result.total === 1 ? "producto" : "productos"}
                </p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((product) => (
                  <MarketplaceProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
              </>
            ) : (
              <EmptyState
                title="No hay productos disponibles."
                description="Prueba otra búsqueda o vuelve más adelante."
              />
            )}

            {result.pageCount > 1 ? (
              <nav className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-sm font-bold text-stone-700 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Página {result.page} de {result.pageCount}
                </span>
                <div className="flex gap-2">
                  {hasPrevious ? (
                    <Link
                      href={pageHref(result.page - 1)}
                      className="rounded-full bg-white px-4 py-3 text-[#F6026B] ring-1 ring-stone-200 hover:bg-[#FFE6F0]"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <span className="pointer-events-none rounded-full bg-[#FFE6F0] px-4 py-3 text-stone-400 ring-1 ring-[#F6026B]/10">
                      Anterior
                    </span>
                  )}
                  {hasNext ? (
                    <Link
                      href={pageHref(result.page + 1)}
                      className="rounded-full bg-[#F6026B] px-4 py-3 text-white ring-1 ring-stone-200 hover:bg-[#C00253]"
                    >
                      Siguiente
                    </Link>
                  ) : (
                    <span className="pointer-events-none rounded-full bg-[#FFE6F0] px-4 py-3 text-stone-400 ring-1 ring-[#F6026B]/10">
                      Siguiente
                    </span>
                  )}
                </div>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
