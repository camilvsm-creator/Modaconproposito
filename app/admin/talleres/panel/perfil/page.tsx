import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId } from "@/lib/workshops";
import { AdminPageHeader } from "@/components/admin-page-header";
import { WorkshopProfileForm } from "@/app/admin/talleres/panel/perfil/workshop-profile-form";

export default async function TalleresPanelPerfilPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  if (role !== "taller") {
    return (
      <div>
        <p className="text-stone-600">Acceso solo para talleres.</p>
      </div>
    );
  }

  const workshop = await getWorkshopByUserId(user.id);
  if (!workshop) {
    return (
      <div>
        <p className="text-stone-600">No se encontró el taller asociado a tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Panel"
        title="Perfil del Taller"
        description="Actualiza la información y foto de perfil de tu taller."
        navigation={{ baseHref: "/admin/talleres/panel", baseLabel: "Panel", currentLabel: "Perfil" }}
      />
      <WorkshopProfileForm workshop={workshop} />
    </div>
  );
}
