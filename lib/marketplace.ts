import crypto from "crypto";
import { cache } from "react";

import type {
  MarketplaceOrder,
  MarketplacePaymentMethod,
  MarketplacePaymentSettings,
  MarketplaceContribution,
  MarketplaceProduct,
  MarketplaceProductImage,
  PagedResult,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const MARKETPLACE_PAYPAL_URL = "https://www.paypal.com/paypalme/fundacionjp2santos?country.x=VE&locale.x=es_XC&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAafHoMNfUYtrPj4eJrV4M90Gz1t_PnGgqUVQFd60W9wMrxLItgYN-0-rperpvw_aem_4M4ltjmydzeaFiFXFiOxaQ";

export const MARKETPLACE_EVENT_BANNER_ENABLED = true;

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
  payment_instructions_snapshot, paypal_url_snapshot, paypal_reference, payment_status, order_status, payment_proof_path,
  payment_review_notes, reviewed_by, reviewed_at, shipped_at, delivered_at,
  delivery_notes, stock_released_at, stock_reserved_at, payment_method_id,
  payment_method_code_snapshot, payment_method_name_snapshot, payment_method_type_snapshot,
  payment_method_url_snapshot, payment_method_details_snapshot, payment_reference,
  payment_submitted_at, stock_reservation_expires_at, guest_access_token_hash, created_at, updated_at,
  product:marketplace_products(id, slug, name, price_usd),
  ally:allies(id, name, slug),
  customer:marketplace_customers(id, full_name, email, whatsapp),
  payment_method:marketplace_payment_methods(id, code, name, method_type),
  proofs:marketplace_order_payment_proofs(id, order_id, storage_path, original_name, content_type, file_size_bytes, created_at)
`;

function assertQueryOk(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function releaseExpiredMarketplaceReservations() {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: expiredOrders, error } = await admin
    .from("marketplace_orders")
    .select("id, product_id, quantity")
    .eq("order_status", "pendiente_pago")
    .not("stock_reserved_at", "is", null)
    .is("stock_released_at", null)
    .not("stock_reservation_expires_at", "is", null)
    .lte("stock_reservation_expires_at", now);
  assertQueryOk(error, "No se pudieron liberar reservas vencidas");

  for (const order of expiredOrders ?? []) {
    const { data: product } = await admin.from("marketplace_products").select("stock_quantity").eq("id", order.product_id).maybeSingle();
    if (!product) continue;
    await admin.from("marketplace_products").update({ stock_quantity: Number(product.stock_quantity ?? 0) + Number(order.quantity ?? 0), updated_at: now }).eq("id", order.product_id);
    await admin.from("marketplace_orders").update({
      order_status: "cancelado",
      stock_released_at: now,
      stock_reservation_expires_at: null,
      payment_review_notes: "Reserva vencida automáticamente.",
      updated_at: now,
    }).eq("id", order.id).is("stock_released_at", null);
  }
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
    images: Array.isArray(product.images)
      ? [...product.images as MarketplaceProductImage[]].sort((a, b) => a.sort_order - b.sort_order)
      : [],
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
    payment_method: normalizeRelation(order.payment_method) as MarketplaceOrder["payment_method"],
    proofs: Array.isArray(order.proofs) ? order.proofs as MarketplaceOrder["proofs"] : [],
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

export async function getMarketplacePaymentSettings() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("marketplace_payment_settings")
    .select("id, paypal_url, contact_whatsapp, phone, bank, rif, account_holder, instructions, updated_by, updated_at")
    .eq("id", true)
    .maybeSingle();
  assertQueryOk(error, "No se pudieron cargar los datos de pago");
  return (data ?? null) as MarketplacePaymentSettings | null;
}

export async function getMarketplacePaymentMethods() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("marketplace_payment_methods")
    .select("id, code, name, method_type, payment_url, payment_details, instructions, supports_amount, is_active, sort_order, updated_by, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  assertQueryOk(error, "No se pudieron cargar los métodos de pago");
  return (data ?? []) as MarketplacePaymentMethod[];
}

export async function getAdminMarketplacePaymentMethods() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_payment_methods")
    .select("id, code, name, method_type, payment_url, payment_details, instructions, supports_amount, is_active, sort_order, updated_by, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  assertQueryOk(error, "No se pudieron cargar los métodos de pago");
  return (data ?? []) as MarketplacePaymentMethod[];
}

export async function getAdminMarketplacePaymentSettings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_payment_settings")
    .select("id, paypal_url, contact_whatsapp, phone, bank, rif, account_holder, instructions, updated_by, updated_at")
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

export async function getMarketplaceContributionsPage({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PagedResult<MarketplaceContribution>> {
  const supabase = await createSupabaseServerClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("marketplace_contributions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, count, error } = await query;
  assertQueryOk(error, "No se pudieron cargar los aportes");
  const total = count ?? 0;
  return {
    items: (data ?? []).map((item) => ({
      ...(item as MarketplaceContribution),
      amount_bs: Number(item.amount_bs ?? 0),
    })),
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getMarketplaceContributionById(contributionId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_contributions")
    .select("*")
    .eq("id", contributionId)
    .maybeSingle();
  assertQueryOk(error, "No se pudo cargar el aporte");
  return data ? ({ ...data, amount_bs: Number(data.amount_bs ?? 0) } as MarketplaceContribution) : null;
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
