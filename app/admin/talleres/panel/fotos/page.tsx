import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId, getWorkshopPhotos } from "@/lib/workshops";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Container } from "@/components/ui";
import { PhotosManager } from "./photos-manager";
import { PhotosList } from "./photos-list";

export default async function TalleresPanelFotosPage() {
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

  const photos = await getWorkshopPhotos(workshop.id);

  return (
    <Container>
      <AdminPageHeader
        eyebrow="Taller"
        title="Fotos"
        description="Sube fotos del trabajo de tu taller y los productos que elaboran."
      />
      <div className="mt-6 space-y-8">
        <PhotosManager workshopId={workshop.id} />
        <PhotosList photos={photos} />
      </div>
    </Container>
  );
}
