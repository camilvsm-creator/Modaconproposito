"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, type ReactNode, useCallback, useEffect, useState } from "react";
import { BarChart3, Camera, ClipboardList, Copy, FileText, FolderKanban, GitFork, Globe, HandHeart, LayoutDashboard, LogOut, Menu, MessageCircle, Package, PackageCheck, Scissors, Settings, User, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminShellProps = {
  role: string;
  email?: string | null;
  avatarUrl?: string | null;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const sharedAdminItems: NavItem[] = [
  { href: "/admin/talleres", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/talleres/talleres", label: "Talleres", icon: Scissors },
  { href: "/admin/talleres/patrones", label: "Patrones", icon: FileText },
  { href: "/admin/talleres/cartuchera", label: "Cartuchera", icon: HandHeart },
  { href: "/admin/talleres/ofertas", label: "Ofertas", icon: MessageCircle },
  { href: "/admin/talleres/panel", label: "Panel taller", icon: User },
];

const navByRole: Record<string, NavItem[]> = {
  admin: sharedAdminItems,
  admin_talleres: sharedAdminItems,
  taller: [
    { href: "/admin/talleres/panel", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/talleres/panel/perfil", label: "Perfil", icon: User },
    { href: "/admin/talleres/panel/producciones", label: "Producciones", icon: Scissors },
    { href: "/admin/talleres/panel/materiales", label: "Materiales", icon: Package },
    { href: "/admin/talleres/panel/voluntarios", label: "Voluntarios", icon: Users },
    { href: "/admin/talleres/panel/necesidades", label: "Necesidades", icon: HandHeart },
    { href: "/admin/talleres/panel/fotos", label: "Fotos", icon: Camera },
    { href: "/admin/talleres/panel/entregas", label: "Entregas", icon: PackageCheck },
    { href: "/admin/talleres/panel/mensajes", label: "Mensajes", icon: MessageCircle },
  ],
  admin_inspector: sharedAdminItems,
  inspector: sharedAdminItems,
  volunteers_editor: sharedAdminItems,
};

export function AdminShell({ role, email, avatarUrl, children }: AdminShellProps) {
  const pathname = usePathname();
  const isPromoda = role === "admin_talleres" || role === "taller" || role === "admin";
  const items = navByRole[role] ?? navByRole.admin;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (drawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={cn("min-h-screen text-ink", isPromoda ? "bg-[#FFE4EC]/30" : "bg-stone-50")}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:w-[250px] lg:flex-col lg:border-r text-stone-700",
          isPromoda ? "border-[#F74897]/10 bg-white" : "border-stone-300 bg-stone-50",
        )}>
          <div className="flex h-full flex-col px-4 py-5">
            {/* Sidebar header */}
            <div className={cn("border-b pb-4", isPromoda ? "border-[#F74897]/10" : "border-stone-300")}>
              {isPromoda ? (
                <Link href="/admin/talleres" className="flex items-center gap-2">
                  <img src="/promoda-logo.svg" alt="Promoda" className="h-7 w-auto" />
                </Link>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Promoda</p>
                  <h1 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-ink">Operaciones</h1>
                </>
              )}
              <p className={cn("mt-3 truncate text-sm", isPromoda ? "text-stone-500" : "text-stone-600")}>{email || role}</p>
              <p className={cn("mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]", isPromoda ? "text-[#D6003F]" : "text-stone-500")}>{role}</p>
            </div>

            {/* Nav items */}
            <nav className="mt-6 flex flex-col gap-2">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition w-full",
                      active
                        ? isPromoda
                          ? "bg-[#FFE4EC] text-[#D6003F] shadow-sm ring-1 ring-[#F74897]/20"
                          : "bg-[#faf9f7] text-ink shadow-sm ring-1 ring-stone-300"
                        : isPromoda
                          ? "bg-transparent text-stone-600 hover:bg-[#FFE4EC]/60 hover:text-[#D6003F]"
                          : "bg-transparent text-stone-600 hover:bg-[#f6f4f1] hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? (isPromoda ? "text-[#F74897]" : "text-primary") : "text-stone-500")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Session footer */}
            <div className="mt-auto">
              <div className={cn(
                "mb-3 rounded-lg border px-3 py-3 text-xs",
                isPromoda
                  ? "border-[#F74897]/20 bg-[#FFE4EC] text-[#D6003F]"
                  : "border-stone-300 bg-[#f7f6f4] text-stone-600",
              )}>
                <p className={cn("font-semibold uppercase tracking-[0.16em]", isPromoda ? "text-[#D6003F]/70" : "text-stone-500")}>Sesión</p>
                <div className="mt-2 flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 ring-1 ring-black/10">
                      <span className="text-xs font-bold text-stone-500">{email?.charAt(0).toUpperCase() || "?"}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{email || role}</p>
                    <p className={cn("mt-0.5 uppercase tracking-[0.14em]", isPromoda ? "text-[#D6003F]/70" : "text-stone-500")}>{role}</p>
                  </div>
                </div>
              </div>
              <form action="/admin/logout" method="post">
                <button
                  type="submit"
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition",
                    isPromoda
                      ? "border-[#F74897]/20 bg-[#FFE4EC] text-[#D6003F] hover:bg-white"
                      : "border-stone-300 bg-[#f7f6f4] text-stone-700 hover:bg-white",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 bg-white pb-[72px] lg:pb-0">
          <main className="w-full px-4 py-5 sm:px-6 lg:px-10 xl:px-12 lg:py-8">
            {children}
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-stone-200 bg-white/95 backdrop-blur-lg lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors",
                  active ? (isPromoda ? "text-[#F74897]" : "text-primary") : "text-stone-500",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? (isPromoda ? "text-[#F74897]" : "text-primary") : "text-stone-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {secondaryItems.length > 0 ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-stone-500 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>Más</span>
            </button>
          ) : null}
        </nav>

        {/* Drawer backdrop */}
        {drawerOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
        ) : null}

        {/* Drawer panel */}
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-[280px] shadow-xl transition-transform duration-300 ease-out lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
            isPromoda ? "bg-white" : "bg-stone-50",
          )}
        >
          <div className="flex h-full flex-col px-4 py-5">
            <div className={cn("flex items-center justify-between border-b pb-4", isPromoda ? "border-[#F74897]/10" : "border-stone-300")}>
              {isPromoda ? (
                <div className="flex items-center gap-2">
                  <img src="/promoda-logo.svg" alt="Promoda" className="h-6 w-auto" />
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Admin</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">Operaciones</h2>
                </div>
              )}
              <button
                onClick={closeDrawer}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border",
                  isPromoda
                    ? "border-[#F74897]/20 bg-[#FFE4EC] text-[#D6003F]"
                    : "border-stone-300 bg-[#f7f6f4] text-stone-600",
                )}
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? isPromoda
                          ? "bg-[#FFE4EC] text-[#D6003F] shadow-sm ring-1 ring-[#F74897]/20"
                          : "bg-[#faf9f7] text-ink shadow-sm ring-1 ring-stone-300"
                        : isPromoda
                          ? "bg-transparent text-stone-600 hover:bg-[#FFE4EC]/60 hover:text-[#D6003F]"
                          : "bg-transparent text-stone-600 hover:bg-[#f6f4f1] hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? (isPromoda ? "text-[#F74897]" : "text-primary") : "text-stone-500")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <div className={cn(
                "mb-3 rounded-lg border px-3 py-3 text-xs",
                isPromoda
                  ? "border-[#F74897]/20 bg-[#FFE4EC] text-[#D6003F]"
                  : "border-stone-300 bg-[#f7f6f4] text-stone-600",
              )}>
                <p className={cn("font-semibold uppercase tracking-[0.16em]", isPromoda ? "text-[#D6003F]/70" : "text-stone-500")}>Sesión</p>
                <div className="mt-2 flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 ring-1 ring-black/10">
                      <span className="text-xs font-bold text-stone-500">{email?.charAt(0).toUpperCase() || "?"}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{email || role}</p>
                    <p className={cn("mt-0.5 uppercase tracking-[0.14em]", isPromoda ? "text-[#D6003F]/70" : "text-stone-500")}>{role}</p>
                  </div>
                </div>
              </div>
              <form action="/admin/logout" method="post">
                <button
                  type="submit"
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition",
                    isPromoda
                      ? "border-[#F74897]/20 bg-[#FFE4EC] text-[#D6003F] hover:bg-white"
                      : "border-stone-300 bg-[#f7f6f4] text-stone-700 hover:bg-white",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
