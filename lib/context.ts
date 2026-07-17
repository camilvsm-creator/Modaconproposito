import type { AppContext } from "@/lib/types";

export const CONTEXT_COOKIE = "promoda-context";
export const CONTEXT_PLATFORM = "platform";

export function getContextFromHeaders(headers: Headers): AppContext {
  const raw = headers.get("x-context");
  if (!raw || raw === CONTEXT_PLATFORM) {
    return { type: "platform" };
  }
  return { type: "aliado", workshopId: raw };
}

export function getContextWorkshopId(headers: Headers): string | null {
  const ctx = getContextFromHeaders(headers);
  return ctx.type === "aliado" ? ctx.workshopId : null;
}

export function isPlatformContext(headers: Headers): boolean {
  const ctx = getContextFromHeaders(headers);
  return ctx.type === "platform";
}
