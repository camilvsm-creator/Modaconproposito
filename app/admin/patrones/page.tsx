import {
  createPatternAction,
  updatePatternAction,
  updatePatternStatusAction,
} from "@/app/admin/patrones/actions";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminRecordsSummary, AdminToolbar } from "@/components/admin-data-ui";
import { AutoSubmitFilterForm } from "@/components/auto-submit-filter-form";
import { UploadPatternForm } from "@/components/admin-upload-pattern-form";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import { WorkshopStatusBadge } from "@/components/workshop-status-badge";
import {
  PATTERN_CATEGORIES,
  PATTERN_DIFFICULTIES,
  PATTERN_DIFFICULTY_LABELS,
  PATTERN_STATUSES,
} from "@/lib/constants";
import { getAdminPatternsPage, getPatternDownloadUrl, getPatternImageUrl } from "@/lib/patterns";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Download, Eye } from "lucide-react";

const PATTERNS_PER_PAGE = 20;

const PATTERN_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  ...PATTERN_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
] as const;

async function handleUpdateStatus(formData: FormData) {
  "use server";
  await updatePatternStatusAction(formData);
}

async function handleUpdatePattern(formData: FormData) {
  "use server";
  await updatePatternAction(formData);
}

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
  const status = getStringParam(params, "status");
  if (status) search.set("status", status);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/patrones?${query}` : "/admin/patrones";
}

export default async function AdminPatronesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const status = getStringParam(params, "status") || "all";
  const result = await getAdminPatternsPage({
    page: getPageParam(params),
    limit: PATTERNS_PER_PAGE,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Aliados"
          title="Patrones estandarizados"
          description="Administra los patrones de costura publicados para descarga."
        />
        <AdminToolbar
          filters={<AutoSubmitFilterForm action="/admin/patrones" method="get" className="w-full max-w-sm"><select name="status" defaultValue={status} className={`${compactInputClassName} min-w-0 flex-1`}>{PATTERN_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></AutoSubmitFilterForm>}
          actions={<Modal triggerLabel="Nuevo patrón" triggerVariant="primary" title="Subir nuevo patrón" description="Carga un patrón estandarizado con sus archivos y metadatos." size="lg"><UploadPatternForm /></Modal>}
        />
        <AdminRecordsSummary total={result.total} />
      </div>

      {result.items.length ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="admin-mobile-cards min-w-[960px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Dificultad</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Archivo</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.items.map((pattern) => {
                  const downloadUrl = getPatternDownloadUrl(pattern.file_path);
                  const imageUrl = getPatternImageUrl(pattern.image_path);
                  return (
                    <tr key={pattern.id} className="hover:bg-gray-50 transition-colors">
                      <td data-mobile="primary" data-mobile-label="Patrón" className="px-4 py-3 align-top leading-tight">
                        <span className="font-semibold text-ink">{pattern.title}</span>
                      </td>
                      <td data-mobile-label="Dificultad" className="px-4 py-3 align-top leading-tight">
                        {pattern.difficulty ? PATTERN_DIFFICULTY_LABELS[pattern.difficulty] ?? pattern.difficulty : "—"}
                      </td>
                      <td data-mobile="hidden" data-mobile-label="Categoría" className="px-4 py-3 align-top leading-tight">
                        <span className="text-gray-700">{pattern.category || "—"}</span>
                      </td>
                      <td data-mobile-label="Estado" className="px-4 py-3 align-top leading-tight">
                        <WorkshopStatusBadge value={pattern.status} />
                      </td>
                      <td data-mobile-label="Archivo" className="px-4 py-3 align-top leading-tight">
                        <div className="flex items-center gap-2">
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </a>
                          {imageUrl ? (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td data-mobile-label="Creado" className="px-4 py-3 align-top leading-tight text-gray-500">
                        {formatDate(pattern.created_at)}
                      </td>
                      <td data-mobile="actions" data-mobile-label="Acciones" className="px-4 py-3 align-top leading-tight">
                        <Modal triggerLabel="Gestionar" title={pattern.title} description="Edita dificultad y estado del patrón.">
                          <div className="space-y-6">
                            <form action={handleUpdatePattern} className="space-y-3">
                              <input type="hidden" name="id" value={pattern.id} />
                              <select name="difficulty" defaultValue={pattern.difficulty ?? ""} className={compactInputClassName}>
                                <option value="">Sin especificar</option>
                                {PATTERN_DIFFICULTIES.map((d) => (
                                  <option key={d} value={d}>{PATTERN_DIFFICULTY_LABELS[d]}</option>
                                ))}
                              </select>
                              <Button type="submit" variant="secondary" className="text-sm">Guardar dificultad</Button>
                            </form>
                            <form action={handleUpdateStatus} className="space-y-3">
                              <input type="hidden" name="id" value={pattern.id} />
                              <select name="status" defaultValue={pattern.status} className={compactInputClassName}>
                                {PATTERN_STATUSES.map((s) => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                              <Button type="submit" variant="ghost" className="text-sm">Guardar estado</Button>
                            </form>
                          </div>
                        </Modal>
                      </td>
                    </tr>
                  );
                })}
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
        <EmptyState title="No hay patrones registrados." />
      )}
    </div>
  );
}
