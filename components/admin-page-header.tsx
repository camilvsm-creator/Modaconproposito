import type { ReactNode } from "react";

import { AdminPageNavigation } from "@/components/admin-page-navigation";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  meta?: string;
  actions?: ReactNode;
  className?: string;
  navigation?: {
    baseHref: string;
    baseLabel: string;
    currentLabel?: string;
  };
};

export function AdminPageHeader({ title, description, meta, actions, className, navigation }: AdminPageHeaderProps) {
  const hasNavigation = !!navigation?.currentLabel;

  return (
    <div className={cn("space-y-3 pb-2", hasNavigation ? "pt-16 lg:pt-0" : undefined, className)}>
      {hasNavigation ? <AdminPageNavigation {...navigation} title={title} /> : null}

      <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", hasNavigation ? "hidden lg:flex" : undefined)}>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-[2rem]">{title}</h1>
            {meta ? <span className="rounded-md bg-primary-soft px-2.5 py-1 text-sm font-semibold text-primary-dark">{meta}</span> : null}
          </div>
          {description ? <p className="max-w-3xl text-sm leading-6 text-gray-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto [&>a]:w-full [&>button]:w-full [&>div]:w-full lg:[&>a]:w-auto lg:[&>button]:w-auto lg:[&>div]:w-auto">{actions}</div> : null}
      </div>

      {hasNavigation ? (
        <div className="space-y-3 lg:hidden">
          {description ? <p className="text-sm leading-6 text-gray-600">{description}</p> : null}
          {meta || actions ? (
            <div className="flex flex-wrap items-center gap-2">
              {meta ? <span className="rounded-md bg-primary-soft px-2.5 py-1 text-sm font-semibold text-primary-dark">{meta}</span> : null}
              {actions ? <div className="flex w-full flex-wrap gap-2 [&>a]:w-full [&>button]:w-full [&>div]:w-full">{actions}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
