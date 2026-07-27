"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCollaboratorAction, updateCollaboratorAction } from "@/app/admin/colaboradores/actions";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";
import type { Collaborator } from "@/lib/types";

const TYPES = [
  ["donador", "Donador"],
  ["centro_telas", "Centro de telas"],
  ["proveedor", "Proveedor"],
  ["empresa", "Empresa"],
  ["otro", "Otro"],
] as const;

export function CollaboratorCreateButton() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      setError(undefined);
      const result = await createCollaboratorAction(new FormData(form));
      if (result.error) {
        setError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  return (
    <Modal triggerLabel="Nuevo colaborador" triggerVariant="primary" title="Crear colaborador" description="Registra un donador, proveedor, empresa o aliado operativo.">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <input className={compactInputClassName} name="name" required placeholder="Nombre" />
        <select className={compactInputClassName} name="type" defaultValue="" required><option value="" disabled>Tipo</option>{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input className={compactInputClassName} name="contactName" placeholder="Persona de contacto" />
        <input className={compactInputClassName} name="email" type="email" placeholder="Correo" />
        <input className={compactInputClassName} name="phone" placeholder="Teléfono" />
        <input className={compactInputClassName} name="location" placeholder="Ubicación" />
        <textarea className={`${compactInputClassName} min-h-[88px] md:col-span-2`} name="notes" placeholder="Notas" />
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        <div className="md:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Crear colaborador"}</Button></div>
      </form>
    </Modal>
  );
}

export function CollaboratorEditButton({ collaborator }: { collaborator: Collaborator }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      setError(undefined);
      const result = await updateCollaboratorAction(new FormData(form));
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Modal triggerLabel="Editar" title={`Editar: ${collaborator.name}`} description="Actualiza los datos y el estado del colaborador.">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={collaborator.id} />
        <input className={compactInputClassName} name="name" defaultValue={collaborator.name} required placeholder="Nombre" />
        <select className={compactInputClassName} name="type" defaultValue={collaborator.type}>{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input className={compactInputClassName} name="contactName" defaultValue={collaborator.contact_name ?? ""} placeholder="Persona de contacto" />
        <input className={compactInputClassName} name="email" type="email" defaultValue={collaborator.email ?? ""} placeholder="Correo" />
        <input className={compactInputClassName} name="phone" defaultValue={collaborator.phone ?? ""} placeholder="Teléfono" />
        <input className={compactInputClassName} name="location" defaultValue={collaborator.location ?? ""} placeholder="Ubicación" />
        <select className={compactInputClassName} name="status" defaultValue={collaborator.status}><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="inactivo">Inactivo</option></select>
        <textarea className={`${compactInputClassName} min-h-[88px] md:col-span-2`} name="notes" defaultValue={collaborator.notes ?? ""} placeholder="Notas" />
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        <div className="md:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar cambios"}</Button></div>
      </form>
    </Modal>
  );
}
