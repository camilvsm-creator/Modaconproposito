"use client";

import { useState } from "react";

import { submitVolunteerRegistration } from "@/lib/volunteer-submissions";
import {
  Button,
  FieldGroup,
  InputShell,
  SectionCard,
  inputClassName,
} from "@/components/ui";

const EXPERIENCE_AREAS = [
  "Costura",
  "Patronaje",
  "Diseño",
  "Corte",
  "Logística",
  "Administración",
  "Otro",
];

const AVAILABILITY_OPTIONS = [
  "Tiempo completo",
  "Medio tiempo",
  "Fines de semana",
  "Horas libres",
];

const HOW_DID_YOU_FIND_OUT = [
  "Redes sociales",
  "Un amigo o familiar",
  "Medios de comunicación",
  "Otra organización",
  "Otro",
];

export function VolunteerRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await submitVolunteerRegistration(formData);

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
          Postulación enviada exitosamente
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">
          Gracias por sumarte. Nos pondremos en contacto contigo pronto.
        </p>
      </SectionCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup
        title="Datos de contacto"
        description="Información para que Moda con Propósito pueda contactarte."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Nombre completo *">
            <input className={inputClassName} name="fullName" required />
          </InputShell>
          <InputShell label="Correo electrónico *">
            <input
              className={inputClassName}
              name="email"
              type="email"
              required
            />
          </InputShell>
          <InputShell label="Teléfono *">
            <input className={inputClassName} name="phone" type="tel" required />
          </InputShell>
          <InputShell label="WhatsApp">
            <input className={inputClassName} name="whatsapp" type="tel" />
          </InputShell>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Ubicación"
        description="¿Dónde te encuentras?"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InputShell label="Estado *">
            <input className={inputClassName} name="state" required />
          </InputShell>
          <InputShell label="Ciudad *">
            <input className={inputClassName} name="city" required />
          </InputShell>
          <InputShell label="Municipio">
            <input className={inputClassName} name="municipality" />
          </InputShell>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Experiencia"
        description="Cuéntanos sobre tu experiencia y disponibilidad."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Área de experiencia *">
            <select className={inputClassName} name="experienceArea" required defaultValue="">
              <option value="" disabled>
                Selecciona...
              </option>
              {EXPERIENCE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </InputShell>
          <InputShell label="Disponibilidad *">
            <select className={inputClassName} name="availability" required defaultValue="">
              <option value="" disabled>
                Selecciona...
              </option>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </InputShell>
        </div>
        <InputShell label="¿Qué puedes aportar? *">
          <textarea
            className={inputClassName}
            name="experienceDescription"
            rows={4}
            required
            placeholder="Describe tu experiencia, habilidades y cómo puedes contribuir..."
          />
        </InputShell>
        <InputShell label="¿Cómo te enteraste de Moda con Propósito?">
          <select className={inputClassName} name="howDidYouFindOut" defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {HOW_DID_YOU_FIND_OUT.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </InputShell>
      </FieldGroup>

      <p className="text-sm text-stone-500">
        Al enviar, aceptas que la información será revisada antes de publicarse.
      </p>

      {submitError ? (
        <SectionCard className="border-danger/20 bg-danger-soft p-4 text-sm text-danger">
          {submitError}
        </SectionCard>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar postulación"}
      </Button>
    </form>
  );
}
