"use client";

import { useEffect, useState } from "react";

import { getDeliveryTaskOptionsAction } from "@/app/admin/entregas/actions";
import { compactInputClassName } from "@/components/ui";

export function LazyDeliveryTaskSelect({ allyId }: { allyId?: string }) {
  const [options, setOptions] = useState<Array<{ id: string; title: string; ally?: { id: string; name: string } | null }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDeliveryTaskOptionsAction(allyId)
      .then((items) => { if (active) setOptions(items); })
      .catch(() => { if (active) setError("No se pudieron cargar las tareas."); });
    return () => { active = false; };
  }, [allyId]);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">Tarea</span>
      <select className={compactInputClassName} name="taskId" required disabled={Boolean(error)} defaultValue="">
        <option value="" disabled>{error ?? (options.length ? "Selecciona una tarea" : "Cargando tareas...")}</option>
        {options.map((task) => <option key={task.id} value={task.id}>{task.title}{task.ally?.name ? ` - ${task.ally.name}` : ""}</option>)}
      </select>
    </label>
  );
}
