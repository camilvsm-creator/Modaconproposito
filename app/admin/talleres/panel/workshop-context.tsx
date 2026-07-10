"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Workshop } from "@/lib/types";

export const WorkshopContext = createContext<Workshop | null>(null);

export function WorkshopProvider({ children, workshop }: { children: ReactNode; workshop: Workshop | null }) {
  return <WorkshopContext.Provider value={workshop}>{children}</WorkshopContext.Provider>;
}

export function useWorkshop() {
  return useContext(WorkshopContext);
}
