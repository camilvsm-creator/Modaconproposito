import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { Illustration } from "@/components/illustration";
import { SectionCard } from "@/components/ui";

export function EmptyState({
  title,
  description,
  action,
  illustration,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: string;
}) {
  return (
    <SectionCard className="p-8 text-center">
      {illustration ? (
        <Illustration src={illustration} className="mx-auto h-12 w-auto object-contain" />
      ) : (
        <Inbox className="mx-auto h-9 w-9 text-gray-400" />
      )}
      <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-gray-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </SectionCard>
  );
}
