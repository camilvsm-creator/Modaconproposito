import { headers } from "next/headers";
import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopById } from "@/lib/workshops";
import { AdminPageHeader } from "@/components/admin-page-header";
import { WorkshopProfileForm } from "@/app/admin/talleres/panel/perfil/workshop-profile-form";
import { getContextFromHeaders } from "@/lib/context";

export default async function TalleresPanelPerfilPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  const hdrs = await headers();
  const context = getContextFromHeaders(hdrs);

  if (role !== "aliado" && context.type !== "aliado") {
    return (
      <div>
        <p className="text-stone-600">Acceso solo para aliados.</p>
      </div>
    );
  }

  let workshop = null;
  if (context.type === "aliado") {
    workshop = await getWorkshopById(context.workshopId);
  } else {
    workshop = await getWorkshopByUserId(user.id);
  }

  if (!workshop) {
    return (
      <div>
        <p className="text-stone-600">No se encontró el aliado asociado a tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Perfil del Aliado"
        description="Actualiza la información y foto de perfil de tu aliado."
        navigation={{ baseHref: "/admin/aliado", baseLabel: "Panel", currentLabel: "Perfil" }}
      />
      <WorkshopProfileForm workshop={workshop} />
    </div>
  );
}
