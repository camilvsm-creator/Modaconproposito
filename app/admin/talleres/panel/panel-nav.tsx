"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/talleres/panel", label: "Dashboard" },
  { href: "/admin/talleres/panel/perfil", label: "Perfil" },
  { href: "/admin/talleres/panel/producciones", label: "Producciones" },
  { href: "/admin/talleres/panel/materiales", label: "Materiales" },
  { href: "/admin/talleres/panel/voluntarios", label: "Voluntarios" },
  { href: "/admin/talleres/panel/necesidades", label: "Necesidades" },
  { href: "/admin/talleres/panel/fotos", label: "Fotos" },
  { href: "/admin/talleres/panel/entregas", label: "Entregas" },
  { href: "/admin/talleres/panel/mensajes", label: "Mensajes" },
];

export function PanelNav({ isPromoda = false }: { isPromoda?: boolean }) {
  const pathname = usePathname();
  const activeBg = isPromoda ? "bg-[#F74897]" : "bg-primary";

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-lg border border-stone-200 bg-paper p-1 shadow-sm">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition",
              active
                ? `${activeBg} text-white`
                : "text-stone-600 hover:bg-stone-100 hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
