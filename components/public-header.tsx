"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Nuestra misión" },
  { href: "/aliados", label: "Aliados" },
  { href: "/necesidades", label: "Necesidades" },
  { href: "/patrones", label: "Patrones" },
  { href: "/iniciativas", label: "Iniciativas" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#F6026B]/10 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/promoda-logo.png" alt="Moda con Propósito" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-stone-600 hover:text-[#F6026B]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/registro"
            className="rounded-full bg-[#F6026B] px-4 py-2 text-sm font-bold text-white hover:bg-[#C00253]"
          >
            Registrar aliado
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open ? (
        <div className="border-t border-stone-100 bg-white px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:text-[#F6026B]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/registro"
              className="mt-2 rounded-full bg-[#F6026B] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#C00253]"
              onClick={() => setOpen(false)}
            >
              Registrar aliado
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
