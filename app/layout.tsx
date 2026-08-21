import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSiteUrl } from "@/lib/site-url";
import { Illustration } from "@/components/illustration";
import { PublicHeader } from "@/components/public-header";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Moda con Propósito",
  description: "Red de aliados, voluntarios, colaboradores y patrones estandarizados.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="es" className={poppins.variable}>
      <body className={poppins.className}>
        <div className="flex min-h-screen flex-col">
          {isAdminRoute ? null : <PublicHeader />}
          <main className="flex w-full flex-1 flex-col">
            {children}
          </main>
          {isAdminRoute ? null : (
            <footer className="relative overflow-hidden border-t border-stone-200 bg-white">
              <Illustration
                src="/ilustraciones/puntadas-botones.png"
                className="pointer-events-none absolute -left-14 bottom-1 hidden h-14 w-auto select-none object-contain opacity-90 lg:block"
              />
              <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                  <img src="/promoda-logo.png" alt="Moda con Propósito" className="h-7 w-auto" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-stone-700">Aliados Verificados</p>
                  <p className="text-sm text-stone-400">Patrones estandarizados y coordinación de aliados de confección y apoyo textil.</p>
                </div>
              </div>
            </footer>
          )}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
