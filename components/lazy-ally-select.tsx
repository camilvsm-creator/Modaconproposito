"use client";

import { useEffect, useState } from "react";

import { getAllyOptionsAction } from "@/app/admin/aliados/actions";
import { compactInputClassName } from "@/components/ui";

export function LazyAllySelect({ name = "allyId", required = true }: { name?: string; required?: boolean }) {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAllyOptionsAction()
      .then((items) => { if (active) setOptions(items); })
      .catch(() => { if (active) setError("No se pudieron cargar los aliados."); });
    return () => { active = false; };
  }, []);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">Aliado</span>
      <select className={compactInputClassName} name={name} required={required} defaultValue="" disabled={Boolean(error)}>
        <option value="" disabled>{error ?? (options.length ? "Selecciona un aliado" : "Cargando aliados...")}</option>
        {options.map((ally) => <option key={ally.id} value={ally.id}>{ally.name}</option>)}
      </select>
    </label>
  );
}
