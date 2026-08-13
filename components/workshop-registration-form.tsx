"use client";

import { useState } from "react";

import { uploadFiles } from "@/lib/upload";
import { submitWorkshopRegistration } from "@/lib/workshop-submissions";
import {
  Button,
  CheckboxPill,
  FieldGroup,
  InputShell,
  SectionCard,
  inputClassName,
} from "@/components/ui";

export function WorkshopRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [publicNameAllowed, setPublicNameAllowed] = useState(false);
  const [publicLocationAllowed, setPublicLocationAllowed] = useState(false);
  const [publicInstagramAllowed, setPublicInstagramAllowed] = useState(false);
  const [publicWhatsappAllowed, setPublicWhatsappAllowed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (photoFile) {
      try {
        const [path] = await uploadFiles([photoFile], "photos");
        formData.set("initialPhotoPath", path);
      } catch {
        setSubmitError("No pudimos subir la foto. Intenta nuevamente.");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await submitWorkshopRegistration(formData);

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
          Aliado registrado exitosamente
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">
          Recibirás un correo cuando sea aprobado.
        </p>
      </SectionCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup
        title="Datos del aliado"
        description="Información básica de la academia, taller, escuela u otro aliado."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Nombre del aliado *">
            <input
              className={inputClassName}
              name="name"
              required
            />
          </InputShell>
          <InputShell label="Categoría *">
            <select className={inputClassName} name="category" defaultValue="taller" required>
              <option value="academia">Academia</option>
              <option value="taller">Taller</option>
              <option value="escuela">Escuela</option>
              <option value="otro">Otro</option>
            </select>
          </InputShell>
        </div>
        <InputShell label="¿Qué hace o puede aportar el aliado? *">
          <textarea
            className={inputClassName}
            name="whatTheyDo"
            rows={4}
            required
          />
        </InputShell>
      </FieldGroup>

      <FieldGroup
        title="Datos de contacto"
        description="Información para que Moda con Propósito pueda contactar a la persona responsable."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Nombre del responsable *">
            <input
              className={inputClassName}
              name="responsibleName"
              required
            />
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
            <input
              className={inputClassName}
              name="phone"
              type="tel"
              required
            />
          </InputShell>
          <InputShell label="WhatsApp">
            <input
              className={inputClassName}
              name="whatsapp"
            />
          </InputShell>
          <InputShell label="Instagram">
            <input
              className={inputClassName}
              name="instagram"
            />
          </InputShell>
        </div>
      </FieldGroup>

      <FieldGroup
        title="Ubicación"
        description="Ubicación del aliado y referencia que puede mostrarse públicamente."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Estado *">
            <input
              className={inputClassName}
              name="state"
              required
            />
          </InputShell>
          <InputShell label="Ciudad *">
            <input
              className={inputClassName}
              name="city"
              required
            />
          </InputShell>
          <InputShell label="Municipio">
            <input
              className={inputClassName}
              name="municipality"
            />
          </InputShell>
        </div>
        <InputShell label="Zona o referencia pública *">
          <input
            className={inputClassName}
            name="publicLocation"
            required
          />
        </InputShell>
      </FieldGroup>

      <FieldGroup
        title="Autorizaciones de publicación"
        description="Selecciona qué información del aliado puede mostrarse públicamente."
      >
        <div className="flex flex-wrap gap-2">
          <CheckboxPill
            label="Mostrar nombre del aliado"
            checked={publicNameAllowed}
            onClick={() => {
              setPublicNameAllowed(!publicNameAllowed);
            }}
          />
          <input
            type="hidden"
            name="publicNameAllowed"
            value={publicNameAllowed ? "on" : "off"}
          />
          <CheckboxPill
            label="Mostrar ubicación"
            checked={publicLocationAllowed}
            onClick={() => setPublicLocationAllowed(!publicLocationAllowed)}
          />
          <input
            type="hidden"
            name="publicLocationAllowed"
            value={publicLocationAllowed ? "on" : "off"}
          />
          <CheckboxPill
            label="Mostrar Instagram"
            checked={publicInstagramAllowed}
            onClick={() => setPublicInstagramAllowed(!publicInstagramAllowed)}
          />
          <input
            type="hidden"
            name="publicInstagramAllowed"
            value={publicInstagramAllowed ? "on" : "off"}
          />
          <CheckboxPill
            label="Mostrar WhatsApp"
            checked={publicWhatsappAllowed}
            onClick={() => setPublicWhatsappAllowed(!publicWhatsappAllowed)}
          />
          <input
            type="hidden"
            name="publicWhatsappAllowed"
            value={publicWhatsappAllowed ? "on" : "off"}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Foto inicial (opcional)"
        description="Una foto representativa del aliado."
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className={inputClassName}
        />
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
        {isSubmitting ? "Enviando..." : "Registrar aliado"}
      </Button>
    </form>
  );
}
