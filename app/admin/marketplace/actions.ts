"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import {
  MARKETPLACE_CONTRIBUTION_STATUSES,
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_PAYMENT_STATUSES,
  MARKETPLACE_PRODUCT_STATUSES,
} from "@/lib/constants";
import { requireAdminUser, requireMarketplaceUser } from "@/lib/auth";
import {
  createMarketplaceOrderNumber,
  createMarketplaceProductStoragePath,
  generateMarketplaceProductSlug,
  getMarketplaceProductById,
  getOfficialMarketplaceDollarRate,
  releaseExpiredMarketplaceReservations,
  MARKETPLACE_PAYPAL_URL,
} from "@/lib/marketplace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

type Result = {
  error?: string;
  success?: boolean;
  orderId?: string;
  orderNumber?: string;
  guestAccessToken?: string;
  paymentUrl?: string | null;
  paymentMethodName?: string;
  paymentMethodType?: string;
  paymentMethodCode?: string;
  paymentInstructions?: string | null;
  paymentDetails?: string | null;
  paymentSupportsAmount?: boolean;
  totalUsd?: number;
  paymentAmountBs?: number | null;
  paymentExchangeRate?: number | null;
};

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PAYMENT_PROOF_BYTES = 8 * 1024 * 1024;
const PAYMENT_PROOF_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const PAGO_MOVIL_CODE = "pago-movil";
const MAX_CONTRIBUTION_PROOF_BYTES = 8 * 1024 * 1024;

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function numberValue(formData: FormData, name: string) {
  const parsed = Number(value(formData, name));
  return Number.isFinite(parsed) ? parsed : null;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPaymentDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isPagoMovil(code: string | null | undefined) {
  return code === PAGO_MOVIL_CODE || code === "pago_movil";
}

function hashGuestAccessToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(-80) || "comprobante";
}

function revalidateMarketplace() {
  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
}

export async function createMarketplaceProductAction(formData: FormData): Promise<void> {
  const user = await requireMarketplaceUser();
  const role = user.app_metadata?.role as string | undefined;
  const admin = createSupabaseAdminClient();
  let allyId = value(formData, "allyId") || null;

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally) throw new Error("No se encontró el aliado vinculado.");
    allyId = ally.id;
  } else {
    await requireAdminUser();
  }

  const name = value(formData, "name");
  const description = value(formData, "description");
  const priceUsd = numberValue(formData, "priceUsd");
  const stockQuantity = numberValue(formData, "stockQuantity");
  if (!allyId || !name || !description) throw new Error("El producto, el aliado y la descripción son obligatorios.");
  if (priceUsd === null || priceUsd <= 0) throw new Error("El precio debe ser mayor que cero.");
  if (stockQuantity === null || !Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error("El inventario debe ser un número entero válido.");

  const slug = await generateMarketplaceProductSlug(name);
  const { data: product, error } = await admin.from("marketplace_products").insert({
    ally_id: allyId,
    slug,
    name,
    description: description || null,
    price_usd: priceUsd,
    stock_quantity: stockQuantity,
    status: "pendiente_revision",
  }).select("id").single();
  if (error || !product) throw new Error(error?.message ?? "No se pudo crear el producto.");

  await uploadProductImages(admin, product.id, formData.getAll("images"));
  revalidateMarketplace();
}

