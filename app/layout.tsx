import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Promoda",
  description: "Red de talleres voluntarios y patrones estandarizados.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="es" className={sourceSans.variable}>
      <body>
        <div className="flex min-h-screen flex-col">
          {isAdminRoute ? null : (
            <header className="border-b border-[#F74897]/10 bg-white">
              <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/promoda-logo.svg" alt="Promoda" className="h-8 w-auto" />
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-sm font-semibold text-stone-600 hover:text-[#F74897]">
                    Nuestra misión
                  </Link>
                  <Link href="/ver-talleres" className="text-sm font-semibold text-stone-600 hover:text-[#F74897]">
                    Ver talleres
                  </Link>
                  <Link href="/necesidades" className="text-sm font-semibold text-stone-600 hover:text-[#F74897]">
                    Necesidades
                  </Link>
                  <Link href="/patrones" className="text-sm font-semibold text-stone-600 hover:text-[#F74897]">
                    Patrones
                  </Link>
                  <Link href="/adopta-una-cartuchera" className="text-sm font-semibold text-stone-600 hover:text-[#F74897]">
                    Adopta una cartuchera
                  </Link>
                  <Link href="/registro" className="rounded-full bg-[#F74897] px-4 py-2 text-sm font-bold text-white hover:bg-[#D6003F]">
                    Ofrecer mi taller
                  </Link>
                </div>
              </nav>
            </header>
          )}
          <main className="flex w-full flex-1 flex-col">
            {children}
          </main>
          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <img src="/promoda-logo.svg" alt="Promoda" className="h-7 w-auto" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-700">Red de Talleres Verificados</p>
                <p className="text-sm text-stone-400">Patrones estandarizados y coordinación de talleres de confección y apoyo textil.</p>
              </div>
            </div>
          </footer>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
