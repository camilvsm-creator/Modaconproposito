export const APP_NAME = "Afectados Terremoto Venezuela";
export const APP_SUBTITLE =
  "Repositorio ciudadano para ubicar casos, daños materiales y necesidades tras el terremoto en Venezuela.";
export const CITIZEN_DISCLAIMER =
  "No somos una institución oficial y el registro no garantiza ayuda. Organizamos información reportada por afectados, vecinos y voluntarios para facilitar revisión, priorización y coordinación.";
export const PHOTO_BUCKET = "report-photos";
export const PUBLIC_PHOTO_BUCKET = "public-report-photos";
export const INSPECTION_PHOTO_BUCKET = "inspection-photos";
export const INSPECTOR_VERIFICATION_BUCKET = "inspector-verification-docs";
export const INSPECTION_REPORT_BUCKET = "inspection-report-pdfs";
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_INSPECTION_ATTACHMENTS = 6;
export const MAX_INSPECTION_ATTACHMENT_BYTES = 30 * 1024 * 1024;
export const MAX_QUICK_REPORT_TOTAL_BYTES = 30 * 1024 * 1024;
export const MAX_INSPECTION_TOTAL_BYTES = 45 * 1024 * 1024;
export const MAX_INSPECTOR_VERIFICATION_DOCUMENTS = 2;
export const MAX_INSPECTOR_VERIFICATION_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_INSPECTOR_VERIFICATION_TOTAL_BYTES = 24 * 1024 * 1024;

export const INSPECTOR_PROFESSIONS = [
  "Ingeniería civil",
  "Ingeniería estructural",
  "Ingeniería geotécnica",
  "Arquitectura",
  "Ingeniería sísmica",
  "Otra",
] as const;

export const INSPECTOR_EXPERIENCE_RANGES = [
  "0 a 2 años",
  "3 a 5 años",
  "6 a 10 años",
  "11 a 15 años",
  "Más de 15 años",
] as const;

export const INSPECTOR_APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "approved_pending_activation",
  "activated",
  "rejected",
] as const;

export const INSPECTOR_APPLICATION_STATUS_LABELS: Record<(typeof INSPECTOR_APPLICATION_STATUSES)[number], string> = {
  submitted: "Recibida",
  under_review: "En revisión",
  approved_pending_activation: "Aprobada pendiente de activación",
  activated: "Activada",
  rejected: "Rechazada",
};

export const INSPECTOR_APPLICATION_DOCUMENT_TYPES = [
  "credential_front",
  "credential_back",
  "identity",
] as const;

export const INSPECTION_PROPERTY_TYPES = [
  "Casa",
  "Apartamento",
  "Local comercial",
] as const;

export const INSPECTOR_INSPECTION_SOURCE_TYPES = [
  "whatsapp",
  "instagram",
  "phone",
  "in_person",
  "email",
  "other",
] as const;

export const INSPECTOR_INSPECTION_SOURCE_LABELS: Record<(typeof INSPECTOR_INSPECTION_SOURCE_TYPES)[number], string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  phone: "Teléfono",
  in_person: "Presencial",
  email: "Correo",
  other: "Otro",
};

export const INSPECTION_STATUSES = [
  "pending",
  "assigned",
  "needs_visit",
  "assessed",
  "awaiting_info",
  "referred",
  "dismissed",
  "closed",
] as const;

export const INSPECTION_STATUS_LABELS: Record<(typeof INSPECTION_STATUSES)[number], string> = {
  pending: "Por asignar",
  assigned: "Asignada",
  needs_visit: "Requiere visita",
  assessed: "Evaluada",
  awaiting_info: "Falta información",
  referred: "Derivada",
  dismissed: "Descartada",
  closed: "Cerrada",
};

export const INSPECTION_STATUS_TONES: Record<(typeof INSPECTION_STATUSES)[number], string> = {
  pending: "bg-warning-soft text-warning",
  assigned: "bg-blue-100 text-blue-700",
  needs_visit: "bg-orange-100 text-orange-700",
  assessed: "bg-success-soft text-success",
  awaiting_info: "bg-purple-100 text-purple-700",
  referred: "bg-info-soft text-info",
  dismissed: "bg-danger-soft text-danger",
  closed: "bg-stone-200 text-stone-600",
};

export const INSPECTION_STATUS_DOT_COLORS: Record<(typeof INSPECTION_STATUSES)[number], string> = {
  pending: "bg-warning",
  assigned: "bg-blue-500",
  needs_visit: "bg-orange-500",
  assessed: "bg-success",
  awaiting_info: "bg-purple-500",
  referred: "bg-info",
  dismissed: "bg-danger",
  closed: "bg-stone-400",
};

export const INSPECTION_STATUS_DESCRIPTIONS: Record<(typeof INSPECTION_STATUSES)[number], string> = {
  pending: "Solicitud recibida, por asignar a un inspector.",
  assigned: "Un inspector está revisando la solicitud y evaluando los daños reportados.",
  needs_visit: "El inspector determinó que se requiere una visita presencial para completar la evaluación.",
  assessed: "La inspección fue completada y se emitió una evaluación o veredicto final.",
  awaiting_info: "Se necesita información adicional del solicitante para continuar con la evaluación.",
  referred: "El caso fue derivado a otra organización o entidad competente para su atención.",
  dismissed: "La solicitud fue descartada por no contar con la información necesaria (fotos, datos de contacto) para proceder con la evaluación.",
  closed: "El caso está cerrado. No se realizarán más acciones sobre esta solicitud.",
};

export const HABITABILITY_STATUSES = [
  "awaiting_evaluation",
  "habitable",
  "not_habitable",
  "needs_in_person",
] as const;

