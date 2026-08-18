import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Caracas",
  }).format(new Date(date));
}

export function formatUsd(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function buildPublicName(
  name: string | null | undefined,
  mode: "anonymous" | "partial" | "full",
) {
  if (!name || mode === "anonymous") {
    return "Nombre reservado";
  }

  if (mode === "full") {
    return name;
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }

  return `${parts[0]} ${parts[1].slice(0, 1)}***`;
}

export function toNumber(value: string | number | undefined | null) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildWhatsAppHref(phone: string) {
  const digits = phone?.replace(/\D/g, "") ?? '0';
  return digits ? `https://wa.me/${digits}` : "#";
}

export function formatPublicPhone(phone: string | null | undefined) {
  if (!phone) return "Sin teléfono";

  const digits = phone?.replace(/\D/g, "")  ?? '0';

  if (digits.startsWith("58") && digits.length === 12) {
    return `+58 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  }

  return phone;
}

export function buildGoogleMapsHref(params: { lat?: number | null; lng?: number | null; query?: string | null }) {
  if (typeof params.lat === "number" && typeof params.lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${params.lat},${params.lng}`;
  }

  if (params.query?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(params.query.trim())}`;
  }

  return "#";
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}
