"use client";

import { useState } from "react";

import {
  HELP_AVAILABILITY_OPTIONS,
  HELP_TYPE_GROUPS,
} from "@/lib/constants";
import { submitWorkshopHelpOffer } from "@/lib/workshop-submissions";
import {
  Button,
  FieldGroup,
  InputShell,
  SectionCard,
  inputClassName,
} from "@/components/ui";

export function WorkshopHelpForm({
  workshopId,
  needId,
  workshopName,
}: {
  workshopId?: string;
  needId?: string;
  workshopName?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const formData = new FormData(e.currentTarget);

    const result = await submitWorkshopHelpOffer(formData);

    if (!result.success) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SectionCard className="p-8 text-center">
        <h2 className="text-2xl font-black text-ink">
          Gracias por ofrecer tu ayuda
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">
          Recibiremos tu información y te contactaremos.
        </p>
      </SectionCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {workshopName ? (
        <p className="text-lg font-bold text-ink">
          Ofrecer ayuda a {workshopName}
        </p>
      ) : null}

      <input type="hidden" name="workshopId" value={workshopId ?? ""} />
      <input type="hidden" name="needId" value={needId ?? ""} />

      <FieldGroup title="Tus datos">
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Nombre *">
            <input className={inputClassName} name="donorName" required />
          </InputShell>
          <InputShell label="Contacto *">
            <input className={inputClassName} name="donorContact" required />
          </InputShell>
          <InputShell label="Correo electrónico *">
            <input className={inputClassName} name="donorEmail" type="email" required />
          </InputShell>
          <InputShell label="Teléfono (opcional)">
            <input className={inputClassName} name="donorPhone" />
          </InputShell>
        </div>
      </FieldGroup>

      <FieldGroup title="Ayuda que ofreces">
        <InputShell label="Tipo de ayuda *">
          <select className={inputClassName} name="helpType" required>
            <option value="">Selecciona un tipo</option>
            {HELP_TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </InputShell>
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Cantidad (opcional)">
            <input className={inputClassName} name="quantity" placeholder="ej. 5 metros, 2 máquinas" />
          </InputShell>
          <InputShell label="Disponibilidad">
            <select className={inputClassName} name="availability">
              <option value="">Selecciona</option>
              {HELP_AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </InputShell>
        </div>
        <InputShell label="Descripción *">
          <textarea
            className={inputClassName}
            name="description"
            rows={4}
            required
            placeholder="Contanos en detalle qué podés aportar..."
          />
        </InputShell>
        <InputShell label="Ubicación *">
          <input className={inputClassName} name="location" required placeholder="Ciudad, zona o referencia" />
        </InputShell>
      </FieldGroup>

      {submitError ? (
        <SectionCard className="border-danger/20 bg-danger-soft p-4 text-sm text-danger">
          {submitError}
        </SectionCard>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="bg-[#F74897] hover:bg-[#D6003F]">
        {isSubmitting ? "Enviando..." : "Enviar oferta de ayuda"}
      </Button>
    </form>
  );
}