export const HABITABILITY_STATUS_LABELS: Record<(typeof HABITABILITY_STATUSES)[number], string> = {
  awaiting_evaluation: "Esperar evaluación",
  habitable: "Habitable",
  not_habitable: "No habitable",
  needs_in_person: "Necesita inspección presencial",
};

export const HABITABILITY_STATUS_TONES: Record<(typeof HABITABILITY_STATUSES)[number], string> = {
  awaiting_evaluation: "bg-warning-soft text-warning",
  habitable: "bg-success-soft text-success",
  not_habitable: "bg-danger-soft text-danger",
  needs_in_person: "bg-warning-soft text-warning",
};

export const REPORT_TYPES = [
  "Vivienda afectada",
  "Edificio en riesgo",
  "Negocio afectado",
  "Zona con daños",
  "Necesidad urgente",
  "Ayuda disponible",
  "Otro",
] as const;

export const CITIZEN_REPORT_TYPES = [
  "Vivienda afectada",
  "Edificio en riesgo",
  "Negocio afectado",
  "Zona con daños",
  "Necesidad urgente",
  "Otro",
] as const;

export const URGENCY_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const URGENCY_LABELS: Record<(typeof URGENCY_LEVELS)[number], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

export const REPORTER_RELATIONSHIPS = [
  "Afectado directo",
  "Familiar",
  "Vecino",
  "Voluntario",
  "Otro",
] as const;

export const PROPERTY_TYPES = [
  "Casa",
  "Apartamento",
  "Edificio residencial",
  "Edificio comercial",
  "Negocio/local",
  "Otro",
] as const;

export const PROPERTY_USES = [
  "Vivienda principal",
  "Vivienda alquilada",
  "Negocio familiar",
  "Local comercial",
  "Uso comunitario",
  "Servicio público",
  "Otro",
] as const;

export const DAMAGE_LEVELS = [
  "Daño leve",
  "Daño moderado",
  "Daño estructural",
  "Derrumbe parcial",
  "Derrumbe total",
] as const;

export const DAMAGE_COLORS: Record<string, string> = {
  "Daño leve": "#22c55e",
  "Daño moderado": "#f59e0b",
  "Daño estructural": "#f97316",
  "Derrumbe parcial": "#ef4444",
  "Derrumbe total": "#b91c1c",
};

export const DAMAGE_TYPES = [
  "Grietas en paredes",
  "Grietas en columnas",
  "Grietas en vigas",
  "Grietas en piso",
  "Pared caída",
  "Techo caído",
  "Escaleras dañadas",
  "Fachada dañada",
  "Puertas/ventanas dañadas",
  "Fuga de gas",
  "Fuga de agua",
  "Cortocircuito o daño eléctrico",
  "Incendio",
  "Derrumbe parcial",
  "Derrumbe total",
  "Deslizamiento de tierra",
  "Vía bloqueada",
  "Otro",
] as const;

export const NEEDS = [
  "Alojamiento temporal",
  "Alojamiento",
  "Agua",
  "Comida",
  "Medicinas",
  "Atención médica",
  "Ropa",
  "Colchonetas",
  "Pañales",
  "Fórmula infantil",
  "Transporte",
  "Evaluación estructural",
  "Remoción de escombros",
  "Apoyo para mascotas",
  "Otro",
] as const;

export const AID_TYPES = [
  "agua",
  "comida",
  "alojamiento",
  "transporte",
  "medicinas",
  "atención médica",
  "evaluación estructural",
  "remoción de escombros",
  "donación",
  "otro",
] as const;

export const REPORT_STATUSES = [
  "pending",
  "reviewing",
  "approved",
  "verified",
  "rejected",
  "duplicate",
  "merged",
  "partially_attended",
  "resolved",
] as const;

export const REPORT_STATUS_LABELS: Record<(typeof REPORT_STATUSES)[number], string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  approved: "Publicado",
  verified: "Verificado",
  rejected: "Rechazado",
  duplicate: "Duplicado",
  merged: "Fusionado",
  partially_attended: "Atendido parcialmente",
  resolved: "Resuelto",
};

export const VERIFICATION_LEVELS = [
  "unverified",
  "reviewed_by_volunteer",
  "visual_evidence",
  "confirmed_by_local_source",
  "confirmed_by_organization",
] as const;

export const PUBLIC_STATUSES = ["approved", "verified", "resolved"] as const;

export const CONTACT_REQUEST_TYPES = ["info", "correction", "removal"] as const;

export const PATTERN_BUCKET = "sewing-patterns";

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

export const WORKSHOP_PHOTO_BUCKET = "workshop-photos";
export const MAX_WORKSHOP_PHOTOS = 6;
export const MAX_WORKSHOP_AVATAR_BYTES = 2 * 1024 * 1024;

export const WORKSHOP_STATUSES = ["pendiente", "activo", "pausado", "rechazado", "desactivado"] as const;
export const WORKSHOP_NEED_STATUSES = ["pendiente", "publicada", "cubierta", "cerrada"] as const;
export const WORKSHOP_PHOTO_STATUSES = ["pendiente", "aprobada", "rechazada"] as const;
export const WORKSHOP_HELP_STATUSES = ["recibida", "gestionada", "cerrada"] as const;

export const WORKSHOP_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  activo: "Activo",
  pausado: "Pausado",
  rechazado: "Rechazado",
  desactivado: "Desactivado",
};

export const WORKSHOP_STATUS_TONES: Record<string, string> = {
  pendiente: "bg-warning-soft text-warning",
  activo: "bg-success-soft text-success",
  pausado: "bg-stone-200 text-stone-600",
  rechazado: "bg-danger-soft text-danger",
  desactivado: "bg-red-100 text-red-700",
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
