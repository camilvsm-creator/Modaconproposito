"use client";

import { useEffect, useState } from "react";

import { getAidRequesterOptionsAction } from "@/app/admin/solicitantes/actions";
import { compactInputClassName } from "@/components/ui";

export function LazyRequesterSelect({ name = "requesterId" }: { name?: string }) {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAidRequesterOptionsAction()
      .then((items) => { if (active) setOptions(items); })
      .catch(() => { if (active) setError("No se pudieron cargar los solicitantes."); });
    return () => { active = false; };
  }, []);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">Solicitante</span>
      <select className={compactInputClassName} name={name} required defaultValue="" disabled={Boolean(error)}>
        <option value="" disabled>{error ?? (options.length ? "Selecciona un solicitante" : "Cargando solicitantes...")}</option>
        {options.map((requester) => <option key={requester.id} value={requester.id}>{requester.name}</option>)}
      </select>
    </label>
  );
}
