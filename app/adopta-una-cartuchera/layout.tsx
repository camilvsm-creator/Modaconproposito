import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adopta una Cartuchera — Promoda",
};

export default function CartucheraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
