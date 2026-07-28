"use client";

import { MoreHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const MENU_WIDTH = 176;
const VIEWPORT_PADDING = 8;

type MenuPosition = Pick<CSSProperties, "top" | "left">;

export function AdminRowActionsClient({
  children,
  label = "Acciones",
}: {
  children: ReactNode;
  label?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !mounted) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const menuWidth = Math.max(menuRect.width, MENU_WIDTH);
      const menuHeight = menuRect.height;
      const left = Math.min(
        Math.max(VIEWPORT_PADDING, triggerRect.right - menuWidth),
        window.innerWidth - menuWidth - VIEWPORT_PADDING,
      );
      const belowTop = triggerRect.bottom + 4;
      const aboveTop = triggerRect.top - menuHeight - 4;
      const top = belowTop + menuHeight <= window.innerHeight - VIEWPORT_PADDING || aboveTop < VIEWPORT_PADDING
        ? Math.min(belowTop, window.innerHeight - menuHeight - VIEWPORT_PADDING)
        : aboveTop;

      setPosition({ top: Math.max(VIEWPORT_PADDING, top), left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [mounted, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const menu = open && mounted
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] min-w-44 space-y-1 rounded-lg border border-gray-200 bg-white p-1 text-left shadow-[0_12px_30px_-20px_rgba(31,26,23,0.55)]"
          style={position}
        >
          {children}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {menu}
    </div>
  );
}
