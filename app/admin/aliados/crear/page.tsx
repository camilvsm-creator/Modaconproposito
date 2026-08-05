import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
import { compactInputClassName } from "@/components/ui";
import { requireWorkshopAdminUser } from "@/lib/auth";
import { createWorkshopAction } from "@/app/admin/aliados/actions";

export default async function CrearTallerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireWorkshopAdminUser();

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const activationLink = typeof params.activationLink === "string" ? params.activationLink : null;
  const allyId = typeof params.allyId === "string" ? params.allyId : null;

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createWorkshopAction(formData);
    if (result.error) {
      const redirectParams = new URLSearchParams({ error: result.error });
      if (result.activationLink) redirectParams.set("activationLink", result.activationLink);
      if (result.allyId) redirectParams.set("allyId", result.allyId);
      redirect(`/admin/aliados/crear?${redirectParams.toString()}`);
    }
    redirect(result.allyId ? `/admin/aliados/${result.allyId}?created=1` : "/admin/aliados");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promoda"
        title="Crear aliado"
        description="Registra un nuevo aliado en la red. Se enviará un correo de activación al email proporcionado."
        navigation={{ baseHref: "/admin/aliados", baseLabel: "Aliados", currentLabel: "Crear aliado" }}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {activationLink ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">El aliado fue creado y el enlace de activación está disponible para copiar.</p>
          <input readOnly value={activationLink} className="mt-3 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-700" />
          {allyId ? <Link href={`/admin/aliados/${allyId}`} className="mt-3 inline-flex font-semibold text-[#F6026B] hover:underline">Ver detalle del aliado</Link> : null}
        </div>
      ) : null}

      <form action={handleCreate} className="space-y-8">
        {/* Datos del aliado */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-ink">Datos del aliado</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Nombre del aliado *</span>
              <input name="name" required className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Categoría *</span>
              <select name="category" defaultValue="taller" className={compactInputClassName}>
                <option value="academia">Academia</option>
                <option value="taller">Taller</option>
                <option value="escuela">Escuela</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Qué hace o aporta *</span>
              <input name="whatTheyDo" required placeholder="Ej: Confección de ropa interior y sábanas" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Descripción</span>
              <textarea name="description" rows={3} placeholder="Descripción opcional del aliado" className={compactInputClassName} />
            </label>
          </div>
        </section>

        {/* Contacto */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-ink">Contacto</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Responsable *</span>
              <input name="responsibleName" required className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Correo electrónico *</span>
              <input name="email" type="email" required placeholder="Se enviará la activación a este correo" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Teléfono</span>
              <input name="phone" type="tel" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">WhatsApp</span>
              <input name="whatsapp" type="tel" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Instagram</span>
              <input name="instagram" className={compactInputClassName} />
            </label>
          </div>
        </section>

        {/* Ubicación */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-ink">Ubicación</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Estado *</span>
              <input name="state" required placeholder="Ej: Distrito Capital" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Ciudad *</span>
              <input name="city" required placeholder="Ej: Caracas" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Municipio</span>
              <input name="municipality" className={compactInputClassName} />
            </label>
            <label className="block space-y-1.5">
              <span className="block text-sm font-medium text-gray-900">Ubicación pública *</span>
              <input name="publicLocation" required placeholder="Dirección o referencia visible públicamente" className={compactInputClassName} />
            </label>
          </div>
        </section>

        {/* Permisos de visibilidad */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-ink">Visibilidad pública</h2>
          <p className="text-sm text-gray-600">Controla qué datos se muestran en la página pública del aliado.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" name="publicNameAllowed" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-gray-700">Mostrar nombre del aliado</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" name="publicLocationAllowed" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-gray-700">Mostrar ubicación</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" name="publicInstagramAllowed" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-gray-700">Mostrar Instagram</span>
            </label>
            <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" name="publicWhatsappAllowed" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-gray-700">Mostrar WhatsApp</span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Crear aliado y enviar activación
          </button>
          <Link
            href="/admin/aliados"
            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
