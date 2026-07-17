"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Branding panel */}
      <div className="relative flex flex-col items-center justify-center bg-[#FFE4EC]/30 px-8 py-12 lg:w-[45%] lg:px-16 lg:py-0">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F74897]/[0.06]" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#F74897]/[0.08]" />
          <div className="absolute right-12 top-1/3 h-20 w-20 rounded-full bg-[#F74897]/[0.05]" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <img
            src="/promoda-logo.svg"
            alt="Promoda"
            className="mb-8 h-8 w-auto lg:h-10"
          />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F74897]">
            Red de Aliados Verificados
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-ink lg:text-3xl">
            Red de Talleres de Confección
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-500">
            Plataforma para coordinar talleres de confección, reparación y
            clasificación textil con aliados y voluntarios verificados.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 lg:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-ink">
              Panel de administración
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Ingresa para gestionar tu aliado y coordinar la ayuda textil.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="login-email"
              >
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
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="login-password"
              >
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
    </div>
  );
}
