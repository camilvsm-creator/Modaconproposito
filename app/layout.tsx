import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSiteUrl } from "@/lib/site-url";
import { PublicHeader } from "@/components/public-header";

import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Promoda",
  description: "Red de aliados, voluntarios, colaboradores y patrones estandarizados.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
  },
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
          {isAdminRoute ? null : <PublicHeader />}
          <main className="flex w-full flex-1 flex-col">
            {children}
          </main>
          <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <img src="/promoda-logo.svg" alt="Promoda" className="h-7 w-auto" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-stone-700">Aliados Verificados</p>
                <p className="text-sm text-stone-400">Patrones estandarizados y coordinación de aliados de confección y apoyo textil.</p>
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
