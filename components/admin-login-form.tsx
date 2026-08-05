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

const LOGIN_BACKGROUND_IMAGE = "/background-image.jpg";

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
    <div className="flex min-h-dvh items-center justify-center bg-[#FFF5F8] px-4 py-8 sm:px-6 lg:p-10">
      <div className="w-full max-w-[1200px] overflow-hidden rounded-[24px] bg-white shadow-card lg:grid lg:grid-cols-2">
        {/* Photo/branding column */}
        <div
          className="relative hidden min-h-[680px] lg:block"
          style={{
            backgroundImage: `url(${LOGIN_BACKGROUND_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

          <div className="absolute left-12 top-10">
            <img
              src="/isotipomoda.png"
              alt="Moda con Propósito"
              className="h-11 w-auto"
            />
          </div>

          <div className="absolute inset-x-12 bottom-10">
            <h2 className="max-w-md text-[28px] font-black leading-[1.15] tracking-[-0.03em] text-white xl:text-[40px]">
              Confeccionamos <span className="italic">ayuda</span>. Conectamos{" "}
              <span className="italic">propósito</span>.
            </h2>
            <p className="mt-6 max-w-[360px] text-base leading-relaxed text-white">
              Cada aliado, voluntario y colaborador forma parte de una red que
              transforma la solidaridad en soluciones textiles para quienes más
              lo necesitan.
            </p>
          </div>
        </div>

        {/* Form column */}
        <div className="flex items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <img
                src="/isotipomoda.png"
                alt="Moda con Propósito"
                className="h-10 w-auto"
              />
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
                  Bienvenido
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  Ingresa para administrar la plataforma o gestionar tu aliado
                  dentro de la red de Moda con Propósito.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label
                    className="text-sm font-medium text-gray-700"
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
                    className="text-sm font-medium text-gray-700"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
      </div>
    </div>
  );
}
