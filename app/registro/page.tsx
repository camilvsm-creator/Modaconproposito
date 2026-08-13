import type { Metadata } from "next";

import { WorkshopRegistrationForm } from "@/components/workshop-registration-form";
export const metadata: Metadata = {
  title: "Registrar aliado — Moda con Propósito",
};

export default function TallerRegistroPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Registrar aliado
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              Registra una academia, taller, escuela u otro aliado textil para coordinar tareas con Moda con Propósito.
            </p>
          </div>
          <WorkshopRegistrationForm />
        </div>
      </div>
    </div>
  );
}
