"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LazyAllySelect } from "@/components/lazy-ally-select";
import { Button, InputShell, LinkButton, compactInputClassName } from "@/components/ui";
import { URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

import { createAssignedTaskAction } from "../actions";

export function CreateAssignedTaskForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setError(null);
      try {
        const result = await createAssignedTaskAction(new FormData(form));
        router.replace(`/admin/tareas?created=1&taskId=${result.taskId}`);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "No se pudo crear la tarea.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <LazyAllySelect />

        <InputShell label="Título">
          <input className={compactInputClassName} name="title" required />
        </InputShell>

        <InputShell label="Resultado esperado" hint="Ejemplo: 10 franelas de talla mixta.">
          <input className={compactInputClassName} name="expectedOutput" />
        </InputShell>

        <InputShell label="Fecha límite">
          <input className={compactInputClassName} name="dueDate" type="date" />
        </InputShell>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputShell label="Descripción">
          <textarea className={`${compactInputClassName} min-h-28`} name="description" />
        </InputShell>

        <InputShell label="Urgencia">
          <select className={compactInputClassName} name="urgency" defaultValue="">
            <option value="">Sin especificar</option>
            {URGENCY_LEVELS.map((level) => <option key={level} value={level}>{URGENCY_LABELS[level]}</option>)}
          </select>
        </InputShell>
      </div>

      {error ? <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending}>{isPending ? "Creando tarea..." : "Crear tarea"}</Button>
        <LinkButton href="/admin/tareas" variant="secondary">Cancelar</LinkButton>
        <Link href="/admin/entregas" className="text-center text-sm font-semibold text-primary hover:underline sm:ml-auto">Ir a entregas</Link>
      </div>
    </form>
  );
}
