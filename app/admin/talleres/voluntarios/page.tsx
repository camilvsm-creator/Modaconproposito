import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminVolunteersPageFromClient } from "@/lib/workshops";
import { formatPublicPhone } from "@/lib/utils";

const VOLUNTEERS_PER_PAGE = 20;

const ROLE_BADGES: Record<string, string> = {
  COSTURERA: "bg-pink-100 text-pink-700",
  COSTURERO: "bg-pink-100 text-pink-700",
  "PATRONISTA DIGITAL": "bg-purple-100 text-purple-700",
  "DISEÑADOR DE MODA": "bg-indigo-100 text-indigo-700",
  LOGISTICA: "bg-blue-100 text-blue-700",
  VOLUNTARIA: "bg-green-100 text-green-700",
};

function getStringParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(getStringParam(params, "page"));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  const q = getStringParam(params, "q");
  if (q) search.set("q", q);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/voluntarios?${query}` : "/admin/voluntarios";
}

export default async function AdminVoluntariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const q = getStringParam(params, "q");

  const supabase = await createSupabaseServerClient();
  const result = await getAdminVolunteersPageFromClient(supabase, {
    page: getPageParam(params),
    limit: VOLUNTEERS_PER_PAGE,
    q: q || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Voluntarios"
        description="Listado de voluntarios activos de la red de aliados."
        meta={`${result.total} voluntarios`}
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Voluntarios" }}
      />

      <form action="/admin/voluntarios" method="get" className="flex gap-3">
        <input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre" className="w-full max-w-md rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm" />
        <input type="hidden" name="page" value="1" />
        <button className="rounded-lg bg-[#F74897] px-5 py-2.5 text-sm font-semibold text-white" type="submit">Buscar</button>
      </form>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Instagram</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Telefono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {result.items.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 align-top leading-tight">
                      <p className="font-semibold text-ink">{v.name}</p>
                    </td>
                    <td className="px-4 py-3 align-top leading-tight">
                      {v.instagram ? (
                        <span className="text-[#F74897]">@{v.instagram}</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top leading-tight">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${ROLE_BADGES[v.role ?? ""] ?? "bg-stone-100 text-stone-600"}`}>
                        {v.role ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                      {v.phone ? (
                        <a href={`https://wa.me/58${v.phone}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {formatPublicPhone(v.phone)}
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((v) => (
              <div key={v.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-ink">{v.name}</p>
                  {v.instagram ? <p className="text-[#F74897]">@{v.instagram}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-sm font-semibold uppercase tracking-wide ${ROLE_BADGES[v.role ?? ""] ?? "bg-stone-100 text-stone-600"}`}>
                    {v.role ?? "—"}
                  </span>
                  {v.phone ? (
                    <a href={`https://wa.me/58${v.phone}`} target="_blank" rel="noopener noreferrer" className="text-sm text-stone-600 hover:underline">
                      {formatPublicPhone(v.phone)}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(p) => pageHref(params, p)}
          />
        </div>
      ) : (
        <EmptyState title="No hay voluntarios registrados." />
      )}
    </div>
  );
}
