"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, inputClassName } from "@/components/ui";

const SPANISH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos",
  "Email not confirmed": "Correo electrónico no confirmado",
  "User is not found": "Usuario no encontrado",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres",
};

function translateError(message: string) {
  return SPANISH_ERRORS[message] ?? message;
}

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirectTo") ?? "/admin"
    : "/admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        setError(translateError(signInError.message));
        return;
      }

      window.location.assign(redirectTo);
    } catch (err) {
      setLoading(false);
      setError(
        "No se pudo conectar con Supabase. Revisa que la configuración pública esté correcta.",
      );
      console.error("Admin login error:", err);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-50/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900">
          <Shield className="h-6 w-6 text-white" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-semibold text-ink">Panel de administración</h1>
            <p className="text-sm text-stone-500">Afectados Terremoto Venezuela</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              className={inputClassName}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700" htmlFor="login-password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`${inputClassName} pr-10`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-danger-soft bg-danger-soft/30 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
