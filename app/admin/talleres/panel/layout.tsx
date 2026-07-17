import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopById } from "@/lib/workshops";
import { WorkshopProvider } from "@/app/admin/talleres/panel/workshop-context";
import { getContextFromHeaders } from "@/lib/context";

export default async function TalleresPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  const hdrs = await headers();
  const context = getContextFromHeaders(hdrs);

  if (role !== "aliado" && context.type !== "aliado") {
    redirect("/admin/talleres");
  }

  let workshop = null;

  if (context.type === "aliado") {
    workshop = await getWorkshopById(context.workshopId);
  } else if (role === "aliado") {
    workshop = await getWorkshopByUserId(user.id);
  }

  if (!workshop) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-stone-200 bg-paper p-8 text-center shadow-card">
          <h1 className="text-xl font-semibold text-ink">No tienes un aliado asociado</h1>
          <p className="mt-2 text-sm text-stone-600">
            Tu usuario no está vinculado a ningún aliado. Contacta al equipo de administración.
          </p>
        </div>
      </div>
    );
  }

  if (workshop.status === "desactivado") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-card">
          <h1 className="text-xl font-semibold text-red-800">Aliado desactivado</h1>
          <p className="mt-2 text-sm text-red-600">
            Tu aliado ha sido desactivado. No puedes acceder al panel en este momento.
          </p>
          <p className="mt-2 text-sm text-red-600">
            Contacta al equipo de Promoda para más información.
          </p>
        </div>
      </div>
    );
  }

  return <WorkshopProvider workshop={workshop}>{children}</WorkshopProvider>;
}
