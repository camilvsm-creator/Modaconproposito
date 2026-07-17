import {
  createPatternAction,
  updatePatternAction,
  updatePatternStatusAction,
} from "@/app/admin/talleres/patrones/actions";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPagination } from "@/components/admin-pagination";
import { UploadPatternForm } from "@/components/admin-upload-pattern-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui";
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
import Link from "next/link";

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
  const user = await requireWorkshopAdminUser();
  const isPromoda = user.app_metadata?.role === "admin";
  const activeBg = isPromoda ? "bg-[#F74897]" : "bg-primary";

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
          meta={`${result.total} patrones`}
          navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Patrones" }}
        />
        <div className="flex flex-wrap gap-3">
          {PATTERN_STATUS_OPTIONS.map((opt) => {
            const href = pageHref({ ...params, status: opt.value === "all" ? undefined : opt.value, page: undefined }, 1);
            const isActive = opt.value === "all" ? !status || status === "all" : status === opt.value;
            return (
              <Link
                key={opt.value}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? `${activeBg} text-white`
                    : "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <UploadPatternForm />

      {result.items.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-sm font-semibold text-stone-600">
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
              <tbody className="divide-y divide-stone-200">
                {result.items.map((pattern) => {
                  const statusFormId = `pattern-status-${pattern.id}`;
                  const editFormId = `pattern-edit-${pattern.id}`;
                  const downloadUrl = getPatternDownloadUrl(pattern.file_path);
                  const imageUrl = getPatternImageUrl(pattern.image_path);
                  return (
                    <tr key={pattern.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 align-top leading-tight">
                        <span className="font-semibold text-ink">{pattern.title}</span>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <form id={editFormId} action={handleUpdatePattern}>
                          <input type="hidden" name="id" value={pattern.id} />
                          <select
                            name="difficulty"
                            defaultValue={pattern.difficulty ?? ""}
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                          >
                            <option value="">Sin especificar</option>
                            {PATTERN_DIFFICULTIES.map((d) => (
                              <option key={d} value={d}>
                                {PATTERN_DIFFICULTY_LABELS[d]}
                              </option>
                            ))}
                          </select>
                        </form>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <span className="text-stone-700">{pattern.category || "—"}</span>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <form id={statusFormId} action={handleUpdateStatus}>
                          <input type="hidden" name="id" value={pattern.id} />
                          <select
                            name="status"
                            defaultValue={pattern.status}
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                          >
                            {PATTERN_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </form>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
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
                              className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500 hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top leading-tight text-stone-500">
                        {formatDate(pattern.created_at)}
                      </td>
                      <td className="px-4 py-3 align-top leading-tight">
                        <div className="flex flex-col gap-2">
                          <Button form={statusFormId} type="submit" variant="secondary" className="w-full text-sm">
                            Cambiar estado
                          </Button>
                          <Button form={editFormId} type="submit" variant="ghost" className="w-full text-sm">
                            Guardar cambios
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {result.items.map((pattern) => {
              const downloadUrl = getPatternDownloadUrl(pattern.file_path);
              const imageUrl = getPatternImageUrl(pattern.image_path);
              return (
                <div key={pattern.id} className="rounded-xl border border-stone-200/80 bg-white/75 p-5 space-y-4">
                  <div className="space-y-1 text-sm text-stone-700">
                    <p className="font-semibold text-ink">{pattern.title}</p>
                    <WorkshopStatusBadge value={pattern.status} />
                    {pattern.difficulty ? (
                      <p><span className="font-medium">Dificultad:</span> {PATTERN_DIFFICULTY_LABELS[pattern.difficulty] ?? pattern.difficulty}</p>
                    ) : null}
                    {pattern.category ? <p><span className="font-medium">Categoría:</span> {pattern.category}</p> : null}
                    <p className="text-stone-500">{formatDate(pattern.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-3">
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
                        className="inline-flex items-center gap-1 text-sm font-semibold text-stone-500 hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver imagen
                      </a>
                    ) : null}
                  </div>

                  <form action={handleUpdateStatus} className="space-y-3">
                    <input type="hidden" name="id" value={pattern.id} />
                    <select name="status" defaultValue={pattern.status} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                      {PATTERN_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary" className="flex-1 text-sm">Cambiar estado</Button>
                    </div>
                  </form>
                </div>
              );
            })}
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
