"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, type ReactNode, useCallback, useEffect, useState } from "react";
import { BarChart3, Building2, Check, ClipboardList, FileText, FolderKanban, GitFork, HandHeart, LayoutDashboard, LogOut, Menu, MessageCircle, Package, PackageCheck, Scissors, ShoppingBag, User, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { switchContextAction } from "@/app/admin/actions";
import { WORKSHOP_PHOTO_BUCKET } from "@/lib/constants";
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
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/aliados", label: "Aliados", icon: Building2 },
  { href: "/admin/tareas", label: "Tareas", icon: FolderKanban },
  { href: "/admin/ayudas", label: "Ayudas", icon: HandHeart },
  { href: "/admin/voluntarios", label: "Voluntarios", icon: Users },
  { href: "/admin/colaboradores", label: "Colaboradores", icon: GitFork },
  { href: "/admin/materia-prima", label: "Materia prima", icon: Package },
  { href: "/admin/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/admin/patrones", label: "Patrones", icon: FileText },
  { href: "/admin/cartuchera", label: "Cartuchera", icon: ClipboardList },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
];

const aliadoNavItems: NavItem[] = [
  { href: "/admin/perfil", label: "Perfil", icon: User },
  { href: "/admin/tareas", label: "Tareas asignadas", icon: FolderKanban },
  { href: "/admin/voluntarios", label: "Voluntarios asignados", icon: Users },
  { href: "/admin/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/materia-prima", label: "Materia prima", icon: Package },
  { href: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageCircle },
];

const requesterNavItems: NavItem[] = [
  { href: "/admin/solicitudes", label: "Solicitudes", icon: HandHeart },
  { href: "/admin/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageCircle },
];

const buyerNavItems: NavItem[] = [
  { href: "/admin/marketplace", label: "Mis pedidos", icon: PackageCheck },
];

const navByRole: Record<string, NavItem[]> = {
  admin: sharedAdminItems,
  aliado: aliadoNavItems,
  solicitante: requesterNavItems,
  comprador: buyerNavItems,
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
    <div className="pb-4 shrink-0">
      <p className={cn("text-sm font-semibold uppercase tracking-[0.16em] mb-2", isPromoda ? "text-[#C00253]" : "text-gray-500")}>
        Espacio de trabajo
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "inline-flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition w-full text-left",
            isPlatform
              ? isPromoda
              ? "bg-[#FFE6F0] text-[#C00253]"
              : "bg-transparent text-ink"
              : "bg-transparent text-gray-600 hover:bg-gray-100",
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
                  ? "bg-[#FFE6F0] text-[#C00253]"
                  : "bg-transparent text-ink"
                  : "bg-transparent text-gray-600 hover:bg-gray-100",
              )}
            >
              {w.avatar_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${WORKSHOP_PHOTO_BUCKET}/${w.avatar_path}`}
                  alt={w.name}
                  className="h-5 w-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFE6F0] text-[10px] font-bold text-[#F6026B] shrink-0">
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
  const isPromoda = true;
  const isAdmin = role === "admin";

  const effectiveRole = role;
  const items = navByRole[role] ?? navByRole.admin;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const primaryItems = isAdmin
    ? ["/admin", "/admin/aliados", "/admin/tareas", "/admin/materia-prima"]
        .map((href) => items.find((item) => item.href === href))
        .filter((item): item is NavItem => Boolean(item))
    : items.slice(0, 4);
  const secondaryItems = items.filter((item) => !primaryItems.some((primary) => primary.href === item.href));

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/aliados") return pathname === "/admin/aliados";
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
    <div className={cn("admin-shell h-[100dvh] overflow-hidden text-ink", isPromoda ? "bg-white" : "bg-gray-50")}>
      <div className="flex h-full">
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden h-full shrink-0 text-gray-700 lg:flex lg:w-[250px] lg:flex-col",
          "bg-[#FCFCFC]",
        )}>
          <div className="flex h-full flex-col px-4 py-5">
            {/* Sidebar header */}
            <div className="pb-4 shrink-0">
              {isPromoda ? (
                <Link href="/admin" className="flex items-center gap-2">
                  <img src="/promoda-logo.png" alt="Moda con Propósito" className="h-7 w-auto" />
                </Link>
              ) : (
                <>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Promoda</p>
                  <h1 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-ink">Operaciones</h1>
                </>
              )}
              <p className={cn("mt-3 truncate text-sm", isPromoda ? "text-gray-500" : "text-gray-600")}>{email || role}</p>
              <p className={cn("mt-1 text-sm font-semibold uppercase tracking-[0.16em]", isPromoda ? "text-[#C00253]" : "text-gray-500")}>
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
                          ? "bg-[#FFE6F0] text-[#C00253]"
                          : "bg-transparent text-ink"
                        : isPromoda
                          ? "bg-transparent text-gray-600 hover:bg-[#FFE6F0]/60 hover:text-[#C00253]"
                          : "bg-transparent text-gray-600 hover:bg-[#f6f4f1] hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? (isPromoda ? "text-[#F6026B]" : "text-primary") : "text-gray-500")} />
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
                    "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition",
                    isPromoda
                      ? "bg-[#FFE6F0] text-[#C00253] hover:bg-white"
                      : "bg-[#f7f6f4] text-gray-700 hover:bg-white",
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
        <div className="flex h-full min-w-0 flex-1 flex-col bg-white">
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[calc(72px+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:py-8 lg:pb-8 xl:px-12">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40 flex min-h-16 items-center bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg ring-1 ring-black/5 lg:hidden">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold leading-none transition-colors",
                  active ? (isPromoda ? "text-[#F6026B]" : "text-primary") : "text-gray-500",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? (isPromoda ? "text-[#F6026B]" : "text-primary") : "text-gray-500")} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
          {secondaryItems.length > 0 ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold leading-none text-gray-500 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="whitespace-nowrap">Más</span>
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
            "fixed top-0 left-0 z-50 h-full w-[280px] ring-1 ring-black/10 transition-transform duration-300 ease-out lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
            isPromoda ? "bg-white" : "bg-[#FCFCFC]",
          )}
        >
          <div className="flex h-full flex-col px-4 py-5">
            <div className="flex items-center justify-between pb-4">
              {isPromoda ? (
                <div className="flex items-center gap-2">
                  <img src="/promoda-logo.png" alt="Moda con Propósito" className="h-6 w-auto" />
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Admin</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">Operaciones</h2>
                </div>
              )}
              <button
                onClick={closeDrawer}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md",
                  isPromoda
                    ? "bg-[#FFE6F0] text-[#C00253]"
                    : "bg-[#f7f6f4] text-gray-600",
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
                          ? "bg-[#FFE6F0] text-[#C00253]"
                          : "bg-transparent text-ink"
                        : isPromoda
                          ? "bg-transparent text-gray-600 hover:bg-[#FFE6F0]/60 hover:text-[#C00253]"
                          : "bg-transparent text-gray-600 hover:bg-[#f6f4f1] hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? (isPromoda ? "text-[#F6026B]" : "text-primary") : "text-gray-500")} />
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
                    "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition",
                    isPromoda
                      ? "bg-[#FFE6F0] text-[#C00253] hover:bg-white"
                      : "bg-[#f7f6f4] text-gray-700 hover:bg-white",
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
