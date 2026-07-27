"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

import { createAssignedTaskAction } from "../actions";
import { LazyAllySelect } from "@/components/lazy-ally-select";
import { Button, compactInputClassName } from "@/components/ui";
import { URGENCY_LABELS, URGENCY_LEVELS } from "@/lib/constants";

export function CreateAssignedTaskModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const titleId = `create-task-modal-title-${useId().replace(/:/g, "")}`;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setError(null);
  }

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={handleClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-28px_rgba(31,26,23,0.65)] ring-1 ring-gray-200 sm:max-h-[min(760px,calc(100dvh-3rem))] sm:rounded-xl sm:p-6 sm:shadow-[0_24px_70px_-38px_rgba(31,26,23,0.7)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-ink sm:text-xl">Crear tarea</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Asigna una nueva tarea a un aliado con su alcance, urgencia y fecha objetivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="min-h-11 rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Cerrar
              </button>
            </div>

            <div className="admin-modal-content mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <LazyAllySelect />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-800">Titulo</span>
                <input className={compactInputClassName} name="title" required />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-gray-800">Descripcion</span>
                <textarea className={`${compactInputClassName} min-h-[96px]`} name="description" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-800">Resultado esperado</span>
                <input className={compactInputClassName} name="expectedOutput" placeholder="Ej. 10 franelas talla mixta" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-800">Fecha limite</span>
                <input className={compactInputClassName} name="dueDate" type="date" />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-gray-800">Urgencia</span>
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

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
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
        </div>
      ) : null}
    </>
  );
}
