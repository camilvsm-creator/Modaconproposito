import Link from "next/link";

import { MarketplaceAccountForm } from "@/components/marketplace-account-form";
import { SectionCard } from "@/components/ui";

export default async function MarketplaceRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === "string" && params.redirectTo.startsWith("/") ? params.redirectTo : "/admin/marketplace";
  return (
    <div className="full-bleed min-h-[70vh] bg-stone-50 px-4 py-10 sm:px-6">
      <SectionCard className="mx-auto max-w-xl p-6 ring-1 ring-stone-200 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#F6026B]">Marketplace</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Crea tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Necesitarás una cuenta para comprar y consultar el estado de tus pedidos.</p>
        <div className="mt-6"><MarketplaceAccountForm redirectTo={redirectTo} /></div>
        <p className="mt-5 text-center text-sm text-stone-600">¿Ya tienes cuenta? <Link href={`/marketplace/ingresar?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-bold text-[#F6026B] hover:underline">Ingresar</Link></p>
      </SectionCard>
    </div>
  );
}
