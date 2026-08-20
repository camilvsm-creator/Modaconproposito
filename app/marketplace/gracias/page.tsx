import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";

import { SectionCard } from "@/components/ui";
import { getMarketplacePaymentSettings } from "@/lib/marketplace";

function whatsappHref(phone: string, orderNumber: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const message = `Hola, acabo de realizar un pedido en el marketplace de Moda con Propósito. Mi número de pedido es ${orderNumber}. Envío por aquí la referencia o comprobante de pago.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default async function MarketplaceThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = typeof params.pedido === "string" && params.pedido.trim() ? params.pedido.trim() : "tu pedido";
  const settings = await getMarketplacePaymentSettings();
  const whatsappUrl = settings ? whatsappHref(settings.contact_whatsapp, orderNumber) : null;

  return (
    <div className="full-bleed bg-[#FFF8FA] px-4 py-12 sm:px-6">
      <SectionCard className="mx-auto max-w-2xl p-7 text-center ring-1 ring-stone-200 sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#C00253]">Solicitud recibida</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Gracias, recibimos tu pedido</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">Recibimos tus datos y el pedido <strong className="text-ink">{orderNumber}</strong>. El equipo de Moda con Propósito verificará el pago y te contactará para coordinar la entrega de lo que compraste.</p>

        <div className="mt-7 rounded-2xl bg-stone-50 p-5 text-left">
          <h2 className="text-base font-black text-ink">¿Tienes la referencia o el comprobante?</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Envíalo por WhatsApp para asociarlo rápidamente a tu pedido. No necesitas crear una cuenta y, si ya lo cargaste, no tienes que enviarlo nuevamente.</p>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-[#1DA851]">
              <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
            </a>
          ) : (
            <p className="mt-4 rounded-xl bg-white p-3 text-sm leading-6 text-stone-500">El equipo te contactará usando los datos que dejaste en el pedido.</p>
          )}
        </div>

        <Link href="/marketplace" className="mt-7 inline-flex text-sm font-bold text-[#F6026B] hover:underline">Volver al marketplace</Link>
      </SectionCard>
    </div>
  );
}
