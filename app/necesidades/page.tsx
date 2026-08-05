import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { LinkButton, SectionCard } from "@/components/ui";
import { getPublicNeedsPage } from "@/lib/workshops";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Necesidades — Promoda",
};

const NEEDS_PER_PAGE = 20;

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = params["page"];
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function TallerNecesidadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const currentPage = getPageParam(params);
  const result = await getPublicNeedsPage({
    page: currentPage,
    limit: NEEDS_PER_PAGE,
  });
  const needs = result.items;
  const pageCount = result.pageCount;
  const hasPrevious = result.page > 1;
  const hasNext = result.page < pageCount;

  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F6026B]">
              RED DE ALIADOS VERIFICADOS
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Tareas y necesidades publicadas
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              Insumos, materiales y apoyo que Promoda publica para coordinar con aliados y colaboradores.
            </p>
          </div>

          {needs.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {needs.map((need) => (
                <SectionCard
                  key={need.id}
                  className="flex flex-col p-5"
                >
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-black text-ink">
                      {need.title}
                    </h3>
                    {need.workshop?.slug ? (
                      <Link
                        href={`/aliados/${need.workshop.slug}`}
                        className="inline-block text-sm font-bold text-[#F6026B] underline-offset-2 hover:underline"
                      >
                        {need.workshop.name ?? "Aliado"}
                      </Link>
                    ) : null}
                    {need.description ? (
                      <p className="text-sm leading-6 text-stone-600">
                        {need.description}
                      </p>
                    ) : null}
                    {need.requested_items ? (
                      <div className="rounded-2xl bg-stone-50 p-3">
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-stone-500">
                          Insumos solicitados
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-700">
                          {need.requested_items}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-stone-400">
                      {formatDate(need.published_at ?? need.created_at)}
                    </p>
                    <LinkButton
                      href={`/aliados?help=${need.id}`}
                      variant="primary"
                      className="text-sm"
                    >
                      Quiero ayudar
                    </LinkButton>
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aún no hay tareas o necesidades publicadas."
              description="Las tareas y necesidades se publicarán una vez aprobadas."
            />
          )}

          {needs.length && pageCount > 1 ? (
            <nav className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-sm font-bold text-stone-700 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Página {result.page} de {pageCount}
              </span>
              <div className="flex gap-2">
                {hasPrevious ? (
                  <Link
                    href={`/necesidades?page=${result.page - 1}`}
                    className="rounded-full bg-white px-4 py-3 ring-1 ring-stone-200 text-[#F6026B] hover:bg-[#FFE6F0]"
                  >
                    Anterior
                  </Link>
                ) : (
                  <span className="rounded-full bg-[#FFE6F0] px-4 py-3 ring-1 ring-[#F6026B]/10 text-stone-400 pointer-events-none">
                    Anterior
                  </span>
                )}
                {hasNext ? (
                  <Link
                    href={`/necesidades?page=${result.page + 1}`}
                    className="rounded-full bg-[#F6026B] px-4 py-3 text-white ring-1 ring-stone-200 hover:bg-[#C00253]"
                  >
                    Siguiente
                  </Link>
                ) : (
                    <span className="rounded-full bg-[#FFE6F0] px-4 py-3 ring-1 ring-[#F6026B]/10 text-stone-400 pointer-events-none">
                      Siguiente
                    </span>
                )}
              </div>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
