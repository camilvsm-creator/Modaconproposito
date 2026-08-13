"use client";

import { useState } from "react";

import { inputClassName } from "@/components/ui";
import { submitInitiativeHelp } from "@/lib/cartuchera-submissions";
import type { InitiativeHelpType } from "@/lib/iniciativas";

export function IniciativaHelpForm({
  initiativeSlug,
  helpTypes,
}: {
  initiativeSlug: string;
  helpTypes: InitiativeHelpType[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = `form-${initiativeSlug}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const formData = new FormData(e.currentTarget);
    const result = await submitInitiativeHelp(formData, initiativeSlug);

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-[2rem] border border-stone-200 bg-[#F7F2EF] p-8 text-center">
        <h3 className="text-2xl font-black text-ink">Gracias por sumarte</h3>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">
          Cada aporte es un refugio de esperanza. Te vamos a contactar para
          coordinar tu ayuda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-[#F6026B]/20 bg-[#FFE6F0] p-6 sm:p-8">
        <h3 className="text-xl font-black tracking-[-0.01em] text-ink">
          Donación económica
        </h3>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-[#F6026B]">
              Pago Móvil
            </h4>
            <div className="space-y-1 text-sm text-stone-700">
              <p>
                <span className="font-semibold">Nombre:</span> Moda con Propósito
              </p>
              <p>
                <span className="font-semibold">CI:</span> V-31001338
              </p>
              <p>
                <span className="font-semibold">Teléfono:</span> 04127292068
              </p>
              <p>
                <span className="font-semibold">Banco:</span> Plaza
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-[#F6026B]">
              Binance
            </h4>
            <div className="space-y-1 text-sm text-stone-700">
              <p>
                <span className="font-semibold">ID:</span> 468562825
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm font-bold text-[#C00253]">
          CUALQUIER AYUDA ES BIENVENIDA
        </p>
      </div>

      <section id={formId} className="space-y-5">
        <h3 className="text-2xl font-black tracking-[-0.02em] text-ink">
          Quiero ayudar
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 sm:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Nombre *
              </label>
              <input className={inputClassName} name="donorName" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Correo electrónico *
              </label>
              <input
                className={inputClassName}
                name="donorEmail"
                type="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Teléfono (opcional)
              </label>
              <input className={inputClassName} name="donorPhone" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Tipo de ayuda *
              </label>
              <select className={inputClassName} name="helpType" required>
                <option value="">Selecciona</option>
                {helpTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Cantidad (opcional)
              </label>
              <input
                className={inputClassName}
                name="quantity"
                placeholder="ej. 5 jabones, 10$"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">
                Descripción *
              </label>
              <textarea
                className={inputClassName}
                name="description"
                rows={2}
                required
                placeholder="Cuéntanos qué quieres aportar..."
              />
            </div>
          </div>

          {submitError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F6026B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C00253] disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Quiero ayudar"}
          </button>
        </form>
      </section>
    </div>
  );
}
