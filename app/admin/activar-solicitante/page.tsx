import { SectionCard } from "@/components/ui";
import { RequesterActivationForm } from "@/components/requester-activation-form";
import { findAidRequesterActivationToken } from "@/lib/requesters";

export default async function AdminActivarSolicitantePage({
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

  const activationToken = await findAidRequesterActivationToken(token);
  const requester = activationToken?.requester ?? null;
  const isExpired = activationToken ? new Date(activationToken.expires_at).getTime() < Date.now() : true;
  const isValid = Boolean(activationToken && requester && !requester.user_id && !activationToken.used_at && !isExpired);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {!isValid || !requester ? (
        <SectionCard className="space-y-3 p-8">
          <h1 className="text-2xl font-semibold text-ink">No pudimos activar tu cuenta</h1>
          <p className="text-sm leading-6 text-stone-600">
            Este enlace ya no está disponible. Si lo necesitas, pide al equipo que te envíe un enlace nuevo.
          </p>
        </SectionCard>
      ) : (
        <RequesterActivationForm
          token={token}
          requesterName={requester.name}
          contactName={requester.contact_name || requester.name}
          email={requester.email}
        />
      )}
    </div>
  );
}
