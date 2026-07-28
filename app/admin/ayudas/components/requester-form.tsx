import { Button, compactInputClassName } from "@/components/ui";
import { AID_REQUESTER_TYPE_LABELS, AID_REQUESTER_TYPES } from "@/lib/constants";

import { createAidRequesterAction, updateAidRequesterAction } from "../../solicitantes/actions";

export function RequesterForm({
  requesterId,
  defaults,
}: {
  requesterId?: string;
  defaults?: {
    name: string;
    type: string;
    contactName: string;
    email: string;
    phone: string;
    location: string;
    notes: string;
  };
}) {
  return (
    <form action={requesterId ? updateAidRequesterAction : createAidRequesterAction} className="grid gap-3 md:grid-cols-2">
      {requesterId ? <input type="hidden" name="requesterId" value={requesterId} /> : null}
      <input className={compactInputClassName} name="name" defaultValue={defaults?.name} required placeholder="Nombre de la organización" />
      <select className={compactInputClassName} name="type" defaultValue={defaults?.type ?? "institucion"}>
        {AID_REQUESTER_TYPES.map((type) => <option key={type} value={type}>{AID_REQUESTER_TYPE_LABELS[type]}</option>)}
      </select>
      <input className={compactInputClassName} name="contactName" defaultValue={defaults?.contactName} required placeholder="Persona responsable" />
      <input className={compactInputClassName} name="email" type="email" defaultValue={defaults?.email} placeholder="Correo de contacto" />
      <input className={compactInputClassName} name="phone" defaultValue={defaults?.phone} placeholder="Teléfono" />
      <input className={compactInputClassName} name="location" defaultValue={defaults?.location} placeholder="Ubicación" />
      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" defaultValue={defaults?.notes} placeholder="Notas" />
      <div className="md:col-span-2">
        <Button type="submit">{requesterId ? "Guardar cambios" : "Guardar solicitante"}</Button>
      </div>
    </form>
  );
}
