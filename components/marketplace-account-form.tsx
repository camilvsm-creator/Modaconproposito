"use client";

import { useState } from "react";

import { registerMarketplaceCustomerAction } from "@/app/admin/marketplace/actions";
import { Button, inputClassName } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MarketplaceAccountForm({ redirectTo = "/admin/marketplace" }: { redirectTo?: string }) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(undefined);
    const result = await registerMarketplaceCustomerAction(formData);
    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (loginError) {
      setLoading(false);
      setError("La cuenta fue creada. Ingresa desde el acceso de compradores.");
      return;
    }
    window.location.assign(redirectTo);
  }

  return (
    <form action={submit} className="grid gap-4">
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Nombre completo</span><input className={inputClassName} name="fullName" required autoComplete="name" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={inputClassName} name="email" type="email" required autoComplete="email" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">WhatsApp</span><input className={inputClassName} name="whatsapp" required autoComplete="tel" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Dirección de entrega</span><textarea className={`${inputClassName} min-h-[88px]`} name="address" required /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Contraseña</span><input className={inputClassName} name="password" type="password" required minLength={6} autoComplete="new-password" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Confirmar contraseña</span><input className={inputClassName} name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" /></label>
      {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "Creando cuenta..." : "Crear cuenta"}</Button>
    </form>
  );
}
