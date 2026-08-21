import type { Metadata } from "next";
import type { SewingPattern } from "@/lib/types";
import {
  getPatternDownloadUrl,
  getPatternImageUrl,
  getPublicPatternsGrouped,
} from "@/lib/patterns";
import { EmptyState } from "@/components/empty-state";
import { Illustration } from "@/components/illustration";
import { SectionCard } from "@/components/ui";
import { Download, Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Patrones — Moda con Propósito",
};

export const revalidate = 300;

function pageHref(category?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/patrones?${query}` : "/patrones";
}

const VISIBLE_CATEGORIES = [
  "Todos",
  "Accesorios",
  "Ropa infantil",
  "Ropa para adultos",
] as const;

export default async function PatronesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  const activeCategory = typeof filters.category === "string" && filters.category.trim() ? filters.category.trim() : undefined;
  const grouped = await getPublicPatternsGrouped();

  return (
    <div>
      <section className="full-bleed border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-black leading-[1.05] tracking-[-0.03em] text-ink sm:text-4xl">
                Patrones estandarizados
              </h1>
              <Illustration
                src="/ilustraciones/boton-verde.png"
                className="mt-1 hidden h-10 w-auto shrink-0 object-contain sm:block"
              />
            </div>
            <p className="text-base leading-7 text-stone-700">
              Descarga patrones de costura estandarizados para confeccionar
              prendas y artículos útiles para personas afectadas por el
              terremoto. Todos los patrones son revisados y aprobados por
              nuestro equipo.
            </p>
          </div>
        </div>
      </section>

      <section className="full-bleed bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {VISIBLE_CATEGORIES.map((cat) => {
                const isActive =
                  cat === "Todos" ? !activeCategory : activeCategory === cat;
                const href =
                  cat === "Todos" ? pageHref() : pageHref(cat);
                return (
                  <a
                    key={cat}
                    href={href}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#F6026B] text-white"
                        : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {cat}
                  </a>
                );
              })}
            </div>

            {activeCategory ? (
              <CategoryView
                grouped={grouped}
                activeCategory={activeCategory}
              />
            ) : (
              <AllCategoriesView grouped={grouped} />
            )}

            <p className="text-center text-sm font-semibold text-stone-400">
              {grouped.total} patrón{grouped.total !== 1 ? "es" : ""} disponible
              {grouped.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryView({
  grouped,
  activeCategory,
}: {
  grouped: Awaited<ReturnType<typeof getPublicPatternsGrouped>>;
  activeCategory: string;
}) {
  const cat = grouped.categories.find((c) => c.name === activeCategory);

  if (!cat || !cat.subgroups.length) {
    return (
      <EmptyState
        title="No hay patrones en esta categoría."
        description="Prueba seleccionar otra categoría."
        illustration="/ilustraciones/boton-verde.png"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black tracking-[-0.01em] text-ink">
        {cat.name}
      </h2>
      {cat.subgroups.map((sub, i) => (
        <details
          key={sub.name}
          className="group rounded-2xl border border-stone-200 bg-white transition hover:border-stone-300"
          open={i === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <span className="text-lg font-black tracking-[-0.01em] text-ink">
              {sub.name}
              <span className="ml-2 text-sm font-semibold text-stone-400">
                ({sub.patterns.length})
              </span>
            </span>
            <Chevron className="h-5 w-5 shrink-0 text-stone-400 transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-stone-100 px-5 pb-5 pt-4">
            <PatternGrid patterns={sub.patterns} />
          </div>
        </details>
      ))}
    </div>
  );
}

function AllCategoriesView({
  grouped,
}: {
  grouped: Awaited<ReturnType<typeof getPublicPatternsGrouped>>;
}) {
  return (
    <div className="space-y-4">
      {grouped.categories.map((cat, i) => (
        <details
          key={cat.name}
          className="group rounded-2xl border border-stone-200 bg-white transition hover:border-stone-300"
          open={i === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <span className="text-lg font-black tracking-[-0.01em] text-ink">
              {cat.name}
              <span className="ml-2 text-sm font-semibold text-stone-400">
                ({cat.subgroups.reduce((s, g) => s + g.patterns.length, 0)})
              </span>
            </span>
            <Chevron className="h-5 w-5 shrink-0 text-stone-400 transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-stone-100 px-5 pb-5 pt-4">
            <div className="space-y-6">
              {cat.subgroups.map((sub) => (
                <div key={sub.name}>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.08em] text-stone-500">
                    {sub.name}
                  </h3>
                  <PatternGrid patterns={sub.patterns} />
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function PatternGrid({ patterns }: { patterns: SewingPattern[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {patterns.map((pattern) => {
        const downloadUrl = getPatternDownloadUrl(pattern.file_path);
        const imageUrl = getPatternImageUrl(pattern.image_path);
        return (
          <SectionCard
            key={pattern.id}
            className="flex flex-col overflow-hidden p-0"
          >
            {imageUrl ? (
              <div
                className="h-40 overflow-hidden bg-stone-100"
                style={{ aspectRatio: "4 / 3" }}
              >
                <img
                  src={imageUrl}
                  alt={pattern.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center bg-[#FFE6F0]">
                <Scissors className="h-10 w-10 text-[#F6026B]/40" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black leading-snug tracking-[-0.01em] text-ink">
                  {pattern.title}
                </h3>
              </div>
              {pattern.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
                  {pattern.description}
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                {pattern.category ? (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-sm font-semibold text-stone-600">
                    {pattern.category}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="text-sm font-semibold text-stone-400">
                  {pattern.file_size_bytes
                    ? `${(pattern.file_size_bytes / 1024).toFixed(0)} KB`
                    : ""}
                </span>
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F6026B] px-4 py-2 text-sm font-bold text-white hover:bg-[#C00253]"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </a>
              </div>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
