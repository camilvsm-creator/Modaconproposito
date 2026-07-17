import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { EmptyState } from "@/components/empty-state";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getAdminCartucheraDonationsPage } from "@/lib/workshops";

const DONATIONS_PER_PAGE = 50;

const HELP_TYPE_LABELS: Record<string, string> = {
  insumos: "Insumos / Materiales",
  economica: "Aporte económico",
  voluntario: "Voluntario en confección",
  higiene: "Higiene y cuidado personal",
  otro: "Otro",
};

function getPageParam(params: Record<string, string | string[] | undefined>) {
  const value = Number(String(params.page || "").trim());
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/talleres/cartuchera?${query}` : "/admin/talleres/cartuchera";
}

export default async function AdminCartucheraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();
  const params = await searchParams;
  const result = await getAdminCartucheraDonationsPage({
    page: getPageParam(params),
    limit: DONATIONS_PER_PAGE,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Cartuchera"
          title="Tu Cartera, Mi Refugio"
          meta={`${result.total} donaciones`}
          navigation={{
            baseHref: "/admin/talleres",
            baseLabel: "Aliados",
            currentLabel: "Cartuchera",
          }}
        />
      </div>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Donante</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {result.items.map((donation) => (
                  <tr key={donation.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 align-top font-semibold text-ink leading-tight">
                      {donation.donor_name}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                      <p>{donation.donor_email}</p>
                      {donation.donor_phone ? (
                        <p className="text-xs text-stone-500">{donation.donor_phone}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                        {HELP_TYPE_LABELS[donation.help_type] ?? donation.help_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                      {donation.quantity || <span className="text-stone-400">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top text-stone-700 leading-tight">
                      <p className="max-w-xs truncate">{donation.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-stone-500 leading-tight">
                      {formatDate(donation.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((donation) => (
              <div key={donation.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-3">
                <div className="space-y-1 text-sm text-stone-700">
                  <p className="font-semibold text-ink">{donation.donor_name}</p>
                  <p>{donation.donor_email}</p>
                  {donation.donor_phone ? <p className="text-xs text-stone-500">{donation.donor_phone}</p> : null}
                  <p>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                      {HELP_TYPE_LABELS[donation.help_type] ?? donation.help_type}
                    </span>
                    {donation.quantity ? <span className="ml-2 text-stone-500">Cant: {donation.quantity}</span> : null}
                  </p>
                  <p className="text-stone-600">{donation.description}</p>
                  <p className="text-xs text-stone-500">{formatDate(donation.created_at)}</p>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            limit={result.limit}
            hrefForPage={(page) => pageHref(params, page)}
          />
        </div>
      ) : (
        <EmptyState title="No hay donaciones registradas." />
      )}
    </div>
  );
}
