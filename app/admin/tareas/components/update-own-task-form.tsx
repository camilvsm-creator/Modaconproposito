"use client";

import { useState } from "react";

import { updateOwnTaskAction } from "@/app/admin/ally-actions";
import { Button, InputShell, compactInputClassName } from "@/components/ui";
import { URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

export function UpdateOwnTaskForm({
  workshopId,
  task,
}: {
  workshopId: string;
  task: {
    id: string;
    title: string;
    description: string | null;
    requested_items: string | null;
    urgency: string | null;
    due_date: string | null;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const result = await updateOwnTaskAction(new FormData(event.currentTarget));
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <details className="rounded-md bg-white p-0">
      <summary className="cursor-pointer text-sm font-semibold text-gray-700">Editar datos de la tarea</summary>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="workshopId" value={workshopId} />
        <input type="hidden" name="taskId" value={task.id} />
        <InputShell label="Título"><input className={compactInputClassName} name="title" defaultValue={task.title} required /></InputShell>
        <InputShell label="Fecha esperada"><input className={compactInputClassName} name="dueDate" type="date" defaultValue={task.due_date ?? ""} /></InputShell>
        <div className="md:col-span-2"><InputShell label="Descripción"><textarea className={`${compactInputClassName} h-32 max-h-60 resize-y overflow-y-auto`} name="description" defaultValue={task.description ?? ""} /></InputShell></div>
        <InputShell label="Objetivo de producción"><textarea className={`${compactInputClassName} min-h-[80px]`} name="requestedItems" defaultValue={task.requested_items ?? ""} /></InputShell>
        <InputShell label="Urgencia">
          <select className={compactInputClassName} name="urgency" defaultValue={task.urgency ?? ""}>
            <option value="">Sin especificar</option>
            {URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}
          </select>
        </InputShell>
        <div className="flex items-end"><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar cambios"}</Button></div>
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        {success ? <p className="text-sm text-success md:col-span-2">Tarea actualizada.</p> : null}
      </form>
    </details>
  );
}
