import type { ReactNode } from "react";

import { AdminPageNavigation } from "@/components/admin-page-navigation";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string;
  actions?: ReactNode;
  className?: string;
  navigation?: {
    baseHref: string;
    baseLabel: string;
    currentLabel?: string;
  };
};

export function AdminPageHeader({ eyebrow, title, description, meta, actions, className, navigation }: AdminPageHeaderProps) {
  const hasNavigation = !!navigation?.currentLabel;

  return (
    <div className={cn("space-y-4 border-b border-stone-200/80 pb-4", hasNavigation ? "pt-16 lg:pt-0" : undefined, className)}>
      {hasNavigation ? <AdminPageNavigation {...navigation} title={title} /> : null}

      <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", hasNavigation ? "hidden lg:flex" : undefined)}>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-[2rem]">{title}</h1>
            {meta ? <span className="rounded-lg bg-white/80 px-3 py-1 text-sm font-semibold text-stone-700 ring-1 ring-stone-200">{meta}</span> : null}
          </div>
          {description ? <p className="max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {hasNavigation ? (
        <div className="space-y-3 lg:hidden">
          {description ? <p className="text-sm leading-6 text-stone-600">{description}</p> : null}
          {meta || actions ? (
            <div className="flex flex-wrap items-center gap-2">
              {meta ? <span className="rounded-lg bg-white/80 px-3 py-1 text-sm font-semibold text-stone-700 ring-1 ring-stone-200">{meta}</span> : null}
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
