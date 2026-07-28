"use client";

import { useEffect, useState } from "react";

import { getDeliveryTaskOptionsAction } from "@/app/admin/entregas/actions";
import { compactInputClassName } from "@/components/ui";

export function LazyDeliveryTaskSelect({ allyId, defaultValue = "" }: { allyId?: string; defaultValue?: string }) {
  const [options, setOptions] = useState<Array<{ id: string; title: string; ally?: { id: string; name: string } | null }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setOptions([]);
    setSelectedValue(defaultValue);
    getDeliveryTaskOptionsAction(allyId)
      .then((items) => { if (active) setOptions(items); })
      .catch(() => { if (active) setError("No se pudieron cargar las tareas."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [allyId, defaultValue]);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">Tarea</span>
      <select className={compactInputClassName} name="taskId" required disabled={Boolean(error) || loading || !options.length} value={selectedValue} onChange={(event) => setSelectedValue(event.target.value)}>
        <option value="" disabled>{error ?? (loading ? "Cargando tareas..." : options.length ? "Selecciona una tarea" : "No hay tareas completadas")}</option>
        {options.map((task) => <option key={task.id} value={task.id}>{task.title}{task.ally?.name ? ` - ${task.ally.name}` : ""}</option>)}
      </select>
    </label>
  );
}
