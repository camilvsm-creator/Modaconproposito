"use client";

import { useState } from "react";

export function AllyAvatar({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const showAvatar = Boolean(src) && !failed;
  const fit = /\.(png|webp|gif|svg)$/i.test(src ?? "")
    ? "object-contain p-1"
    : "object-cover";

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-[#F6026B]/20 sm:h-14 sm:w-14 ${
        showAvatar ? "bg-white" : "bg-[#FFE6F0]"
      }`}
    >
      {showAvatar ? (
        <img
          src={src!}
          alt={alt}
          className={`h-full w-full ${fit}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <img src="/workshop-icon.png" alt="" className="h-7 w-7" />
      )}
    </div>
  );
}
