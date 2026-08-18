"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_PAYMENT_STATUSES,
  MARKETPLACE_PRODUCT_STATUSES,
} from "@/lib/constants";
import { requireAdminUser, requireMarketplaceBuyer, requireMarketplaceUser } from "@/lib/auth";
import {
  createMarketplaceOrderNumber,
  createMarketplaceProductStoragePath,
  createMarketplaceProofStoragePath,
  generateMarketplaceProductSlug,
  getMarketplaceCustomerByUserId,
  getMarketplaceProductById,
  getMarketplacePaymentSettings,
} from "@/lib/marketplace";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWorkshopByUserId } from "@/lib/workshops";

type Result = { error?: string; success?: boolean; orderId?: string };

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PROOF_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROOF_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

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

function revalidateMarketplace() {
  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
}

export async function registerMarketplaceCustomerAction(formData: FormData): Promise<Result> {
  const fullName = value(formData, "fullName");
  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const whatsapp = value(formData, "whatsapp");
  const address = value(formData, "address");

  if (!fullName || !whatsapp || !address) return { error: "Completa todos los datos de contacto." };
  if (!validEmail(email)) return { error: "Ingresa un correo electrónico válido." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirmPassword) return { error: "Las contraseñas no coinciden." };

  const admin = createSupabaseAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, marketplace_customer: true },
    app_metadata: { role: "comprador" },
  });

  if (createError || !created.user) {
    if (createError?.message.toLowerCase().includes("already been registered")) {
      return { error: "Ya existe una cuenta con ese correo." };
    }
    return { error: createError?.message ?? "No pudimos crear tu cuenta." };
  }

  const { error: profileError } = await admin.from("marketplace_customers").insert({
    user_id: created.user.id,
    full_name: fullName,
    email,
    whatsapp,
    address,
    status: "activo",
  });

  if (profileError) return { error: "La cuenta fue creada, pero no pudimos guardar tus datos. Contacta al equipo." };
  return { success: true };
}

