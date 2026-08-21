import type { Metadata } from "next";

import { Illustration } from "@/components/illustration";
import { VolunteerRegistrationForm } from "@/components/volunteer-registration-form";

export const metadata: Metadata = {
  title: "Postularme como voluntario — Moda con Propósito",
};

export default function VoluntariosPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
                Postularme como voluntario
              </h1>
              <Illustration
                src="/ilustraciones/flor-naranja.png"
                className="mt-1 hidden h-10 w-auto shrink-0 object-contain sm:block"
              />
            </div>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              Si tienes experiencia en confección, patronaje, diseño, corte,
              logística u otras áreas del sector textil, puedes sumarte como
              voluntario para apoyar la producción de productos destinados a
              las comunidades afectadas.
            </p>
          </div>
          <VolunteerRegistrationForm />
        </div>
      </div>
    </div>
  );
}
