import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type RequesterType = "refugio" | "fundacion" | "persona_afectada" | "otro";

export type HelpRequestStatus =
  | "pendiente"
  | "en_revision"
  | "aprobada"
  | "en_produccion"
  | "lista_para_entrega"
  | "entregada"
  | "rechazada";

export type UrgencyLevel = "alta" | "media" | "baja";

export type ProductSize = {
  name: string;
  quantity: number;
};

export type HelpRequestProduct = {
  name: string;
  quantity: number;
  sizes: ProductSize[];
};

export type HelpRequestRow = {
  id: string;
  sequential_number: number;
  full_name: string;
  organization: string | null;
  phone: string;
  email: string;
  requester_type: RequesterType;
  state: string;
  city: string;
  delivery_address: string;
  products: HelpRequestProduct[];
  urgency: UrgencyLevel;
  description: string;
  evidence_files: string[];
  status: HelpRequestStatus;
  assigned_workshops: string[];
  created_at: string;
  updated_at: string;
};

export type HelpRequest = {
  id: string;
  sequentialNumber: number;
  fullName: string;
  organization: string | null;
  phone: string;
  email: string;
  requesterType: RequesterType;
  state: string;
  city: string;
  deliveryAddress: string;
  products: HelpRequestProduct[];
  urgency: UrgencyLevel;
  description: string;
  evidenceFiles: string[];
  status: HelpRequestStatus;
  createdAt: string;
  assignedWorkshops: string[];
};

export const REQUESTER_TYPE_LABELS: Record<RequesterType, string> = {
  refugio: "Refugio",
  fundacion: "Fundación u ONG",
  persona_afectada: "Persona afectada",
  otro: "Otro",
};

export const STATUS_LABELS: Record<HelpRequestStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  en_produccion: "En producción",
  lista_para_entrega: "Lista para entrega",
  entregada: "Entregada",
  rechazada: "Rechazada",
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const STATUS_BADGES: Record<HelpRequestStatus, string> = {
  pendiente: "bg-stone-100 text-stone-600",
  en_revision: "bg-blue-100 text-blue-700",
  aprobada: "bg-green-100 text-green-700",
  en_produccion: "bg-purple-100 text-purple-700",
  lista_para_entrega: "bg-amber-100 text-amber-700",
  entregada: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-red-100 text-red-700",
};

export const URGENCY_BADGES: Record<UrgencyLevel, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-green-100 text-green-700",
};

export const PRODUCT_OPTIONS = [
  "Ropa interior",
  "Sábanas",
  "Toallas",
  "Paños",
  "Otro",
];

export const SIZE_OPTIONS = [
  "Niños",
  "Niñas",
  "Adulto S",
  "Adulto M",
  "Adulto L",
  "Adulto XL",
];

const PENDING_STATUSES: HelpRequestStatus[] = ["pendiente", "en_revision"];
const APPROVED_STATUSES: HelpRequestStatus[] = ["aprobada", "en_produccion", "lista_para_entrega", "entregada"];

function rowToHelpRequest(row: HelpRequestRow): HelpRequest {
  return {
    id: row.id,
    sequentialNumber: row.sequential_number,
    fullName: row.full_name,
    organization: row.organization,
    phone: row.phone,
    email: row.email,
    requesterType: row.requester_type,
    state: row.state,
    city: row.city,
    deliveryAddress: row.delivery_address,
    products: row.products,
    urgency: row.urgency,
    description: row.description,
    evidenceFiles: row.evidence_files,
    status: row.status,
    createdAt: row.created_at,
    assignedWorkshops: row.assigned_workshops,
  };
}

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export async function getAdminHelpRequestsPage({
  tab = "pendientes",
  page = 1,
  limit = 20,
  q,
}: {
  tab?: "pendientes" | "aprobadas";
  page?: number;
  limit?: number;
  q?: string;
} = {}): Promise<PagedResult<HelpRequest>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const statuses = tab === "aprobadas" ? APPROVED_STATUSES : PENDING_STATUSES;

  let query = admin
    .from("help_requests")
    .select("*", { count: "exact" })
    .in("status", statuses)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,organization.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar las solicitudes");
  const total = count ?? 0;

  return {
    items: ((data ?? []) as HelpRequestRow[]).map(rowToHelpRequest),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getHelpRequestStats() {
  const admin = createSupabaseAdminClient();

  const [totalResult, pendingResult, inProcessResult, deliveredResult] = await Promise.all([
    admin.from("help_requests").select("id", { count: "exact", head: true }),
    admin.from("help_requests").select("id", { count: "exact", head: true }).in("status", ["pendiente", "en_revision"]),
    admin.from("help_requests").select("id", { count: "exact", head: true }).in("status", ["aprobada", "en_produccion", "lista_para_entrega"]),
    admin.from("help_requests").select("id", { count: "exact", head: true }).eq("status", "entregada"),
  ]);

  return {
    total: totalResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    inProcess: inProcessResult.count ?? 0,
    delivered: deliveredResult.count ?? 0,
  };
}

export async function getHelpRequestById(id: string): Promise<HelpRequest | null> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("help_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToHelpRequest(data as HelpRequestRow);
}
