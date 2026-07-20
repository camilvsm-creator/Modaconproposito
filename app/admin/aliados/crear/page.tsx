import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin-page-header";
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {activationLink ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">El aliado fue creado y el enlace de activación está disponible para copiar.</p>
          <input readOnly value={activationLink} className="mt-3 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-stone-700" />
          {allyId ? <Link href={`/admin/aliados/${allyId}`} className="mt-3 inline-flex font-semibold text-[#F74897] hover:underline">Ver detalle del aliado</Link> : null}
        </div>
      ) : null}

      <form action={handleCreate} className="space-y-8">
        {/* Datos del aliado */}
        <section className="rounded-lg border border-stone-200 bg-paper p-6 shadow-card space-y-5">
          <h2 className="text-lg font-semibold text-ink">Datos del aliado</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="block text-base font-medium text-stone-900">Nombre del aliado *</span>
              <input name="name" required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="block text-base font-medium text-stone-900">Categoría *</span>
              <select name="category" defaultValue="taller" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10">
                <option value="academia">Academia</option>
                <option value="taller">Taller</option>
                <option value="escuela">Escuela</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="block text-base font-medium text-stone-900">Qué hace o aporta *</span>
              <input name="whatTheyDo" required placeholder="Ej: Confección de ropa interior y sábanas" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="block text-base font-medium text-stone-900">Descripción</span>
              <textarea name="description" rows={3} placeholder="Descripción opcional del aliado" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
          </div>
        </section>

        {/* Contacto */}
        <section className="rounded-lg border border-stone-200 bg-paper p-6 shadow-card space-y-5">
          <h2 className="text-lg font-semibold text-ink">Contacto</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Responsable *</span>
              <input name="responsibleName" required className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Correo electrónico *</span>
              <input name="email" type="email" required placeholder="Se enviará la activación a este correo" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Teléfono</span>
              <input name="phone" type="tel" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">WhatsApp</span>
              <input name="whatsapp" type="tel" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Instagram</span>
              <input name="instagram" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
          </div>
        </section>

        {/* Ubicación */}
        <section className="rounded-lg border border-stone-200 bg-paper p-6 shadow-card space-y-5">
          <h2 className="text-lg font-semibold text-ink">Ubicación</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Estado *</span>
              <input name="state" required placeholder="Ej: Distrito Capital" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Ciudad *</span>
              <input name="city" required placeholder="Ej: Caracas" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Municipio</span>
              <input name="municipality" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="block space-y-2">
              <span className="block text-base font-medium text-stone-900">Ubicación pública *</span>
              <input name="publicLocation" required placeholder="Dirección o referencia visible públicamente" className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-ink placeholder:text-stone-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
          </div>
        </section>

        {/* Permisos de visibilidad */}
        <section className="rounded-lg border border-stone-200 bg-paper p-6 shadow-card space-y-5">
          <h2 className="text-lg font-semibold text-ink">Visibilidad pública</h2>
          <p className="text-sm text-stone-600">Controla qué datos se muestran en la página pública del aliado.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 cursor-pointer hover:bg-stone-50 transition">
              <input type="checkbox" name="publicNameAllowed" defaultChecked className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-stone-700">Mostrar nombre del aliado</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 cursor-pointer hover:bg-stone-50 transition">
              <input type="checkbox" name="publicLocationAllowed" className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-stone-700">Mostrar ubicación</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 cursor-pointer hover:bg-stone-50 transition">
              <input type="checkbox" name="publicInstagramAllowed" className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-stone-700">Mostrar Instagram</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 cursor-pointer hover:bg-stone-50 transition">
              <input type="checkbox" name="publicWhatsappAllowed" className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/20" />
              <span className="text-sm font-medium text-stone-700">Mostrar WhatsApp</span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D6003F] transition"
          >
            Crear aliado y enviar activación
          </button>
          <Link
            href="/admin/aliados"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
