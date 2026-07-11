import type { Metadata } from "next";

import { WorkshopRegistrationForm } from "@/components/workshop-registration-form";
import { SectionCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Registrar mi taller — Promoda",
};

export default function TallerRegistroPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              RED DE ALIADOS VERIFICADOS
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Registrar mi taller
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              Registra tu taller de confección, reparación o clasificación
              textil para coordinar ayuda con personas afectadas.
            </p>
          </div>
          <WorkshopRegistrationForm />
        </div>
      </div>
    </div>
  );
}
