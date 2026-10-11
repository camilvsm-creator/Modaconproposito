"use client";

import { useState } from "react";
import { Banknote, Copy, Heart, LoaderCircle, Phone, X } from "lucide-react";

import { submitMarketplaceContributionAction } from "@/app/admin/marketplace/actions";
import { Button, compactInputClassName } from "@/components/ui";

type PaymentMethod = "pago_movil" | "transferencia";

const paymentData = {
  pago_movil: [
    ["Banco", "Bancamiga", false],
    ["RIF", "J502500073", true],
    ["Teléfono", "04147775765", true],
  ],
  transferencia: [
    ["Banco", "Bancamiga", false],
    ["Cuenta", "0172 0110 7111 0877 0320", true],
    ["RIF", "J502500073", true],
    ["Beneficiario", "Fundación Caminando Hacia Nuestros Sueños by Juan Pablo Dos Santos", true],
  ],
} as const;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#F6026B]/20 px-2.5 text-sm font-semibold text-[#C00253] hover:bg-[#FFE6F0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F6026B]/15"
    >
      <Copy className="h-4 w-4" /> {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function ContributionModal({ method, onClose }: { method: PaymentMethod; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    const result = await submitMarketplaceContributionAction(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="contribution-title" className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[min(820px,calc(100dvh-3rem))] sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-100 p-5 sm:p-7">
          <div>
            <h2 id="contribution-title" className="text-xl font-black text-ink sm:text-2xl">Realiza tu aporte por {method === "pago_movil" ? "Pago Móvil" : "transferencia bancaria"}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Utiliza los siguientes datos para realizar tu aporte directamente a la fundación.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          {success ? (
            <div className="rounded-2xl bg-[#FFF1F6] p-7 text-center">
              <Heart className="mx-auto h-10 w-10 fill-[#F6026B] text-[#F6026B]" />
              <h3 className="mt-4 text-2xl font-black text-ink">¡Gracias por tu aporte!</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">Hemos recibido tu comprobante. Nuestro equipo verificará la información.</p>
              <Button type="button" className="mt-6" onClick={onClose}>Cerrar</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5">
              <input type="hidden" name="paymentMethod" value={method} />
              <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
              <div className="grid gap-3 rounded-2xl bg-[#FFF8FA] p-4">
                {paymentData[method].map(([label, value, copyable]) => <div key={label} className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm text-stone-500">{label}</p><p className="text-sm font-bold text-ink">{value}</p></div>{copyable ? <CopyButton value={value} /> : null}</div>)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-medium text-gray-800">Nombre y apellido</span><input className={compactInputClassName} name="donorName" required /></label>
                <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={compactInputClassName} name="donorEmail" type="email" required /></label>
                <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Monto aportado (Bs.)</span><input className={compactInputClassName} name="amountBs" type="number" min="0.01" step="0.01" required /></label>
                <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Número de referencia</span><input className={compactInputClassName} name="paymentReference" maxLength={120} required /></label>
                <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Fecha del pago</span><input className={compactInputClassName} name="paymentDate" type="date" required /></label>
                <label className="grid gap-1.5 sm:col-span-2"><span className="text-sm font-medium text-gray-800">Subir comprobante</span><input className={compactInputClassName} name="proof" type="file" accept="image/jpeg,image/png,application/pdf" required /><span className="text-sm text-stone-500">JPG, PNG o PDF. Máximo 8 MB.</span></label>
              </div>
              {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p> : null}
              <Button type="submit" disabled={loading}>{loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Enviando comprobante...</> : "Enviar comprobante"}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceContributionCard() {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  return (
    <aside className="rounded-[18px] bg-[#FFF1F6] p-6 shadow-[0_14px_40px_-28px_rgba(194,2,83,0.5)] sm:p-8">
      <div className="flex items-center gap-2 text-[#F6026B]"><Heart className="h-6 w-6 fill-current" /><h2 className="text-2xl font-black text-ink">Realiza tu aporte</h2></div>
      <p className="mt-3 text-base leading-7 text-stone-700">Apoya a la Fundación Juan Pablo 2 Santos.</p>
      <div className="mt-6 grid gap-3">
        <button type="button" onClick={() => setMethod("pago_movil")} className="flex min-h-20 w-full items-center gap-4 rounded-xl bg-[#F6026B] px-5 py-4 text-left text-white transition hover:bg-[#C00253] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F6026B]/25"><Phone className="h-6 w-6 shrink-0" /><span><strong className="block text-base">Pago Móvil</strong><span className="mt-1 block text-sm text-white/85">Ver datos y subir comprobante</span></span></button>
        <button type="button" onClick={() => setMethod("transferencia")} className="flex min-h-20 w-full items-center gap-4 rounded-xl border border-[#F6026B]/25 bg-white px-5 py-4 text-left text-ink transition hover:bg-[#FFF8FA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F6026B]/15"><Banknote className="h-6 w-6 shrink-0 text-[#F6026B]" /><span><strong className="block text-base">Transferencia bancaria</strong><span className="mt-1 block text-sm text-stone-600">Ver datos y subir comprobante</span></span></button>
      </div>
      {method ? <ContributionModal method={method} onClose={() => setMethod(null)} /> : null}
    </aside>
  );
}
