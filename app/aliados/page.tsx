import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { Illustration } from "@/components/illustration";
import { WorkshopCard } from "@/components/workshop-card";
import { LinkButton } from "@/components/ui";
import { ALLY_CATEGORIES, ALLY_CATEGORY_LABELS } from "@/lib/constants";
import { getPublicAlliesPage } from "@/lib/workshops";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Aliados — Moda con Propósito",
};

const ALLIES_PER_PAGE = 12;

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  const q = getStringParam(searchParams, "q");
  const state = getStringParam(searchParams, "state");
  const city = getStringParam(searchParams, "city");
  const category = getStringParam(searchParams, "category");

  if (q) params.set("q", q);
  if (state) params.set("state", state);
  if (city) params.set("city", city);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/aliados?${query}` : "/aliados";
}

export default async function AlliesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  const currentPage = getPageParam(filters);
  const result = await getPublicAlliesPage({
    page: currentPage,
    limit: ALLIES_PER_PAGE,
    q: getStringParam(filters, "q"),
    state: getStringParam(filters, "state"),
    city: getStringParam(filters, "city"),
    category: getStringParam(filters, "category"),
  });
  const allies = result.items;
  const pageCount = result.pageCount;
  const total = result.total;
  const hasPrevious = result.page > 1;
  const hasNext = result.page < pageCount;

  return (
    <div>
      <section className="full-bleed border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
                Academias, talleres, escuelas y aliados textiles
              </h1>
              <Illustration
                src="/ilustraciones/boton-verde.png"
                className="mt-1 hidden h-11 w-auto shrink-0 object-contain sm:block"
              />
            </div>
            <p className="text-base leading-7 text-stone-700">
              Espacio para visibilizar aliados de Moda con Propósito que participan en tareas de confección,
              formación, clasificación, reparación y apoyo textil.
            </p>
            <p className="text-sm text-stone-400">
              Cada aliado es revisado por el equipo Moda con Propósito antes de publicarse.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <LinkButton href="/registro" className="rounded-full bg-[#F6026B] text-white hover:bg-[#C00253]">
                Registrar aliado
              </LinkButton>
              <Link href="/voluntarios" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#F6026B] ring-1 ring-stone-300 transition hover:bg-[#FFE6F0]">
                Postularme como voluntario
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="full-bleed bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <AutoSubmitFilterForm action="/aliados" method="get" className="grid gap-3 md:grid-cols-[1fr_220px]">
                <input name="q" defaultValue={getStringParam(filters, "q") ?? ""} placeholder="Buscar por nombre, ciudad o actividad" className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm" />
                <select name="category" defaultValue={getStringParam(filters, "category") ?? ""} className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-700">
                  <option value="">Todas las categorías</option>
                  {ALLY_CATEGORIES.map((value) => (
                    <option key={value} value={value}>{ALLY_CATEGORY_LABELS[value]}</option>
                  ))}
                </select>
              </AutoSubmitFilterForm>
            </div>
            <div id="allies-list" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {allies.length ? (
                allies.map((ally) => <WorkshopCard key={ally.id} workshop={ally} />)
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="Aún no hay aliados registrados."
                    description="Sé el primero en registrar una academia, taller, escuela u otro aliado."
                    action={<LinkButton href="/registro" className="rounded-full">Registrar aliado</LinkButton>}
                  />
                </div>
              )}
            </div>

            {allies.length && pageCount > 1 ? (
              <nav className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-sm font-bold text-stone-700 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Página {result.page} de {pageCount} ({total} aliados)
                </span>
                <div className="flex gap-2">
                  {hasPrevious ? (
                    <Link href={pageHref(filters, result.page - 1)} className="rounded-full bg-white px-4 py-3 text-[#F6026B] ring-1 ring-stone-200 hover:bg-[#FFE6F0]">
                      Anterior
                    </Link>
                  ) : (
                    <span className="pointer-events-none rounded-full bg-[#FFE6F0] px-4 py-3 text-stone-400 ring-1 ring-[#F6026B]/10">
                      Anterior
                    </span>
                  )}
                  {hasNext ? (
                    <Link href={pageHref(filters, result.page + 1)} className="rounded-full bg-[#F6026B] px-4 py-3 text-white ring-1 ring-stone-200 hover:bg-[#C00253]">
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
