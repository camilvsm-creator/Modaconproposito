import { redirect } from "next/navigation";
import { cache } from "react";

import { requireWorkshopUser } from "@/lib/auth";
import { getWorkshopByUserId } from "@/lib/workshops";

export const requireCurrentAlly = cache(async () => {
  const user = await requireWorkshopUser();
  const role = user.app_metadata?.role as string | undefined;

  if (role !== "aliado") {
    redirect("/admin/aliados");
  }

  return getWorkshopByUserId(user.id);
});
