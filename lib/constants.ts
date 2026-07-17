export const APP_NAME = "Promoda Aliados";
export const APP_SUBTITLE = "Red de aliados, voluntarios y colaboradores textiles.";
export const CITIZEN_DISCLAIMER =
  "Promoda coordina información y apoyo entre aliados, voluntarios y colaboradores. La publicación de una solicitud no implica manejo directo de fondos.";

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;

export const URGENCY_LABELS: Record<(typeof URGENCY_LEVELS)[number], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export const PATTERN_BUCKET = "sewing-patterns";
export const ALLY_PHOTO_BUCKET = "ally-photos";

export const PATTERN_STATUSES = ["pendiente", "publicado", "archivado"] as const;

export const PATTERN_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  publicado: "Publicado",
  archivado: "Archivado",
};

export const PATTERN_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  publicado: "bg-success-soft text-success",
  archivado: "bg-stone-200 text-stone-600",
};

export const PATTERN_DIFFICULTIES = ["principiante", "intermedio", "avanzado"] as const;

export const PATTERN_DIFFICULTY_LABELS: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const PATTERN_CATEGORIES = [
  "Ropa infantil",
  "Ropa para adultos",
  "Accesorios",
  "Hogar / decoración",
  "Mascarillas / protección",
  "Otro",
] as const;

export const ALLY_CATEGORIES = ["academia", "taller", "escuela", "otro"] as const;

export const ALLY_CATEGORY_LABELS: Record<string, string> = {
  academia: "Academia",
  taller: "Taller",
  escuela: "Escuela",
  otro: "Otro",
};

export const WORKSHOP_PHOTO_BUCKET = ALLY_PHOTO_BUCKET;
export const MAX_WORKSHOP_PHOTOS = 6;
export const MAX_WORKSHOP_AVATAR_BYTES = 2 * 1024 * 1024;

export const WORKSHOP_STATUSES = [
  "pendiente",
  "approved_pending_activation",
  "activo",
  "pausado",
  "rechazado",
  "desactivado",
] as const;
export const WORKSHOP_NEED_STATUSES = ["pendiente", "publicada", "cubierta", "cerrada"] as const;
export const WORKSHOP_PHOTO_STATUSES = ["pendiente", "aprobada", "rechazada"] as const;
export const WORKSHOP_HELP_STATUSES = ["recibida", "gestionada", "cerrada"] as const;

export const ASSIGNED_TASK_STATUSES = ["pendiente", "asignada", "en_progreso", "completada", "cerrada"] as const;

export const ASSIGNED_TASK_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  asignada: "Asignada",
  en_progreso: "En progreso",
  completada: "Completada",
  cerrada: "Cerrada",
};

export const ASSIGNED_TASK_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  asignada: "bg-info-soft text-info",
  en_progreso: "bg-blue-100 text-blue-700",
  completada: "bg-success-soft text-success",
  cerrada: "bg-stone-200 text-stone-600",
};

export const WORKSHOP_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  approved_pending_activation: "Por activar",
  activo: "Activo",
  pausado: "Pausado",
  rechazado: "Rechazado",
  desactivado: "Desactivado",
};

export const WORKSHOP_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  approved_pending_activation: "bg-blue-100 text-blue-700",
  activo: "bg-success-soft text-success",
  pausado: "bg-stone-200 text-stone-600",
  rechazado: "bg-danger-soft text-danger",
  desactivado: "bg-danger-soft text-danger",
};

export const WORKSHOP_NEED_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  publicada: "Publicada",
  cubierta: "Cubierta",
  cerrada: "Cerrada",
};

export const WORKSHOP_NEED_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  publicada: "bg-success-soft text-success",
  cubierta: "bg-info-soft text-info",
  cerrada: "bg-stone-200 text-stone-600",
};

export const WORKSHOP_PHOTO_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export const WORKSHOP_PHOTO_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  aprobada: "bg-success-soft text-success",
  rechazada: "bg-danger-soft text-danger",
};

export const WORKSHOP_HELP_STATUS_LABELS: Record<string, string> = {
  recibida: "Recibida",
  gestionada: "Gestionada",
  cerrada: "Cerrada",
};

export const WORKSHOP_HELP_STATUS_TONES: Record<string, string> = {
  recibida: "bg-info-soft text-info",
  gestionada: "bg-success-soft text-success",
  cerrada: "bg-stone-200 text-stone-600",
};

export const HELP_TYPE_GROUPS = [
  {
    label: "Materiales",
    options: ["Tela", "Hilo", "Agujas", "Elásticos", "Cierres / botones", "Insumos de costura"],
  },
  {
    label: "Maquinaria",
    options: ["Máquinas de coser", "Repuestos de máquinas"],
  },
  {
    label: "Ropa y bolsas",
    options: ["Ropa en buen estado", "Bolsas para clasificar ropa"],
  },
  {
    label: "Servicios",
    options: ["Transporte", "Voluntarios", "Difusión"],
  },
  {
    label: "Económico",
    options: ["Donación económica"],
  },
  {
    label: "Otro",
    options: ["Otro"],
  },
] as const;

export const HELP_TYPES = HELP_TYPE_GROUPS.flatMap((g) => g.options) as readonly string[];

export const HELP_TYPES_LABELS: Record<string, string> = Object.fromEntries(
  HELP_TYPES.map((t) => [t, t]),
) as Record<string, string>;

export const HELP_AVAILABILITY_OPTIONS = [
  { value: "una_vez", label: "Una vez" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "flexible", label: "Flexible" },
] as const;

export const HELP_AVAILABILITY_LABELS: Record<string, string> = Object.fromEntries(
  HELP_AVAILABILITY_OPTIONS.map((o) => [o.value, o.label]),
);

export const AID_REQUEST_STATUSES = ["recibida", "en_revision", "convertida", "cerrada"] as const;
export const RAW_MATERIAL_STATUSES = ["disponible", "agotado", "archivado"] as const;
export const ALLY_RAW_MATERIAL_ASSIGNMENT_STATUSES = ["asignada", "entregada", "usada", "cancelada"] as const;
export const ALLY_DELIVERY_STATUSES = ["pendiente", "entregada", "recibida", "cancelada"] as const;
