"use client";

import { useState } from "react";

import { createWorkshopNeedAction } from "@/app/admin/talleres/panel/actions";
import { Button, InputShell, SectionCard, inputClassName } from "@/components/ui";
import { URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

export function CreateNeedForm({ workshopId }: { workshopId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestedItems, setRequestedItems] = useState("");
  const [urgency, setUrgency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const result = await createWorkshopNeedAction(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTitle("");
    setDescription("");
    setRequestedItems("");
    setUrgency("");
  }

  return (
    <SectionCard className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-ink">Nueva necesidad</h2>
      <p className="mb-4 text-sm text-stone-500">
        Las necesidades nuevas quedan pendientes de revisión por un administrador.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="workshopId" value={workshopId} />

        <InputShell label="Título">
          <input className={inputClassName} name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </InputShell>

        <InputShell label="Descripción">
          <textarea className={inputClassName + " min-h-[80px]"} name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </InputShell>

        <InputShell label="Elementos solicitados">
          <textarea className={inputClassName + " min-h-[80px]"} name="requestedItems" value={requestedItems} onChange={(e) => setRequestedItems(e.target.value)} />
        </InputShell>

        <InputShell label="Urgencia">
          <select className={inputClassName} name="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="">Sin especificar</option>
            {URGENCY_LEVELS.map((level) => (
              <option key={level} value={level}>{URGENCY_LABELS[level]}</option>
            ))}
          </select>
        </InputShell>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">Necesidad creada correctamente.</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear necesidad"}
        </Button>
      </form>
    </SectionCard>
  );
}
