"use client";

import { useState } from "react";

import { Button, inputClassName } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MarketplaceLoginForm({ redirectTo = "/admin/marketplace" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }
    window.location.assign(redirectTo);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Correo electrónico</span><input className={inputClassName} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-medium text-gray-800">Contraseña</span><input className={inputClassName} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
      {error ? <p className="rounded-md bg-danger-soft/50 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</Button>
    </form>
  );
}
