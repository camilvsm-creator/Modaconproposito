import { redirect } from "next/navigation";
import { cache } from "react";

import { requireRequesterUser } from "@/lib/auth";
import { getRequesterByUserId } from "@/lib/requesters";

export const requireCurrentRequester = cache(async () => {
  const user = await requireRequesterUser();
  const requester = await getRequesterByUserId(user.id);

  if (!requester) {
    redirect("/admin");
  }

  return requester;
});
