"use client";

import { useState } from "react";

import { SectionCard, inputClassName } from "@/components/ui";
import { submitCartucheraDonation } from "@/lib/cartuchera-submissions";

const HELP_TYPES = [
  { value: "insumos", label: "Insumos / Materiales" },
  { value: "economica", label: "Aporte económico" },
  { value: "voluntario", label: "Voluntario en confección" },
  { value: "higiene", label: "Higiene y cuidado personal" },
  { value: "otro", label: "Otro" },
] as const;

export default function AdoptaUnaCartucheraPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const formData = new FormData(e.currentTarget);
    const result = await submitCartucheraDonation(formData);

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="full-bleed border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionCard className="p-8 text-center">
            <h1 className="text-2xl font-black text-ink">
              Gracias por sumarte
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-stone-600">
              Cada bolso es un refugio de esperanza. Te vamos a contactar para
              coordinar tu aporte.
            </p>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              RED DE ALIADOS VERIFICADOS
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Tu Cartera, Mi Refugio
            </h1>
          </div>

          <section className="space-y-4">
            <p className="text-sm leading-6 text-stone-700">
              Inspirada en una iniciativa nacida en Chile, <strong>Tu
              Cartera, Mi Refugio</strong> busca brindar un gesto de cuidado y
              dignidad a mujeres afectadas por la emergencia. A través de un
              bolso preparado con cariño, entregamos un kit con ropa interior
              nueva, productos de higiene personal, artículos de cuidado personal
              y una carta escrita a mano con un mensaje de apoyo.
            </p>
            <div className="text-sm leading-6 text-stone-700">
              <p className="font-bold text-ink">¿Qué lleva la cartuchera?</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Ropa interior nueva</li>
                <li>Maquillaje y labiales nuevos</li>
                <li>Productos de higiene personal</li>
                <li>Una carta escrita a mano</li>
              </ul>
              <p className="mt-4 font-bold text-ink">¿Qué puedes donar?</p>
              <p className="mt-2 font-bold text-stone-600">Neceseres:</p>
              <ul className="list-disc pl-5">
                <li>Tela: Vinil espejo estampado</li>
                <li>Agujas número 14 punta de bola</li>
                <li>Cierre de chaqueta de 40cm color rosa</li>
              </ul>
              <p className="mt-3 font-bold text-stone-600">Pantis o boxers:</p>
              <ul className="list-disc pl-5">
                <li>Sesgo elástico tamaño mediano (blanco o rosa)</li>
                <li>Elástica ancha para boxer</li>
                <li>Telas: franela pijamera, microdurazno est, microdurazno heavy</li>
              </ul>
            </div>
            <p className="text-sm leading-6 text-stone-700">
              Creemos que, además de cubrir necesidades básicas, también es
              importante acompañar, cuidar y recordar que nadie está sola.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              ¿Cómo ayudar?
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="text-3xl">🧵</span>
                <h3 className="font-black text-[#F74897]">
                  Insumos / Materiales
                </h3>
                <p className="text-sm leading-6 text-stone-600">
                  Telas, hilos, elásticos, cierres, agujas y todo lo necesario
                  para la confección de los kits.
                </p>
              </SectionCard>
              <SectionCard className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="text-3xl">💰</span>
                <h3 className="font-black text-[#F74897]">
                  Aporte económico
                </h3>
                <p className="text-sm leading-6 text-stone-600">
                  Tu aporte se utiliza para comprar insumos y cubrir los costos
                  de producción de cada kit.
                </p>
              </SectionCard>
              <SectionCard className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="text-3xl">🤝</span>
                <h3 className="font-black text-[#F74897]">
                  Voluntariado
                </h3>
                <p className="text-sm leading-6 text-stone-600">
                  Sumate como voluntario para la confección de los kits, la
                  organización de insumos o la logística de entrega.
                </p>
              </SectionCard>
            </div>
          </section>

          <SectionCard className="space-y-4 bg-[#FFE4EC] p-6 sm:p-8">
            <h2 className="text-xl font-black tracking-[-0.01em] text-ink">
              Donación económica
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#F74897]">
                  Pago Móvil
                </h3>
                <div className="space-y-1 text-sm text-stone-700">
                  <p>
                    <span className="font-semibold">Nombre:</span> Promoda
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
                <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#F74897]">
                  Binance
                </h3>
                <div className="space-y-1 text-sm text-stone-700">
                  <p>
                    <span className="font-semibold">ID:</span> 468562825
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-bold text-[#D6003F]">
              CUALQUIER AYUDA ES BIENVENIDA
            </p>
          </SectionCard>

          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-ink">
              Quiero ayudar
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-stone-700">
                    Nombre *
                  </label>
                  <input
                    className={inputClassName}
                    name="donorName"
                    required
                  />
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
                    {HELP_TYPES.map((t) => (
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
                    placeholder="Contanos qué querés aportar..."
                  />
                </div>
              </div>

              {submitError ? (
                <SectionCard className="border-danger/20 bg-danger-soft p-4 text-sm text-danger">
                  {submitError}
                </SectionCard>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#F74897] px-6 py-3 text-sm font-bold text-white hover:bg-[#D6003F] disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Quiero ayudar"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
