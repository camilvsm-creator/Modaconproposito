import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminRecordsSummary } from "@/components/admin-data-ui";
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
  return query ? `/admin/cartuchera?${query}` : "/admin/cartuchera";
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
        />
      </div>

      <AdminRecordsSummary total={result.total} />

      {result.items.length ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Donante</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td data-mobile="primary" data-mobile-label="Donante" className="px-4 py-3 align-top font-semibold text-ink leading-tight">
                      {donation.donor_name}
                    </td>
                    <td data-mobile-label="Contacto" className="px-4 py-3 align-top text-gray-700 leading-tight">
                      <p>{donation.donor_email}</p>
                      {donation.donor_phone ? (
                        <p className="text-sm text-gray-500">{donation.donor_phone}</p>
                      ) : null}
                    </td>
                    <td data-mobile-label="Tipo" className="px-4 py-3 align-top text-gray-700 leading-tight">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-600">
                        {HELP_TYPE_LABELS[donation.help_type] ?? donation.help_type}
                      </span>
                    </td>
                    <td data-mobile-label="Cantidad" className="px-4 py-3 align-top text-gray-700 leading-tight">
                      {donation.quantity || <span className="text-gray-400">—</span>}
                    </td>
                    <td data-mobile="hidden" data-mobile-label="Descripción" className="px-4 py-3 align-top text-gray-700 leading-tight">
                      <p className="max-w-xs truncate">{donation.description}</p>
                    </td>
                    <td data-mobile-label="Fecha" className="whitespace-nowrap px-4 py-3 align-top text-gray-500 leading-tight">
                      {formatDate(donation.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
