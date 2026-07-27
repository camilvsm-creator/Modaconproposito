"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createMessageThreadAction, getMessageRecipientOptionsAction } from "@/app/admin/mensajes/actions";
import { Modal } from "@/components/modal";
import { Button, compactInputClassName } from "@/components/ui";

type RecipientOptions = {
  allies: Array<{ id: string; name: string }>;
  requesters: Array<{ id: string; name: string }>;
};

export function CreateMessageThreadModal() {
  const router = useRouter();
  const [options, setOptions] = useState<RecipientOptions>({ allies: [], requesters: [] });
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [recipientType, setRecipientType] = useState<"aliado" | "solicitante">("aliado");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function loadOptions() {
    if (optionsLoaded || loadingOptions) return;
    setLoadingOptions(true);
    getMessageRecipientOptionsAction()
      .then((loadedOptions) => {
        setOptions(loadedOptions);
        setOptionsLoaded(true);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los destinatarios.");
      })
      .finally(() => setLoadingOptions(false));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      setError(undefined);
      setSuccess(undefined);
      const result = await createMessageThreadAction(new FormData(form));
      if (result.error) {
        setError(result.error);
        return;
      }

      form.reset();
      setSuccess("Hilo creado correctamente.");
      router.refresh();
    });
  }

  return (
    <Modal
      triggerLabel="Nuevo hilo"
      triggerVariant="primary"
      title="Nuevo hilo de mensajes"
      description="Inicia una conversación con un aliado o solicitante con cuenta activa."
      onOpen={loadOptions}
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-800">Destinatario</span>
          <select
            className={compactInputClassName}
            name="recipientType"
            value={recipientType}
            onChange={(event) => setRecipientType(event.target.value as "aliado" | "solicitante")}
            required
          >
            <option value="aliado">Aliado</option>
            <option value="solicitante">Solicitante</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-gray-800">Persona u organización</span>
          <select key={recipientType} className={compactInputClassName} name="recipientId" defaultValue="" required disabled={loadingOptions || !optionsLoaded}>
            <option value="" disabled>
              {loadingOptions ? "Cargando destinatarios..." : "Selecciona un destinatario"}
            </option>
            {recipientType === "aliado" ? <optgroup label="Aliados">
              {options.allies.map((ally) => <option key={`ally-${ally.id}`} value={ally.id}>{ally.name}</option>)}
            </optgroup> : null}
            {recipientType === "solicitante" ? <optgroup label="Solicitantes">
              {options.requesters.map((requester) => <option key={`requester-${requester.id}`} value={requester.id}>{requester.name}</option>)}
            </optgroup> : null}
          </select>
        </label>

        <input className={`${compactInputClassName} md:col-span-2`} name="subject" required maxLength={160} placeholder="Asunto de la conversación" />

        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        {success ? <p className="text-sm text-success md:col-span-2">{success}</p> : null}

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending || loadingOptions || !optionsLoaded}>
            {pending ? "Creando..." : "Crear hilo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