export async function updateMarketplaceProductAction(formData: FormData): Promise<void> {
  const user = await requireMarketplaceUser();
  const role = user.app_metadata?.role as string | undefined;
  const productId = value(formData, "productId");
  const product = await getMarketplaceProductById(productId);
  if (!product) throw new Error("El producto no existe.");

  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== product.ally_id) throw new Error("No tienes permiso para editar este producto.");
  } else {
    await requireAdminUser();
  }

  const name = value(formData, "name");
  const description = value(formData, "description");
  const priceUsd = numberValue(formData, "priceUsd");
  const stockQuantity = numberValue(formData, "stockQuantity");
  if (!name || !description || priceUsd === null || priceUsd <= 0 || stockQuantity === null || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Revisa el nombre, descripción, precio e inventario del producto.");
  }

  const admin = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {
    name,
    description: description || null,
    price_usd: priceUsd,
    stock_quantity: stockQuantity,
    updated_at: new Date().toISOString(),
  };
  if (role === "aliado") {
    updates.status = "pendiente_revision";
    updates.rejection_reason = null;
    updates.approved_by = null;
    updates.approved_at = null;
  }

  const { error } = await admin.from("marketplace_products").update(updates).eq("id", productId);
  if (error) throw new Error(error.message);
  await uploadProductImages(admin, productId, formData.getAll("images"));
  revalidateMarketplace();
}

export async function updateMarketplaceProductStatusAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const productId = value(formData, "productId");
  const status = value(formData, "status");
  const rejectionReason = value(formData, "rejectionReason");
  if (!MARKETPLACE_PRODUCT_STATUSES.includes(status as (typeof MARKETPLACE_PRODUCT_STATUSES)[number])) throw new Error("Estado de producto inválido.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("marketplace_products").update({
    status,
    rejection_reason: status === "rechazado" ? rejectionReason || null : null,
    approved_by: status === "aprobado" ? user.id : null,
    approved_at: status === "aprobado" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidateMarketplace();
}

export async function updateMarketplacePaymentSettingsAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const paypalUrl = value(formData, "paypalUrl") || MARKETPLACE_PAYPAL_URL;
  const contactWhatsapp = value(formData, "contactWhatsapp");
  const instructions = value(formData, "instructions");
  const submittedPagoMovilExchangeRate = numberValue(formData, "pagoMovilExchangeRate");
  if (!paypalUrl.startsWith("https://www.paypal.com/paypalme/")) throw new Error("El enlace debe ser un enlace válido de PayPal.Me.");

  const admin = createSupabaseAdminClient();
  let pagoMovilExchangeRate = submittedPagoMovilExchangeRate;
  if (pagoMovilExchangeRate === null) {
    const { data: currentSettings, error: settingsError } = await admin.from("marketplace_payment_settings").select("pago_movil_exchange_rate").eq("id", true).maybeSingle();
    if (settingsError) throw new Error(settingsError.message);
    pagoMovilExchangeRate = Number(currentSettings?.pago_movil_exchange_rate ?? 0);
  }
  if (!Number.isFinite(pagoMovilExchangeRate) || pagoMovilExchangeRate <= 0) throw new Error("La tasa de Pago Móvil debe ser mayor que cero.");
  const { error } = await admin.from("marketplace_payment_settings").upsert({
    id: true,
    paypal_url: paypalUrl,
    contact_whatsapp: contactWhatsapp,
    instructions: instructions || null,
    pago_movil_exchange_rate: pagoMovilExchangeRate,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/marketplace/checkout");
  revalidatePath("/admin/marketplace");
}

export async function saveMarketplacePaymentMethodAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const methodId = value(formData, "methodId");
  const name = value(formData, "name");
  const code = value(formData, "code").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  const methodType = value(formData, "methodType");
  const paymentUrl = value(formData, "paymentUrl");
  const paymentDetails = value(formData, "paymentDetails");
  const instructions = value(formData, "instructions");
  const sortOrder = numberValue(formData, "sortOrder");
  const supportsAmount = formData.get("supportsAmount") === "on";
  const isActive = formData.get("isActive") === "on";
  if (!name || !code || !["link", "manual"].includes(methodType)) throw new Error("Revisa el nombre y el tipo del método de pago.");
  if (methodType === "link" && !paymentUrl) throw new Error("Los métodos con enlace necesitan una URL.");
  if (paymentUrl && !paymentUrl.startsWith("https://")) throw new Error("El enlace de pago debe comenzar con https://.");

  const admin = createSupabaseAdminClient();
  const payload = {
    code,
    name,
    method_type: methodType,
    payment_url: paymentUrl || null,
    payment_details: paymentDetails || null,
    instructions: instructions || null,
    supports_amount: methodType === "link" && supportsAmount,
    is_active: isActive,
    sort_order: sortOrder !== null && Number.isInteger(sortOrder) ? sortOrder : 0,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const query = methodId
    ? admin.from("marketplace_payment_methods").update(payload).eq("id", methodId)
    : admin.from("marketplace_payment_methods").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/marketplace/checkout");
  revalidatePath("/admin/marketplace");
}

export async function createMarketplaceOrderAction(formData: FormData): Promise<Result> {
  const productId = value(formData, "productId");
  const quantity = numberValue(formData, "quantity");
  const buyerName = value(formData, "buyerName");
  const buyerEmail = value(formData, "buyerEmail").toLowerCase();
  const buyerWhatsapp = value(formData, "buyerWhatsapp");
  const deliveryAddress = value(formData, "deliveryAddress");
  const paymentMethodId = value(formData, "paymentMethodId");
  if (!productId || quantity === null || !Number.isInteger(quantity) || quantity < 1) return { error: "La cantidad no es válida." };
  if (!buyerName || !validEmail(buyerEmail) || !buyerWhatsapp || !deliveryAddress) return { error: "Completa todos los datos del comprador y la entrega." };
  const admin = createSupabaseAdminClient();
  await releaseExpiredMarketplaceReservations();
  const { data: product, error: productError } = await admin
    .from("marketplace_products")
    .select("id, ally_id, name, price_usd, stock_quantity, status")
    .eq("id", productId)
    .maybeSingle();
  if (productError) return { error: productError.message };
  if (!product || product.status !== "aprobado") return { error: "Este producto ya no está disponible." };

  const { data: paymentMethod, error: paymentMethodError } = await admin
    .from("marketplace_payment_methods")
    .select("id, code, name, method_type, payment_url, payment_details, instructions, supports_amount, is_active")
    .eq("id", paymentMethodId)
    .eq("is_active", true)
    .maybeSingle();
  if (paymentMethodError) return { error: paymentMethodError.message };
  if (!paymentMethod) return { error: "Selecciona un método de pago válido." };
  if (paymentMethod.method_type === "link" && !paymentMethod.payment_url) return { error: "Este método de pago no tiene un enlace configurado." };

  const totalUsd = Number(product.price_usd) * quantity;
  let paymentAmountBs: number | null = null;
  let paymentExchangeRate: number | null = null;
  if (isPagoMovil(paymentMethod.code)) {
    const officialRate = await getOfficialMarketplaceDollarRate();
    paymentExchangeRate = officialRate?.rate ?? null;
    if (!paymentExchangeRate) return { error: "No pudimos consultar la tasa oficial del dólar. Inténtalo nuevamente." };
    paymentAmountBs = Math.round((totalUsd * paymentExchangeRate + Number.EPSILON) * 100) / 100;
  }

  const currentStock = Number(product.stock_quantity ?? 0);
  if (currentStock < quantity) return { error: "No hay inventario suficiente para este pedido." };
  const now = new Date();
  const reservationExpiresAt = new Date(now.getTime() + (paymentMethod.method_type === "manual" ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000));
  const { data: reservedProduct, error: reserveError } = await admin
    .from("marketplace_products")
    .update({ stock_quantity: currentStock - quantity, updated_at: now.toISOString() })
    .eq("id", product.id)
    .eq("stock_quantity", currentStock)
    .gte("stock_quantity", quantity)
    .select("id")
    .maybeSingle();
  if (reserveError) return { error: reserveError.message };
  if (!reservedProduct) return { error: "El inventario cambió mientras preparábamos el pedido. Inténtalo nuevamente." };

  const orderNumber = await createMarketplaceOrderNumber();
  const guestAccessToken = crypto.randomBytes(24).toString("hex");
  const { data: order, error: orderError } = await admin.from("marketplace_orders").insert({
    order_number: orderNumber,
    customer_id: null,
    customer_user_id: null,
    product_id: product.id,
    ally_id: product.ally_id,
    product_name_snapshot: product.name,
    unit_price_usd: product.price_usd,
    quantity,
    total_usd: totalUsd,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_whatsapp: buyerWhatsapp,
    delivery_address: deliveryAddress,
    payment_phone_snapshot: "",
    payment_bank_snapshot: "",
    payment_rif_snapshot: "",
    payment_holder_snapshot: "",
    payment_instructions_snapshot: paymentMethod.instructions,
    paypal_url_snapshot: paymentMethod.code === "paypal" ? paymentMethod.payment_url : null,
    payment_method_id: paymentMethod.id,
    payment_method_code_snapshot: paymentMethod.code,
    payment_method_name_snapshot: paymentMethod.name,
    payment_method_type_snapshot: paymentMethod.method_type,
    payment_method_url_snapshot: paymentMethod.payment_url,
    payment_method_details_snapshot: paymentMethod.payment_details,
    payment_amount_bs: paymentAmountBs,
    payment_exchange_rate: paymentExchangeRate,
    payment_status: "pendiente_comprobante",
    order_status: "pendiente_pago",
    stock_reserved_at: now.toISOString(),
    stock_reservation_expires_at: reservationExpiresAt.toISOString(),
    guest_access_token_hash: hashGuestAccessToken(guestAccessToken),
  }).select("id").single();
  if (orderError || !order) {
    await restoreMarketplaceStock(admin, product.id, quantity);
    return { error: orderError?.message ?? "No se pudo crear el pedido." };
  }

  revalidateMarketplace();
  return {
    success: true,
    orderId: order.id,
    orderNumber,
    guestAccessToken,
    paymentUrl: paymentMethod.payment_url,
    paymentMethodName: paymentMethod.name,
    paymentMethodType: paymentMethod.method_type,
    paymentMethodCode: paymentMethod.code,
    paymentInstructions: paymentMethod.instructions,
    paymentDetails: paymentMethod.payment_details,
    paymentSupportsAmount: paymentMethod.supports_amount,
    totalUsd,
    paymentAmountBs,
    paymentExchangeRate,
  };
}

export async function submitMarketplacePaymentAction(formData: FormData): Promise<Result> {
  const orderId = value(formData, "orderId");
  const guestAccessToken = value(formData, "guestAccessToken");
  const paymentReference = value(formData, "paymentReference").slice(0, 120);
  const paymentDate = value(formData, "paymentDate");
  const paymentSubmissionKey = value(formData, "paymentSubmissionKey").slice(0, 100);
  const proof = formData.get("paymentProof");
  if (!orderId || !guestAccessToken) return { error: "No se pudo validar el pedido." };

  const admin = createSupabaseAdminClient();
  const { data: order, error: orderError } = await admin
    .from("marketplace_orders")
    .select("id, order_number, guest_access_token_hash, order_status, payment_status, payment_method_code_snapshot, stock_reserved_at, stock_released_at")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) return { error: orderError.message };
  if (!order || order.guest_access_token_hash !== hashGuestAccessToken(guestAccessToken)) return { error: "El pedido no pudo validarse." };
  if (order.order_status === "cancelado" || order.stock_released_at) return { error: "La reserva de este pedido ya venció. Crea un nuevo pedido." };

  const pagoMovil = isPagoMovil(order.payment_method_code_snapshot);
  if (pagoMovil) {
    if (order.payment_status === "en_revision" || order.payment_status === "aprobado") return { success: true, orderNumber: order.order_number };
    if (!paymentReference || !validPaymentDate(paymentDate) || new Date(`${paymentDate}T00:00:00Z`) > new Date()) return { error: "Completa una referencia y una fecha de pago válida." };
    if (!paymentSubmissionKey) return { error: "No se pudo validar el envío del comprobante." };
    const { data: duplicate } = await admin.from("marketplace_orders").select("order_number").eq("payment_submission_key", paymentSubmissionKey).maybeSingle();
    if (duplicate) return { success: true, orderNumber: duplicate.order_number };
    if (!(proof instanceof File) || proof.size === 0) return { error: "Adjunta el comprobante de Pago Móvil." };
  }

  let uploadedProofPath: string | null = null;
  if (proof instanceof File && proof.size > 0) {
    if (!PAYMENT_PROOF_TYPES.has(proof.type) || proof.size > MAX_PAYMENT_PROOF_BYTES) return { error: "El comprobante debe ser JPG, PNG, WEBP o PDF de hasta 8 MB." };
    const path = `orders/${order.id}/${crypto.randomUUID()}-${safeFileName(proof.name)}`;
    uploadedProofPath = path;
    const { error: uploadError } = await admin.storage.from("marketplace-payment-proofs").upload(path, proof, { contentType: proof.type, upsert: false });
    if (uploadError) return { error: `No se pudo cargar el comprobante: ${uploadError.message}` };
    const { error: proofError } = await admin.from("marketplace_order_payment_proofs").insert({
      order_id: order.id,
      storage_path: path,
      original_name: proof.name.slice(0, 180),
      content_type: proof.type,
      file_size_bytes: proof.size,
    });
    if (proofError) {
      await admin.storage.from("marketplace-payment-proofs").remove([path]);
      return { error: proofError.message };
    }
  }

  const now = new Date().toISOString();
  const { error: updateError } = await admin.from("marketplace_orders").update({
    payment_reference: paymentReference || null,
    paypal_reference: paymentReference || null,
    payment_status: "en_revision",
    order_status: "pago_en_revision",
    ...(uploadedProofPath ? { payment_proof_path: uploadedProofPath } : {}),
    payment_submitted_at: now,
    ...(pagoMovil ? { payment_date: paymentDate, payment_submission_key: paymentSubmissionKey } : {}),
    stock_reservation_expires_at: null,
    updated_at: now,
  }).eq("id", order.id);
  if (updateError) {
    if (uploadedProofPath) await admin.storage.from("marketplace-payment-proofs").remove([uploadedProofPath]);
    if (uploadedProofPath) await admin.from("marketplace_order_payment_proofs").delete().eq("storage_path", uploadedProofPath);
    return { error: updateError.message };
  }

  revalidateMarketplace();
  return { success: true, orderNumber: order.order_number };
}

