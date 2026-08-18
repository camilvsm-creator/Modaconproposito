export function getMarketplaceImageUrl(path: string | null | undefined) {
  if (!path) return null;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return baseUrl ? `${baseUrl}/storage/v1/object/public/marketplace-products/${path}` : null;
}
