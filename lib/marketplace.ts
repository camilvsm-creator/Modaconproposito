import crypto from "crypto";
import { cache } from "react";

import type {
  MarketplaceCustomer,
  MarketplaceOrder,
  MarketplacePaymentSettings,
  MarketplaceProduct,
  PagedResult,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PRODUCT_FIELDS = `
  id, ally_id, slug, name, description, price_usd, stock_quantity, status,
  rejection_reason, approved_by, approved_at, created_at, updated_at,
  ally:allies(id, name, slug),
  images:marketplace_product_images(id, product_id, storage_path, sort_order, created_at)
`;

const ORDER_FIELDS = `
  id, order_number, customer_id, customer_user_id, product_id, ally_id,
  product_name_snapshot, unit_price_usd, quantity, total_usd, buyer_name,
  buyer_email, buyer_whatsapp, delivery_address, payment_phone_snapshot,
  payment_bank_snapshot, payment_rif_snapshot, payment_holder_snapshot,
  payment_instructions_snapshot, payment_status, order_status, payment_proof_path,
  payment_review_notes, reviewed_by, reviewed_at, shipped_at, delivered_at,
  delivery_notes, stock_released_at, created_at, updated_at,
  product:marketplace_products(id, slug, name, price_usd),
  ally:allies(id, name, slug),
  customer:marketplace_customers(id, full_name, email, whatsapp)
`;

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function normalizeProduct(product: Record<string, unknown>): MarketplaceProduct {
  return {
    ...(product as unknown as MarketplaceProduct),
    price_usd: Number(product.price_usd ?? 0),
    stock_quantity: Number(product.stock_quantity ?? 0),
    ally: normalizeRelation(product.ally) as MarketplaceProduct["ally"],
    images: Array.isArray(product.images) ? product.images as MarketplaceProduct["images"] : [],
  };
}

function normalizeOrder(order: Record<string, unknown>): MarketplaceOrder {
  return {
    ...(order as unknown as MarketplaceOrder),
    unit_price_usd: Number(order.unit_price_usd ?? 0),
    quantity: Number(order.quantity ?? 0),
    total_usd: Number(order.total_usd ?? 0),
    product: normalizeRelation(order.product) as MarketplaceOrder["product"],
    ally: normalizeRelation(order.ally) as MarketplaceOrder["ally"],
    customer: normalizeRelation(order.customer) as MarketplaceOrder["customer"],
  };
}

function sanitizeSearch(value: string) {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function slugifyMarketplaceProduct(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "producto";
}

export async function generateMarketplaceProductSlug(name: string) {
  const admin = createSupabaseAdminClient();
  const base = slugifyMarketplaceProduct(name);
  const { data, error } = await admin
    .from("marketplace_products")
    .select("slug")
    .like("slug", `${base}%`);
  assertQueryOk(error, "No se pudo generar el enlace del producto");

  const existing = new Set((data ?? []).map((item) => item.slug));
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export { getMarketplaceImageUrl } from "@/lib/marketplace-helpers";

export async function getPublicMarketplaceProductsPage({
  page = 1,
  limit = 12,
  q,
}: {
  page?: number;
  limit?: number;
  q?: string;
} = {}): Promise<PagedResult<MarketplaceProduct>> {
  const supabase = createSupabasePublicClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 48);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("marketplace_products")
    .select(PRODUCT_FIELDS, { count: "exact" })
    .eq("status", "aprobado")
    .order("created_at", { ascending: false })
    .range(from, to);

  const search = q ? sanitizeSearch(q) : "";
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los productos");
  const total = count ?? 0;
  return {
    items: (data ?? []).map((item) => normalizeProduct(item as Record<string, unknown>)),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export const getPublicMarketplaceProductBySlug = cache(async (slug: string) => {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("marketplace_products")
    .select(PRODUCT_FIELDS)
    .eq("slug", slug)
    .eq("status", "aprobado")
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el producto");
  return data ? normalizeProduct(data as Record<string, unknown>) : null;
});

export async function getAdminMarketplaceProductsPage({
  page = 1,
  limit = 20,
  q,
  status,
  allyId,
}: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  allyId?: string;
} = {}): Promise<PagedResult<MarketplaceProduct>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("marketplace_products")
    .select(PRODUCT_FIELDS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("status", status);
  if (allyId) query = query.eq("ally_id", allyId);
  const search = q ? sanitizeSearch(q) : "";
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los productos del marketplace");
  const total = count ?? 0;
  return {
    items: (data ?? []).map((item) => normalizeProduct(item as Record<string, unknown>)),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getMarketplaceProductById(productId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_products")
    .select(PRODUCT_FIELDS)
    .eq("id", productId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el producto");
  return data ? normalizeProduct(data as Record<string, unknown>) : null;
}

export async function getMarketplaceCustomerByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_customers")
    .select("id, user_id, full_name, email, whatsapp, address, status, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar tu cuenta de comprador");
  return (data ?? null) as MarketplaceCustomer | null;
}

export async function getMarketplacePaymentSettings() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("marketplace_payment_settings")
    .select("id, phone, bank, rif, account_holder, instructions, updated_by, updated_at")
    .eq("id", true)
    .maybeSingle();
  assertQueryOk(error, "No se pudieron cargar los datos de pago");
  return (data ?? null) as MarketplacePaymentSettings | null;
}

export async function getAdminMarketplacePaymentSettings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_payment_settings")
    .select("id, phone, bank, rif, account_holder, instructions, updated_by, updated_at")
    .eq("id", true)
    .maybeSingle();
  assertQueryOk(error, "No se pudieron cargar los datos de pago");
  return (data ?? null) as MarketplacePaymentSettings | null;
}

export async function getMarketplaceAllies() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("allies")
    .select("id, name")
    .in("status", ["activo", "pausado"])
    .order("name", { ascending: true });
  assertQueryOk(error, "No se pudieron cargar los aliados");
  return data ?? [];
}

export async function getMarketplaceOrdersPage({
  page = 1,
  limit = 20,
  status,
  paymentStatus,
  customerUserId,
  allyId,
}: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  customerUserId?: string;
  allyId?: string;
} = {}): Promise<PagedResult<MarketplaceOrder>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("marketplace_orders")
    .select(ORDER_FIELDS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") query = query.eq("order_status", status);
  if (paymentStatus && paymentStatus !== "all") query = query.eq("payment_status", paymentStatus);
  if (customerUserId) query = query.eq("customer_user_id", customerUserId);
  if (allyId) query = query.eq("ally_id", allyId);

  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los pedidos");
  const total = count ?? 0;
  return {
    items: (data ?? []).map((item) => normalizeOrder(item as Record<string, unknown>)),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getMarketplaceOrderById(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_orders")
    .select(ORDER_FIELDS)
    .eq("id", orderId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el pedido");
  return data ? normalizeOrder(data as Record<string, unknown>) : null;
}

export async function createMarketplaceOrderNumber() {
  const admin = createSupabaseAdminClient();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `MP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const { data } = await admin.from("marketplace_orders").select("id").eq("order_number", candidate).maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("No se pudo generar el número del pedido.");
}

export async function createMarketplaceProductStoragePath(productId: string, fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `products/${productId}/${crypto.randomUUID()}.${extension}`;
}

export async function createMarketplaceProofStoragePath(orderId: string, fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `orders/${orderId}/${crypto.randomUUID()}.${extension}`;
}