export async function submitMarketplaceContributionAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const donorName = value(formData, "donorName");
  const donorEmail = value(formData, "donorEmail").toLowerCase();
  const paymentMethod = value(formData, "paymentMethod");
  const amount = numberValue(formData, "amountBs");
  const paymentReference = value(formData, "paymentReference").slice(0, 120);
  const paymentDate = value(formData, "paymentDate");
  const idempotencyKey = value(formData, "idempotencyKey");
  const proof = formData.get("proof");
  if (!donorName || !validEmail(donorEmail) || !["pago_movil", "transferencia"].includes(paymentMethod)) return { error: "Completa los datos personales y selecciona un método de pago." };
  if (amount === null || amount <= 0 || !paymentReference || !validPaymentDate(paymentDate) || !idempotencyKey) return { error: "Completa todos los datos del aporte." };
  if (!(proof instanceof File) || proof.size === 0) return { error: "Sube el comprobante del aporte." };
  if (!PAYMENT_PROOF_TYPES.has(proof.type) || proof.size > MAX_CONTRIBUTION_PROOF_BYTES) return { error: "El comprobante debe ser JPG, PNG o PDF de hasta 8 MB." };

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin.from("marketplace_contributions").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
  if (existing) return { error: "Este comprobante ya fue enviado." };
  const contributionId = crypto.randomUUID();
  const path = `contributions/${contributionId}/${crypto.randomUUID()}-${safeFileName(proof.name)}`;
  const { error: uploadError } = await admin.storage.from("marketplace-payment-proofs").upload(path, proof, { contentType: proof.type, upsert: false });
  if (uploadError) return { error: `No se pudo cargar el comprobante: ${uploadError.message}` };
  const { error } = await admin.from("marketplace_contributions").insert({
    id: contributionId,
    donor_name: donorName,
    donor_email: donorEmail,
    payment_method: paymentMethod,
    amount_bs: amount,
    payment_reference: paymentReference,
    payment_date: paymentDate,
    proof_storage_path: path,
    proof_original_name: proof.name.slice(0, 180),
    proof_content_type: proof.type,
    proof_file_size_bytes: proof.size,
    status: "pendiente_verificacion",
    idempotency_key: idempotencyKey,
  });
  if (error) {
    await admin.storage.from("marketplace-payment-proofs").remove([path]);
    return { error: error.code === "23505" ? "Este comprobante ya fue enviado." : error.message };
  }
  revalidatePath("/admin/marketplace");
  return { success: true };
}

export async function reviewMarketplaceContributionAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const contributionId = value(formData, "contributionId");
  const status = value(formData, "status");
  const notes = value(formData, "notes");
  if (!contributionId || !MARKETPLACE_CONTRIBUTION_STATUSES.includes(status as (typeof MARKETPLACE_CONTRIBUTION_STATUSES)[number])) throw new Error("Estado de aporte inválido.");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("marketplace_contributions").update({ status, review_notes: notes || null, reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", contributionId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketplace");
  revalidatePath(`/admin/marketplace/aportes/${contributionId}`);
}

export async function reviewMarketplacePaymentAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const orderId = value(formData, "orderId");
  const paymentStatus = value(formData, "paymentStatus");
  const notes = value(formData, "notes");
  if (!MARKETPLACE_PAYMENT_STATUSES.includes(paymentStatus as (typeof MARKETPLACE_PAYMENT_STATUSES)[number])) throw new Error("Estado de pago inválido.");
  if (!["aprobado", "rechazado"].includes(paymentStatus)) throw new Error("La revisión debe aprobar o rechazar el comprobante.");

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin.from("marketplace_orders").select("id, product_id, quantity, payment_status, order_status, stock_reserved_at, stock_released_at").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("El pedido no existe.");
  if (!["en_revision", "pendiente_comprobante", "rechazado"].includes(order.payment_status)) throw new Error("Este pago ya fue revisado y no puede actualizarse desde esta acción.");

  const now = new Date().toISOString();
  if (paymentStatus === "aprobado" && !order.stock_reserved_at) {
    const { data: product, error: productError } = await admin.from("marketplace_products").select("stock_quantity, status").eq("id", order.product_id).maybeSingle();
    if (productError) throw new Error(productError.message);
    const currentStock = Number(product?.stock_quantity ?? 0);
    const quantity = Number(order.quantity ?? 0);
    if (!product || product.status !== "aprobado" || currentStock < quantity) throw new Error("No hay inventario suficiente para aprobar este pedido.");
    const { data: reservedProduct, error: reserveError } = await admin
      .from("marketplace_products")
      .update({ stock_quantity: currentStock - quantity, updated_at: now })
      .eq("id", order.product_id)
      .eq("stock_quantity", currentStock)
      .select("id")
      .maybeSingle();
    if (reserveError) throw new Error(reserveError.message);
    if (!reservedProduct) throw new Error("El inventario cambió mientras se aprobaba el pedido. Inténtalo de nuevo.");
  }

  if (paymentStatus === "rechazado" && order.stock_reserved_at && !order.stock_released_at) {
    await restoreMarketplaceStock(admin, order.product_id, Number(order.quantity ?? 0));
  }

  const { error: updateError } = await admin.from("marketplace_orders").update({
    payment_status: paymentStatus,
    order_status: paymentStatus === "aprobado" ? "pago_aprobado" : "pendiente_pago",
    payment_review_notes: notes || null,
    reviewed_by: user.id,
    reviewed_at: now,
    stock_reserved_at: paymentStatus === "aprobado" ? (order.stock_reserved_at ?? now) : null,
    stock_released_at: paymentStatus === "rechazado" ? now : null,
    stock_reservation_expires_at: null,
    updated_at: now,
  }).eq("id", orderId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/marketplace/${orderId}`);
  revalidatePath("/admin/marketplace");
}

export async function updateMarketplaceOrderDeliveryAction(formData: FormData): Promise<void> {
  const user = await requireMarketplaceUser();
  const role = user.app_metadata?.role as string | undefined;
  const orderId = value(formData, "orderId");
  const nextStatus = value(formData, "orderStatus");
  const notes = value(formData, "deliveryNotes");
  if (!MARKETPLACE_ORDER_STATUSES.includes(nextStatus as (typeof MARKETPLACE_ORDER_STATUSES)[number])) throw new Error("Estado de pedido inválido.");
  if (!["en_preparacion", "enviado", "entregado", "cancelado"].includes(nextStatus)) throw new Error("Estado logístico no permitido.");

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin.from("marketplace_orders").select("id, product_id, ally_id, quantity, payment_status, order_status, stock_reserved_at, stock_released_at").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("El pedido no existe.");
  if (role === "aliado") {
    const ally = await getWorkshopByUserId(user.id);
    if (!ally || ally.id !== order.ally_id) throw new Error("No tienes acceso a este pedido.");
  } else {
    await requireAdminUser();
  }
  if (order.payment_status !== "aprobado" && nextStatus !== "cancelado") throw new Error("El pago debe estar aprobado antes de gestionar la entrega.");

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    order_status: nextStatus,
    delivery_notes: notes || null,
    updated_at: now,
  };
  if (nextStatus === "enviado") updates.shipped_at = now;
  if (nextStatus === "entregado") updates.delivered_at = now;

  const { error: updateError } = await admin.from("marketplace_orders").update(updates).eq("id", orderId);
  if (updateError) throw new Error(updateError.message);
  if (nextStatus === "cancelado" && order.order_status !== "cancelado" && order.stock_reserved_at && !order.stock_released_at) {
    await restoreMarketplaceStock(admin, order.product_id, Number(order.quantity ?? 0));
    await admin.from("marketplace_orders").update({ stock_released_at: now }).eq("id", orderId);
  }
  revalidatePath(`/admin/marketplace/${orderId}`);
  revalidatePath("/admin/marketplace");
}

export async function getMarketplaceAlliesAction() {
  await requireAdminUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("allies").select("id, name").in("status", ["activo", "pausado"]).order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function uploadProductImages(admin: ReturnType<typeof createSupabaseAdminClient>, productId: string, entries: FormDataEntryValue[]) {
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const { count } = await admin.from("marketplace_product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  if ((count ?? 0) + files.length > 6) throw new Error("Puedes tener hasta 6 imágenes por producto.");
  let sortOrder = count ?? 0;
  for (const file of files) {
    if (!IMAGE_TYPES.has(file.type) || file.size > MAX_PRODUCT_IMAGE_BYTES) throw new Error("Las imágenes deben ser JPG, PNG o WEBP de hasta 5 MB.");
    const path = await createMarketplaceProductStoragePath(productId, file.name);
    const { error } = await admin.storage.from("marketplace-products").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`No se pudo guardar la imagen: ${error.message}`);
    const { error: imageError } = await admin.from("marketplace_product_images").insert({ product_id: productId, storage_path: path, sort_order: sortOrder });
    if (imageError) throw new Error(imageError.message);
    sortOrder += 1;
  }
}

async function restoreMarketplaceStock(admin: ReturnType<typeof createSupabaseAdminClient>, productId: string, quantity: number) {
  const { data: product } = await admin.from("marketplace_products").select("stock_quantity").eq("id", productId).maybeSingle();
  if (product) {
    await admin.from("marketplace_products").update({ stock_quantity: Number(product.stock_quantity ?? 0) + quantity }).eq("id", productId);
  }
}
