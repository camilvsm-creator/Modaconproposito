"use client";

import { useEffect, useState } from "react";

import { getOwnTaskOptionsAction } from "@/app/admin/materia-prima/actions";
import { compactInputClassName } from "@/components/ui";

type TaskOption = { id: string; title: string; status: string };

export function LazyOwnTaskSelect() {
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOwnTaskOptionsAction().then(setTasks).catch(() => setError("No se pudieron cargar las tareas."));
  }, []);

  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-800">Tarea</span>
      <select className={compactInputClassName} name="taskId" required defaultValue="">
        <option value="" disabled>{error ?? "Selecciona tarea"}</option>
        {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
      </select>
    </label>
  );
}
