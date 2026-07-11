import type { Metadata } from "next";

import { VolunteerRegistrationForm } from "@/components/volunteer-registration-form";

export const metadata: Metadata = {
  title: "Postularme como voluntario — Promoda",
};

export default function VoluntariosPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              RED DE AYUDA
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Postularme como voluntario
            </h1>
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
