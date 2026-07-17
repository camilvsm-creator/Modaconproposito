"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, type ReactNode, useCallback, useEffect, useState } from "react";
import { BarChart3, Building2, Check, ClipboardList, FileText, FolderKanban, GitFork, HandHeart, LayoutDashboard, LogOut, Menu, MessageCircle, Package, PackageCheck, Scissors, User, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { switchContextAction } from "@/app/admin/actions";
import type { AppContext, LinkedWorkshop } from "@/lib/types";

type AdminShellProps = {
  role: string;
  email?: string | null;
  avatarUrl?: string | null;
  context: AppContext;
  linkedWorkshops: LinkedWorkshop[];
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const sharedAdminItems: NavItem[] = [
  { href: "/admin/talleres", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/talleres/necesidades", label: "Necesidades", icon: HandHeart },
  { href: "/admin/talleres/solicitudes-ayuda", label: "Solicitudes", icon: HandHeart },
  { href: "/admin/talleres/producciones", label: "Producciones", icon: FolderKanban },
  { href: "/admin/talleres/voluntarios", label: "Voluntarios", icon: Users },
  { href: "/admin/talleres/materiales", label: "Materiales", icon: Package },
  { href: "/admin/talleres/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/talleres/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/admin/talleres/reportes", label: "Reporte", icon: BarChart3 },
  { href: "/admin/talleres/aliados", label: "Ayuda", icon: GitFork },
  { href: "/admin/talleres/patrones", label: "Patrones", icon: FileText },
  { href: "/admin/talleres/cartuchera", label: "Cartuchera", icon: ClipboardList },
  { href: "/admin/talleres/ofertas", label: "Ofertas", icon: MessageCircle },
];

const aliadoNavItems: NavItem[] = [
  { href: "/admin/talleres/panel/perfil", label: "Perfil", icon: User },
  { href: "/admin/talleres/panel/producciones", label: "Producciones", icon: Scissors },
  { href: "/admin/talleres/panel/materiales", label: "Materiales", icon: Package },
  { href: "/admin/talleres/panel/voluntarios", label: "Voluntarios", icon: Users },
  { href: "/admin/talleres/panel/necesidades", label: "Necesidades", icon: HandHeart },
  { href: "/admin/talleres/panel/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/talleres/panel/mensajes", label: "Mensajes", icon: MessageCircle },
];

const navByRole: Record<string, NavItem[]> = {
  admin: sharedAdminItems,
  admin_talleres: sharedAdminItems,
  aliado: aliadoNavItems,
  admin_inspector: sharedAdminItems,
  inspector: sharedAdminItems,
  volunteers_editor: sharedAdminItems,
};

function ContextSwitcher({
  context,
  linkedWorkshops,
  isPromoda,
  onSelect,
}: {
  context: AppContext;
  linkedWorkshops: LinkedWorkshop[];
  isPromoda: boolean;
  onSelect: (workshopId: string | null) => void;
}) {
  if (linkedWorkshops.length === 0) return null;

  const isPlatform = context.type === "platform";

  return (
    <div className={cn("border-b pb-4 shrink-0", isPromoda ? "border-[#F74897]/10" : "border-stone-300")}>
      <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] mb-2", isPromoda ? "text-[#D6003F]" : "text-stone-500")}>
        Espacio de trabajo
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "inline-flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition w-full text-left",
            isPlatform
              ? isPromoda
                ? "bg-[#FFE4EC] text-[#D6003F] ring-1 ring-[#F74897]/20"
                : "bg-[#faf9f7] text-ink ring-1 ring-stone-300"
              : "bg-transparent text-stone-600 hover:bg-stone-100",
          )}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Plataforma PROMODA</span>
          {isPlatform && <Check className="h-3.5 w-3.5 shrink-0" />}
        </button>
        {linkedWorkshops.map((w) => {
          const isActive = context.type === "aliado" && context.workshopId === w.id;
          return (
            <button
              key={w.id}
              onClick={() => onSelect(w.id)}
              className={cn(
                "inline-flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition w-full text-left",
                isActive
                  ? isPromoda
                    ? "bg-[#FFE4EC] text-[#D6003F] ring-1 ring-[#F74897]/20"
                    : "bg-[#faf9f7] text-ink ring-1 ring-stone-300"
                  : "bg-transparent text-stone-600 hover:bg-stone-100",
              )}
            >
              {w.avatar_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/workshop-photos/${w.avatar_path}`}
                  alt={w.name}
                  className="h-5 w-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFE4EC] text-[10px] font-bold text-[#F74897] shrink-0">
                  {w.name.charAt(0)}
                </span>
              )}
              <span className="flex-1 truncate">{w.name}</span>
              {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminShell({ role, email, avatarUrl, context, linkedWorkshops, children }: AdminShellProps) {
  const pathname = usePathname();
  const isPromoda = role === "admin_talleres" || role === "aliado" || role === "admin";
  const isAdmin = role === "admin" || role === "admin_talleres";

  const effectiveRole = context.type === "aliado" ? "aliado" : role;
  const items = context.type === "aliado" ? aliadoNavItems : (navByRole[role] ?? navByRole.admin);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const primaryItems = items.slice(0, 4);
  const secondaryItems = items.slice(4);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/talleres") return pathname === "/admin/talleres";
    return pathname.startsWith(href);
  }

  const handleContextSwitch = useCallback(async (workshopId: string | null) => {
    setSwitching(true);
    const result = await switchContextAction(workshopId);
    if (result.error) {
      setSwitching(false);
      return;
    }
    window.location.reload();
  }, []);

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

  const contextLabel = context.type === "aliado"
    ? linkedWorkshops.find((w) => w.id === context.workshopId)?.name ?? "Aliado"
    : "Plataforma PROMODA";

  return (
    <div className={cn("h-screen overflow-hidden text-ink", isPromoda ? "bg-[#FFE4EC]/30" : "bg-stone-50")}>
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:w-[250px] lg:flex-col lg:border-r text-stone-700 shrink-0",
          isPromoda ? "border-[#F74897]/10 bg-white" : "border-stone-300 bg-stone-50",
        )}>
          <div className="flex h-full flex-col px-4 py-5">
            {/* Sidebar header */}
            <div className={cn("border-b pb-4 shrink-0", isPromoda ? "border-[#F74897]/10" : "border-stone-300")}>
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
              <p className={cn("mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]", isPromoda ? "text-[#D6003F]" : "text-stone-500")}>
                {context.type === "aliado" ? "Aliado" : role}
              </p>
            </div>

            {/* Context switcher (admins only) */}
            {isAdmin && (
              <div className="mt-4">
                <ContextSwitcher
                  context={context}
                  linkedWorkshops={linkedWorkshops}
                  isPromoda={isPromoda}
                  onSelect={handleContextSwitch}
                />
              </div>
            )}

            {/* Nav items */}
            <nav className="mt-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
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
            <div className="mt-auto shrink-0 pt-4">
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
        <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
          <main className="flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 xl:px-12 lg:py-8 pb-[72px] lg:pb-8">
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

            {/* Context switcher in drawer (admins only) */}
            {isAdmin && (
              <div className="mt-4">
                <ContextSwitcher
                  context={context}
                  linkedWorkshops={linkedWorkshops}
                  isPromoda={isPromoda}
                  onSelect={(id) => { closeDrawer(); handleContextSwitch(id); }}
                />
              </div>
            )}

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
