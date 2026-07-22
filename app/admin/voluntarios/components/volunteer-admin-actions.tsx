"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { assignVolunteerToAllyAction, createVolunteerAction } from "@/app/admin/voluntarios/actions";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";

type VolunteerOption = {
  id: string;
  name: string;
  label?: string;
};

type AllyOption = {
  id: string;
  name: string;
};

export function VolunteerAdminActions({
  volunteers,
  allies,
}: {
  volunteers: VolunteerOption[];
  allies: AllyOption[];
}) {
  const router = useRouter();
  const [createState, setCreateState] = useState<{ error?: string; success?: string }>({});
  const [assignState, setAssignState] = useState<{ error?: string; success?: string }>({});
  const [isPending, startTransition] = useTransition();

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setCreateState({});
      const result = await createVolunteerAction(new FormData(form));
      if (result.error) {
        setCreateState({ error: result.error });
        return;
      }

      form.reset();
      setCreateState({ success: "Voluntario registrado correctamente." });
      router.refresh();
    });
  }

  function handleAssignSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setAssignState({});
      const result = await assignVolunteerToAllyAction(new FormData(form));
      if (result.error) {
        setAssignState({ error: result.error });
        return;
      }

      form.reset();
      setAssignState({ success: "Voluntario asignado correctamente." });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Modal triggerLabel="Dar de alta voluntario" title="Dar de alta voluntario" description="Registra un nuevo voluntario para que luego pueda asignarse a un aliado.">
        <form onSubmit={handleCreateSubmit} className="grid gap-4 md:grid-cols-2">
          <input className={compactInputClassName} name="name" required placeholder="Nombre" />
          <input className={compactInputClassName} name="email" type="email" placeholder="Correo" />
          <input className={compactInputClassName} name="phone" placeholder="Telefono" />
          <input className={compactInputClassName} name="instagram" placeholder="Instagram" />
          <input className={compactInputClassName} name="skills" placeholder="Habilidades o rol" />
          <input className={compactInputClassName} name="availability" placeholder="Disponibilidad" />
          <input className={compactInputClassName} name="state" placeholder="Estado" />
          <input className={compactInputClassName} name="city" placeholder="Ciudad" />
          <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="notes" placeholder="Notas" />
          {createState.error ? <p className="text-sm text-danger md:col-span-2">{createState.error}</p> : null}
          {createState.success ? <p className="text-sm text-success md:col-span-2">{createState.success}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending}>Guardar voluntario</Button>
          </div>
        </form>
      </Modal>

      <Modal triggerLabel="Asignar voluntario" title="Asignar voluntario" description="Vincula un voluntario disponible con un aliado.">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Voluntario</span>
            <select className={compactInputClassName} name="volunteerId" required defaultValue="">
              <option value="" disabled>Selecciona un voluntario</option>
              {volunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>{volunteer.label ?? volunteer.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Aliado</span>
            <select className={compactInputClassName} name="allyId" required defaultValue="">
              <option value="" disabled>Selecciona un aliado</option>
              {allies.map((ally) => (
                <option key={ally.id} value={ally.id}>{ally.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Rol o función</span>
            <input className={compactInputClassName} name="role" placeholder="Ej. Costurera, logística, patronista" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Notas</span>
            <textarea className={`${compactInputClassName} min-h-[96px]`} name="notes" placeholder="Notas de asignación" />
          </label>

          {assignState.error ? <p className="text-sm text-danger">{assignState.error}</p> : null}
          {assignState.success ? <p className="text-sm text-success">{assignState.success}</p> : null}

          <Button type="submit" disabled={isPending}>Asignar voluntario</Button>
        </form>
      </Modal>
    </div>
  );
}
