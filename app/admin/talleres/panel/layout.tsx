import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId } from "@/lib/workshops";
import { WorkshopProvider } from "@/app/admin/talleres/panel/workshop-context";

export default async function TalleresPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;

  if (role !== "admin" && role !== "admin_talleres" && role !== "taller") {
    redirect("/admin");
  }

  let workshop = null;

  if (role === "taller") {
    workshop = await getWorkshopByUserId(user.id);
    if (!workshop) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-lg border border-stone-200 bg-paper p-8 text-center shadow-card">
            <h1 className="text-xl font-semibold text-ink">No tienes un taller asociado</h1>
            <p className="mt-2 text-sm text-stone-600">
              Tu usuario no está vinculado a ningún taller. Contacta al equipo de administración.
            </p>
          </div>
        </div>
      );
    }
  }

  return <WorkshopProvider workshop={workshop}>{children}</WorkshopProvider>;
}
