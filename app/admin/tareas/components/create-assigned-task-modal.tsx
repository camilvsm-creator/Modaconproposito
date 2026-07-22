"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createAssignedTaskAction } from "../actions";
import { Button, compactInputClassName } from "@/components/ui";
import { URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

type AllyOption = {
  id: string;
  name: string;
};

export function CreateAssignedTaskModal({ allies }: { allies: AllyOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    startTransition(async () => {
      setError(null);

      try {
        await createAssignedTaskAction(new FormData(form));
        form.reset();
        handleClose();
        router.refresh();
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "No se pudo crear la tarea.");
      }
    });
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Nueva tarea
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={handleClose}>
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Crear tarea</h2>
                <p className="mt-2 text-sm text-stone-600">
                  Asigna una nueva tarea a un aliado con su alcance, urgencia y fecha objetivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-800">Aliado</span>
                <select className={compactInputClassName} name="allyId" required defaultValue="">
                  <option value="" disabled>
                    Selecciona un aliado
                  </option>
                  {allies.map((ally) => (
                    <option key={ally.id} value={ally.id}>
                      {ally.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-800">Titulo</span>
                <input className={compactInputClassName} name="title" required />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-stone-800">Descripcion</span>
                <textarea className={`${compactInputClassName} min-h-[96px]`} name="description" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-800">Resultado esperado</span>
                <input className={compactInputClassName} name="expectedOutput" placeholder="Ej. 10 franelas talla mixta" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-800">Fecha limite</span>
                <input className={compactInputClassName} name="dueDate" type="date" />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-stone-800">Urgencia</span>
                <select className={compactInputClassName} name="urgency" defaultValue="">
                  <option value="">Sin especificar</option>
                  {URGENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {URGENCY_LABELS[level]}
                    </option>
                  ))}
                </select>
              </label>

              {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creando..." : "Crear tarea"}
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose} disabled={isPending}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
