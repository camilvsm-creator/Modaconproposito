"use client";

import { useState } from "react";

import { activateWorkshopFromTokenAction } from "@/app/admin/activar-taller/actions";
import { Button, InputShell, SectionCard, inputClassName } from "@/components/ui";

export function WorkshopActivationForm({
  token,
  responsibleName,
  email,
  workshopName,
}: {
  token: string;
  responsibleName: string;
  email: string | null;
  workshopName: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const needsEmail = !email;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    if (needsEmail && (!emailValue || !emailValue.includes("@"))) {
      setError("Ingresa un correo electrónico válido.");
      setIsPending(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsPending(false);
      return;
    }

    const formData = new FormData();
    formData.set("token", token);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    if (needsEmail) formData.set("email", emailValue);

    const result = await activateWorkshopFromTokenAction(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <SectionCard className="space-y-4 p-8">
        <h2 className="text-2xl font-semibold text-ink">Cuenta activada</h2>
        <p className="text-sm leading-6 text-stone-600">
          Tu acceso fue activado correctamente. Ya puedes entrar al panel con tu correo y la contraseña que acabas de definir.
        </p>
        <Button type="button" onClick={() => (window.location.href = "/admin")}>Ir al acceso admin</Button>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary">Activa tu acceso</h2>
          <p className="text-sm text-stone-600">Completa tus datos para habilitar la cuenta de tu aliado.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Aliado">
            <input className={inputClassName} value={workshopName} readOnly />
          </InputShell>
          <InputShell label="Responsable">
            <input className={inputClassName} value={responsibleName} readOnly />
          </InputShell>
        </div>

        {needsEmail ? (
          <InputShell label="Correo electrónico *">
            <input
              type="email"
              className={inputClassName}
              placeholder="ejemplo@correo.com"
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
              required
            />
          </InputShell>
        ) : (
          <InputShell label="Correo">
            <input className={inputClassName} value={email ?? ""} readOnly />
          </InputShell>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <InputShell label="Nueva contraseña">
            <input type="password" className={inputClassName} value={password} onChange={(event) => setPassword(event.target.value)} />
          </InputShell>
          <InputShell label="Confirmar contraseña">
            <input type="password" className={inputClassName} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </InputShell>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Activando..." : "Activar cuenta"}
        </Button>
      </form>
    </SectionCard>
  );
}
