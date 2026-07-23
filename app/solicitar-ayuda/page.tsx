import type { Metadata } from "next";

import { HelpRequestForm } from "@/components/help-request-form";

export const metadata: Metadata = {
  title: "Solicitar ayuda — Promoda",
};

export default function SolicitarAyudaPage() {
  return (
    <div className="full-bleed border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
              Aliados Verificados
            </p>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
              Solicitar ayuda
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">
              Si eres persona afectada, refugio, fundación u organización,
              completa el siguiente formulario para solicitar productos textiles
              confeccionados por nuestra red de aliados.
            </p>
          </div>
          <HelpRequestForm />
        </div>
      </div>
    </div>
  );
}