export async function updateMarketplaceCustomerAction(formData: FormData): Promise<void> {
  const user = await requireMarketplaceBuyer();
  const fullName = value(formData, "fullName");
  const email = value(formData, "email").toLowerCase();
  const whatsapp = value(formData, "whatsapp");
  const address = value(formData, "address");
  if (!fullName || !validEmail(email) || !whatsapp || !address) throw new Error("Completa todos los datos de contacto.");

  const admin = createSupabaseAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(user.id, { email });
  if (authError) throw new Error(authError.message);
  const { error } = await admin.from("marketplace_customers").update({
    full_name: fullName,
    email,
    whatsapp,
    address,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace/checkout");
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
  if (!allyId || !name) throw new Error("El producto y el aliado son obligatorios.");
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
  if (!name || priceUsd === null || priceUsd <= 0 || stockQuantity === null || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Revisa el nombre, precio e inventario del producto.");
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
  const phone = value(formData, "phone");
  const bank = value(formData, "bank");
  const rif = value(formData, "rif");
  const accountHolder = value(formData, "accountHolder");
  const instructions = value(formData, "instructions");
  if (!phone || !bank || !rif || !accountHolder) throw new Error("Completa todos los datos de Pago Móvil.");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("marketplace_payment_settings").upsert({
    id: true,
    phone,
    bank,
    rif,
    account_holder: accountHolder,
    instructions: instructions || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/marketplace/checkout");
  revalidatePath("/admin/marketplace");
}

export async function createMarketplaceOrderAction(formData: FormData): Promise<Result> {
  const user = await requireMarketplaceBuyer();
  const productId = value(formData, "productId");
  const quantity = numberValue(formData, "quantity");
  const buyerName = value(formData, "buyerName");
  const buyerEmail = value(formData, "buyerEmail").toLowerCase();
  const buyerWhatsapp = value(formData, "buyerWhatsapp");
  const deliveryAddress = value(formData, "deliveryAddress");
  const proof = formData.get("paymentProof");
  if (!productId || quantity === null || !Number.isInteger(quantity) || quantity < 1) return { error: "La cantidad no es válida." };
  if (!buyerName || !validEmail(buyerEmail) || !buyerWhatsapp || !deliveryAddress) return { error: "Completa todos los datos del comprador y la entrega." };
  if (!(proof instanceof File) || proof.size === 0) return { error: "Adjunta el comprobante de pago." };
  if (!PROOF_TYPES.has(proof.type) || proof.size > MAX_PROOF_BYTES) return { error: "El comprobante debe ser JPG, PNG, WEBP o PDF de hasta 8 MB." };

  const customer = await getMarketplaceCustomerByUserId(user.id);
  if (!customer || customer.status !== "activo") return { error: "No encontramos una cuenta de comprador activa." };
  const admin = createSupabaseAdminClient();
  const { data: product, error: productError } = await admin
    .from("marketplace_products")
    .select("id, ally_id, name, price_usd, stock_quantity, status")
    .eq("id", productId)
    .maybeSingle();
  if (productError) return { error: productError.message };
  if (!product || product.status !== "aprobado") return { error: "Este producto ya no está disponible." };

  const settings = await getMarketplacePaymentSettings();
  if (!settings || !settings.phone || !settings.bank || !settings.rif || !settings.account_holder) return { error: "El equipo todavía no ha configurado los datos de pago." };

  const { data: reservedProduct, error: reserveError } = await admin
    .from("marketplace_products")
    .update({ stock_quantity: product.stock_quantity - quantity, updated_at: new Date().toISOString() })
    .eq("id", product.id)
    .eq("status", "aprobado")
    .gte("stock_quantity", quantity)
    .select("id")
    .maybeSingle();
  if (reserveError) return { error: reserveError.message };
  if (!reservedProduct) return { error: "No hay inventario suficiente para esa cantidad." };

  const orderNumber = await createMarketplaceOrderNumber();
  const totalUsd = Number(product.price_usd) * quantity;
  const { data: order, error: orderError } = await admin.from("marketplace_orders").insert({
    order_number: orderNumber,
    customer_id: customer.id,
    customer_user_id: user.id,
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
    payment_phone_snapshot: settings.phone,
    payment_bank_snapshot: settings.bank,
    payment_rif_snapshot: settings.rif,
    payment_holder_snapshot: settings.account_holder,
    payment_instructions_snapshot: settings.instructions,
    payment_status: "pendiente_comprobante",
    order_status: "pendiente_pago",
  }).select("id").single();
  if (orderError || !order) {
    await restoreMarketplaceStock(admin, product.id, quantity);
    return { error: orderError?.message ?? "No se pudo crear el pedido." };
  }

  try {
    const proofPath = await uploadPaymentProof(admin, order.id, proof);
    const { error: proofUpdateError } = await admin.from("marketplace_orders").update({
      payment_proof_path: proofPath,
      payment_status: "en_revision",
      order_status: "pago_en_revision",
      updated_at: new Date().toISOString(),
    }).eq("id", order.id);
    if (proofUpdateError) throw new Error(proofUpdateError.message);
  } catch {
    return { error: "El pedido fue creado, pero no pudimos guardar el comprobante. Puedes cargarlo desde el detalle del pedido.", orderId: order.id };
  }

  revalidateMarketplace();
  redirect(`/admin/marketplace/${order.id}?created=1`);
}

export async function uploadMarketplacePaymentProofAction(formData: FormData): Promise<void> {
  const user = await requireMarketplaceBuyer();
  const orderId = value(formData, "orderId");
  const proof = formData.get("paymentProof");
  if (!(proof instanceof File) || proof.size === 0) throw new Error("Adjunta el comprobante de pago.");
  if (!PROOF_TYPES.has(proof.type) || proof.size > MAX_PROOF_BYTES) throw new Error("El comprobante debe ser JPG, PNG, WEBP o PDF de hasta 8 MB.");

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin.from("marketplace_orders").select("id, customer_user_id, order_status").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order || order.customer_user_id !== user.id) throw new Error("No tienes acceso a este pedido.");
  if (["entregado", "cancelado"].includes(order.order_status)) throw new Error("Este pedido ya no admite comprobantes.");

  const path = await uploadPaymentProof(admin, order.id, proof);
  const { error: updateError } = await admin.from("marketplace_orders").update({
    payment_proof_path: path,
    payment_status: "en_revision",
    order_status: "pago_en_revision",
    updated_at: new Date().toISOString(),
  }).eq("id", order.id);
  if (updateError) throw new Error(updateError.message);
  revalidatePath(`/admin/marketplace/${order.id}`);
  revalidatePath("/admin/marketplace");
}

export async function reviewMarketplacePaymentAction(formData: FormData): Promise<void> {
  const user = await requireAdminUser();
  const orderId = value(formData, "orderId");
  const paymentStatus = value(formData, "paymentStatus");
  const notes = value(formData, "notes");
  if (!MARKETPLACE_PAYMENT_STATUSES.includes(paymentStatus as (typeof MARKETPLACE_PAYMENT_STATUSES)[number])) throw new Error("Estado de pago inválido.");
  if (!["aprobado", "rechazado"].includes(paymentStatus)) throw new Error("La revisión debe aprobar o rechazar el comprobante.");

  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin.from("marketplace_orders").select("id, payment_status, order_status").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("El pedido no existe.");

  const { error: updateError } = await admin.from("marketplace_orders").update({
    payment_status: paymentStatus,
    order_status: paymentStatus === "aprobado" ? "pago_aprobado" : "pendiente_pago",
    payment_review_notes: notes || null,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  const { data: order, error } = await admin.from("marketplace_orders").select("id, product_id, ally_id, quantity, payment_status, order_status, stock_released_at").eq("id", orderId).maybeSingle();
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
  if (nextStatus === "cancelado" && order.order_status !== "cancelado" && !order.stock_released_at) {
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
  if (files.length > 6) throw new Error("Puedes subir hasta 6 imágenes por producto.");
  for (const file of files) {
    if (!IMAGE_TYPES.has(file.type) || file.size > MAX_PRODUCT_IMAGE_BYTES) throw new Error("Las imágenes deben ser JPG, PNG o WEBP de hasta 5 MB.");
    const path = await createMarketplaceProductStoragePath(productId, file.name);
    const { error } = await admin.storage.from("marketplace-products").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`No se pudo guardar la imagen: ${error.message}`);
    const { error: imageError } = await admin.from("marketplace_product_images").insert({ product_id: productId, storage_path: path, sort_order: 0 });
    if (imageError) throw new Error(imageError.message);
  }
}

async function uploadPaymentProof(admin: ReturnType<typeof createSupabaseAdminClient>, orderId: string, file: File) {
  const path = await createMarketplaceProofStoragePath(orderId, file.name);
  const { error } = await admin.storage.from("marketplace-payment-proofs").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

async function restoreMarketplaceStock(admin: ReturnType<typeof createSupabaseAdminClient>, productId: string, quantity: number) {
  const { data: product } = await admin.from("marketplace_products").select("stock_quantity").eq("id", productId).maybeSingle();
  if (product) {
    await admin.from("marketplace_products").update({ stock_quantity: Number(product.stock_quantity ?? 0) + quantity }).eq("id", productId);
  }
}
