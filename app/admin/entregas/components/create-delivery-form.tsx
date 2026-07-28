"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LazyDeliveryTaskSelect } from "@/components/lazy-delivery-task-select";
import { Button, InputShell, LinkButton, compactInputClassName } from "@/components/ui";

import { createDeliveryAction } from "../actions";

export function CreateDeliveryForm({ allyId, defaultTaskId }: { allyId?: string; defaultTaskId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setError(null);
      try {
        const result = await createDeliveryAction(new FormData(form));
        router.replace(`/admin/entregas/${result.deliveryId}?created=1`);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "No se pudo crear la entrega.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <LazyDeliveryTaskSelect allyId={allyId} defaultValue={defaultTaskId} />

        <InputShell label="Título de la entrega">
          <input className={compactInputClassName} name="title" placeholder="Ej. Kit de prendas terminado" />
        </InputShell>

        <InputShell label="Fecha programada">
          <input className={compactInputClassName} name="scheduledFor" type="datetime-local" />
        </InputShell>

        <InputShell label="Cantidad o resumen">
          <input className={compactInputClassName} name="quantity" placeholder="Ej. 20 unidades" />
        </InputShell>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputShell label="Descripción" hint="Puedes explicar qué contiene la entrega o cómo debe ser recibida.">
          <textarea className={`${compactInputClassName} min-h-28`} name="description" />
        </InputShell>
        <InputShell label="Notas logísticas" hint="Agrega información de transporte, contacto o recepción.">
          <textarea className={`${compactInputClassName} min-h-28`} name="notes" />
        </InputShell>
      </div>

      {error ? <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p> : null}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isPending}>{isPending ? "Creando entrega..." : "Crear entrega"}</Button>
        <LinkButton href="/admin/entregas" variant="secondary">Cancelar</LinkButton>
        <Link href="/admin/tareas" className="text-center text-sm font-semibold text-primary hover:underline sm:ml-auto">Ir a tareas</Link>
      </div>
    </form>
  );
}
