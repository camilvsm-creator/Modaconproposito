import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId } from "@/lib/workshops";
import { Container } from "@/components/ui";
import { WorkshopProfileForm } from "@/app/admin/talleres/panel/perfil/workshop-profile-form";

export default async function TalleresPanelPerfilPage() {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;
  if (role !== "taller") {
    return (
      <Container>
        <p className="text-stone-600">Acceso solo para talleres.</p>
      </Container>
    );
  }

  const workshop = await getWorkshopByUserId(user.id);
  if (!workshop) {
    return (
      <Container>
        <p className="text-stone-600">No se encontró el taller asociado a tu cuenta.</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-ink">Perfil del Taller</h1>
          <p className="mt-1 text-sm text-stone-500">
            Actualiza la información y foto de perfil de tu taller.
          </p>
        </div>
        <WorkshopProfileForm workshop={workshop} />
      </div>
    </Container>
  );
}
