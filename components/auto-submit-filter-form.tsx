"use client";

import type { ChangeEvent, FormHTMLAttributes, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type AutoSubmitFilterFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onChange" | "onSubmit"> & {
  children: ReactNode;
  debounceMs?: number;
};

export function AutoSubmitFilterForm({ children, debounceMs = 650, ...props }: AutoSubmitFilterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function submitForm() {
    const form = formRef.current;
    if (!form) return;

    const action = form.getAttribute("action") || pathname;
    const url = new URL(action, window.location.origin);
    const params = new URLSearchParams();

    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value !== "string" || !value || value === "all" || (key === "page" && value === "1")) continue;
      params.append(key, value);
    }

    const query = params.toString();
    router.replace(`${url.pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;

    if (target instanceof HTMLInputElement && ["text", "search", "email"].includes(target.type)) {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(submitForm, debounceMs);
      return;
    }

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    submitForm();
  }

  return (
    <form
      {...props}
      ref={formRef}
      onChange={handleChange}
      onSubmit={(event) => {
        event.preventDefault();
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        submitForm();
      }}
    >
      {children}
    </form>
  );
}
