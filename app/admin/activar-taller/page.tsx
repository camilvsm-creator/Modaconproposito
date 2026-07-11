import { WorkshopActivationForm } from "@/components/workshop-activation-form";
import { SectionCard } from "@/components/ui";
import { findWorkshopActivationToken } from "@/lib/workshops";

export default async function AdminActivarTallerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <SectionCard className="p-8">
          <p className="text-sm text-stone-600">No encontramos un token de activación válido.</p>
        </SectionCard>
      </div>
    );
  }

  const activationToken = await findWorkshopActivationToken(token);
  const workshop = activationToken?.workshop ?? null;
  const isExpired = activationToken ? new Date(activationToken.expires_at).getTime() < Date.now() : true;
  const isApprovedPending = workshop?.status === "approved_pending_activation";
  const isActiveWithoutUser = workshop?.status === "activo" && !workshop?.user_id;
  const isValid = Boolean(activationToken && workshop && !activationToken.used_at && !isExpired && (isApprovedPending || isActiveWithoutUser));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {!isValid || !workshop ? (
        <SectionCard className="space-y-3 p-8">
          <h1 className="text-2xl font-semibold text-ink">No pudimos activar tu cuenta</h1>
          <p className="text-sm leading-6 text-stone-600">
            Este enlace ya no está disponible. Si lo necesitas, pide al equipo que te envíe un enlace nuevo.
          </p>
        </SectionCard>
      ) : (
        <WorkshopActivationForm
          token={token}
          responsibleName={workshop.responsible_name || workshop.name}
          email={workshop.email}
          workshopName={workshop.name}
        />
      )}
    </div>
  );
}
