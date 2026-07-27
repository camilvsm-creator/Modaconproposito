"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateAssignedTaskAdminAction } from "../actions";
import { Button, compactInputClassName } from "@/components/ui";
import { ASSIGNED_TASK_STATUS_LABELS, URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

type TaskFormData = {
  id: string;
  title: string;
  status: string;
  description: string | null;
  requested_items: string | null;
  due_date: string | null;
  urgency: string | null;
  admin_notes: string | null;
};

export function UpdateAssignedTaskForm({ task }: { task: TaskFormData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setError(null);
      setSuccess(null);

      try {
        await updateAssignedTaskAdminAction(new FormData(form));
        setSuccess("Tarea actualizada correctamente.");
        router.refresh();
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "No se pudo actualizar la tarea.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 p-0 md:grid-cols-2">
      <input type="hidden" name="taskId" value={task.id} />
      <input className={compactInputClassName} name="title" defaultValue={task.title} required />
      <select className={compactInputClassName} name="status" defaultValue={task.status}>
        {Object.entries(ASSIGNED_TASK_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="description" defaultValue={task.description ?? ""} placeholder="Descripcion de la tarea" />
      <input className={compactInputClassName} name="expectedOutput" defaultValue={task.requested_items ?? ""} placeholder="Resultado esperado" />
      <input className={compactInputClassName} name="dueDate" type="date" defaultValue={task.due_date ?? ""} />
      <select className={compactInputClassName} name="urgency" defaultValue={task.urgency ?? ""}>
        <option value="">Urgencia</option>
        {URGENCY_LEVELS.map((level) => (
          <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
        ))}
      </select>
      <div className="hidden md:block" />
      <textarea className={`${compactInputClassName} min-h-[96px] md:col-span-2`} name="adminNotes" defaultValue={task.admin_notes ?? ""} placeholder="Notas internas de la tarea" />
      {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
      {success ? <p className="text-sm text-success md:col-span-2">{success}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" variant="secondary" disabled={isPending}>{isPending ? "Guardando..." : "Actualizar tarea"}</Button>
      </div>
    </form>
  );
}
