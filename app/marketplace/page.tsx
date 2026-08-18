import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { compactInputClassName } from "@/components/ui";
import { MarketplaceProductCard } from "@/components/marketplace-product-card";
import { getPublicMarketplaceProductsPage } from "@/lib/marketplace";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Marketplace — Moda con Propósito",
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pageHref(q: string | undefined, page: number) {
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
  const q = getParam(params, "q");
  const pageValue = Number(getParam(params, "page"));
  const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
  const result = await getPublicMarketplaceProductsPage({ page, limit: 12, q });
  const hasPrevious = result.page > 1;
  const hasNext = result.page < result.pageCount;

  return (
    <div>
      <section className="full-bleed border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/marketplace/ingresar"
            className="text-sm font-bold text-[#F6026B] hover:underline"
          >
            Consultar mis pedidos
          </Link>
        </div>
      </section>

      <section className="full-bleed bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <form
                action="/marketplace"
                method="get"
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  className={`${compactInputClassName} sm:max-w-md`}
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Buscar productos"
                />
                <button
                  className="min-h-11 rounded-md bg-[#F6026B] px-5 text-sm font-bold text-white hover:bg-[#C00253]"
                  type="submit"
                >
                  Buscar
                </button>
              </form>
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
                      href={pageHref(q, result.page - 1)}
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
                      href={pageHref(q, result.page + 1)}
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
