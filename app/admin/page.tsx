import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Building2, FolderKanban, HandHeart, MessageCircle, UserRound, Users, type LucideIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
import { SectionCard } from "@/components/ui";
import { getAdminDashboardData, type AdminDashboardNotification } from "@/lib/admin-dashboard";
import { formatDateTime } from "@/lib/utils";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginForm />;
  }

  if (user.app_metadata?.role === "aliado") redirect("/admin/tareas");
  if (user.app_metadata?.role === "solicitante") redirect("/admin/solicitudes");
  if (user.app_metadata?.role === "admin") {
    const dashboard = await getAdminDashboardData();
    const stats = [
      { label: "Aliados activos", value: dashboard.stats.activeAllies, href: "/admin/aliados?tab=aliados&status=activo", icon: Building2 },
      { label: "Tareas activas", value: dashboard.stats.activeTasks, href: "/admin/tareas", icon: FolderKanban },
      { label: "Voluntarios activos", value: dashboard.stats.activeVolunteers, href: "/admin/voluntarios?tab=activos", icon: Users },
      { label: "Mensajes sin leer", value: dashboard.stats.unreadMessages, href: "/admin/mensajes", icon: MessageCircle },
    ];

    return (
      <div className="space-y-8">
        <AdminPageHeader
          eyebrow="Promoda"
          title="Inicio"
          description="Consulta el estado de la red y atiende las novedades más recientes."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="group">
                <SectionCard className="h-full bg-[#FCFCFC] p-5 ring-1 ring-gray-200/70 transition group-hover:ring-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-3xl font-bold text-ink">{stat.value}</p>
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
                </SectionCard>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <section>
            <div className="flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Actividad pendiente</p>
                <h2 className="mt-1 text-xl font-bold text-ink">Notificaciones</h2>
              </div>
              <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            {dashboard.notifications.length ? (
              <div className="divide-y divide-gray-200">
                {dashboard.notifications.map((notification) => <DashboardNotification key={notification.id} notification={notification} />)}
              </div>
            ) : (
              <p className="py-10 text-sm text-gray-500">No tienes notificaciones nuevas.</p>
            )}
          </section>

          <section className="space-y-5 border-t border-gray-200 pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Accesos rápidos</p>
              <h2 className="mt-1 text-xl font-bold text-ink">Gestionar módulos</h2>
            </div>
            <div className="grid gap-2">
              <QuickLink href="/admin/aliados" icon={Building2} label="Aliados y postulaciones" />
              <QuickLink href="/admin/voluntarios?tab=postulaciones" icon={UserRound} label="Postulaciones de voluntarios" />
              <QuickLink href="/admin/mensajes" icon={MessageCircle} label="Bandeja de mensajes" />
              <QuickLink href="/admin/ayudas" icon={HandHeart} label="Ayudas" />
            </div>
            <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
              <p><span className="font-semibold text-ink">{dashboard.stats.allyPostulations}</span> postulaciones de aliados pendientes</p>
              <p className="mt-2"><span className="font-semibold text-ink">{dashboard.stats.volunteerPostulations}</span> postulaciones de voluntarios nuevas</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-xl bg-[#FCFCFC] p-8 text-center ring-1 ring-gray-200/70">
        <h1 className="text-xl font-semibold text-ink">Acceso restringido</h1>
        <p className="mt-2 text-sm text-gray-600">Tu cuenta no tiene permisos para entrar al panel.</p>
      </div>
    </div>
  );
}

function DashboardNotification({ notification }: { notification: AdminDashboardNotification }) {
  const Icon = notification.type === "message" ? MessageCircle : notification.type === "ally" ? Building2 : UserRound;

  return (
    <Link href={notification.href} className="flex items-start gap-4 py-4 transition hover:bg-primary-soft/30 sm:px-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{notification.title}</span>
        <span className="mt-1 block truncate text-sm text-gray-600">{notification.description}</span>
        <span className="mt-1 block text-sm text-gray-400">{formatDateTime(notification.createdAt)}</span>
      </span>
    </Link>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-primary-soft hover:text-primary">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
