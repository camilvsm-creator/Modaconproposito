import Link from "next/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { MarketplaceProductCard } from "@/components/marketplace-product-card";
import { MarketplaceContributionCard } from "@/components/marketplace-contribution-card";
import { getPublicMarketplaceProductsPage, MARKETPLACE_EVENT_BANNER_ENABLED, releaseExpiredMarketplaceReservations } from "@/lib/marketplace";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tienda Solidaria — Moda con Propósito",
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pageHref(page: number, q?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
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
  const q = getParam(params, "q");
  await releaseExpiredMarketplaceReservations();
  const result = await getPublicMarketplaceProductsPage({ page, limit: 12, q });
  const hasPrevious = result.page > 1;
  const hasNext = result.page < result.pageCount;

  return (
    <div>
      <section className="full-bleed bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)] lg:items-stretch">
            {MARKETPLACE_EVENT_BANNER_ENABLED ? <div className="flex items-center overflow-hidden rounded-2xl bg-[#FFF8FA]"><img src="/marketplace/invitacion-feria-de-la-tela.png" alt="Invitación a la Feria de la Tela, el 11 de octubre" className="h-auto w-full object-contain" /></div> : null}
            <MarketplaceContributionCard />
          </div>
        </div>
      </section>

      <section id="catalogo" className="full-bleed scroll-mt-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <form action="/marketplace" method="get" className="rounded-2xl border border-stone-200 bg-white p-4">
              <label htmlFor="marketplace-search" className="sr-only">
                Buscar productos
              </label>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  id="marketplace-search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Buscar productos por nombre o descripción"
                  className="min-h-11 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-[#F6026B]/40 focus:outline-none focus:ring-4 focus:ring-[#F6026B]/10"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F6026B] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#C00253]"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
              </div>
            </form>

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
                title={q ? "No encontramos productos para tu búsqueda." : "No hay productos disponibles."}
                description={q ? "Prueba con otra palabra o revisa el catálogo completo." : "Vuelve más adelante."}
                action={
                  q ? (
                    <Link href="/marketplace" className="font-bold text-[#F6026B] hover:underline">
                      Ver todo el catálogo
                    </Link>
                  ) : undefined
                }
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
                      href={pageHref(result.page - 1, q)}
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
                      href={pageHref(result.page + 1, q)}
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

      <section id="destino-aporte" className="full-bleed scroll-mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
              Una tienda que nace de una necesidad real
            </h2>
            <div className="space-y-4 text-base leading-7 text-stone-700">
              <p><strong className="text-ink">Compra con propósito.</strong> Con la compra de una cosmetiquera solidaria, podrás seleccionar productos Valmy y maquillaje disponibles gracias a las donaciones recibidas, según existencias.</p>
              <p>Los fondos recaudados se destinan íntegramente a la Fundación Juan Pablo 2 Santos.</p>
              <p>
                Tras conocer de cerca la labor de la <strong className="text-ink">Fundación Juan Pablo 2 Santos</strong> y
                las necesidades que enfrenta para continuar desarrollando sus proyectos sociales, decidimos crear la
                Tienda Solidaria de Moda con Propósito.
              </p>
              <p>
                Las consecuencias del terremoto han dejado a muchas personas y familias enfrentando procesos de
                recuperación complejos, entre ellas sobrevivientes que sufrieron amputaciones y requieren apoyo para
                reconstruir su día a día.
              </p>
              <p>
                Por eso, esta tienda tiene un propósito muy concreto:{" "}
                <strong className="text-ink">convertir cada compra en una forma de contribuir.</strong>
              </p>
            </div>
            <div className="rounded-2xl border border-[#F6026B]/20 bg-[#FFF8FA] p-6 sm:p-8">
              <p className="text-lg font-black leading-7 text-[#C00253] sm:text-xl sm:leading-8">
                El 100% de los fondos recaudados a través del Marketplace se destina directamente a la Fundación Juan
                Pablo 2 Santos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
