import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { WorkshopCard } from "@/components/workshop-card";
import { LinkButton, SectionCard } from "@/components/ui";
import { getPublicWorkshopsPage } from "@/lib/workshops";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ayuda — Promoda",
};

const WORKSHOPS_PER_PAGE = 12;

function getStringParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  const q = getStringParam(searchParams, "q");
  const state = getStringParam(searchParams, "state");
  const city = getStringParam(searchParams, "city");

  if (q) params.set("q", q);
  if (state) params.set("state", state);
  if (city) params.set("city", city);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/ver-talleres?${query}` : "/ver-talleres";
}

export default async function WorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  const currentPage = getPageParam(filters);
  const result = await getPublicWorkshopsPage({
    page: currentPage,
    limit: WORKSHOPS_PER_PAGE,
    q: getStringParam(filters, "q"),
    state: getStringParam(filters, "state"),
    city: getStringParam(filters, "city"),
  });
  const workshops = result.items;
  const pageCount = result.pageCount;
  const total = result.total;
  const hasPrevious = result.page > 1;
  const hasNext = result.page < pageCount;

  return (
    <div>
      <section className="full-bleed border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              RED DE AYUDA
            </p>
            <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
              RED DE AYUDA
            </h1>
            <p className="text-base leading-7 text-stone-700">
              Espacio para registrar talleres, publicar necesidades de
              insumos y visibilizar el trabajo de confección, reparación,
              clasificación y apoyo textil para personas afectadas por el
              terremoto.
            </p>
            <p className="text-sm text-stone-400">
              Las solicitudes son revisadas antes de publicarse. La
              publicación de un taller no implica manejo directo de fondos
              por parte de AfectadosTerremoto.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <LinkButton
                href="/registro"
                className="bg-[#F74897] text-white hover:bg-[#D6003F]"
              >
                Ofrecer mi taller como voluntario
              </LinkButton>
              <Link href="/voluntarios" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#F74897] ring-1 ring-stone-300 hover:bg-[#FFE4EC] transition">
                Postularme como voluntario
              </Link>
              <LinkButton href="/necesidades" variant="secondary">
                Ver necesidades
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="full-bleed bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div
              id="workshops-list"
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {workshops.length ? (
                workshops.map((workshop) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="Aún no hay talleres registrados."
                    description="Sé el primero en registrar tu taller voluntario."
                    action={
                      <LinkButton href="/registro">
                        Ofrecer mi taller como voluntario
                      </LinkButton>
                    }
                  />
                </div>
              )}
            </div>

            {workshops.length && pageCount > 1 ? (
              <nav className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-sm font-bold text-stone-700 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Página {result.page} de {pageCount} ({total} talleres)
                </span>
                <div className="flex gap-2">
                  {hasPrevious ? (
                    <Link
                      href={pageHref(filters, result.page - 1)}
                    className="rounded-full bg-white px-4 py-3 ring-1 ring-stone-200 text-[#F74897] hover:bg-[#FFE4EC]"
                  >
                    Anterior
                  </Link>
                ) : (
                  <span className="rounded-full bg-[#FFE4EC] px-4 py-3 ring-1 ring-[#F74897]/10 text-stone-400 pointer-events-none">
                    Anterior
                  </span>
                )}
                {hasNext ? (
                  <Link
                    href={pageHref(filters, result.page + 1)}
                    className="rounded-full bg-[#F74897] px-4 py-3 text-white ring-1 ring-stone-200 hover:bg-[#D6003F]"
                    >
                      Siguiente
                    </Link>
                  ) : (
                    <span className="rounded-full bg-[#FFE4EC] px-4 py-3 ring-1 ring-[#F74897]/10 text-stone-400 pointer-events-none">
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
