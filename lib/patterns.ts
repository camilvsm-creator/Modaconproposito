import {
  PATTERN_BUCKET,
  PATTERN_CATEGORIES,
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { SewingPattern } from "@/lib/types";

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

// ---- Admin queries ----

export async function getAdminPatternsPage({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PagedResult<SewingPattern>> {
  const admin = createSupabaseAdminClient();
  page = Math.max(page, 1);
  limit = Math.min(Math.max(limit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("sewing_patterns")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count } = await query;
  const total = count ?? 0;

  return {
    items: (data ?? []) as SewingPattern[],
    total,
    page,
    limit,
    pageCount: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getAdminPatternById(
  id: string,
): Promise<SewingPattern | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("sewing_patterns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as SewingPattern | null;
}

// ---- Public queries ----

export type SubgroupWithPatterns = {
  name: string;
  patterns: SewingPattern[];
};

export type CategoryWithSubgroups = {
  name: string;
  subgroups: SubgroupWithPatterns[];
};

export type GroupedPatterns = {
  categories: CategoryWithSubgroups[];
  total: number;
};

export async function getPublicPatternsGrouped(): Promise<GroupedPatterns> {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("sewing_patterns")
    .select("id, title, description, category, subgroup, difficulty, file_path, image_path, file_size_bytes, status")
    .eq("status", "publicado")
    .order("title", { ascending: true })
    .limit(500);

  const all = (data ?? []) as SewingPattern[];
  const byCategory = new Map<string, Map<string, SewingPattern[]>>();

  for (const pattern of all) {
    const cat = pattern.category ?? "Otro";
    const sub = pattern.subgroup ?? "Sin grupo";
    if (!byCategory.has(cat)) byCategory.set(cat, new Map());
    const subMap = byCategory.get(cat)!;
    if (!subMap.has(sub)) subMap.set(sub, []);
    subMap.get(sub)!.push(pattern);
  }

  const visibleCategories = [...PATTERN_CATEGORIES].filter(
    (c) => c !== "Hogar / decoración" && c !== "Mascarillas / protección",
  );

  const categories = visibleCategories
    .filter((c) => byCategory.has(c))
    .map((name) => ({
      name,
      subgroups: Array.from(byCategory.get(name)!.entries()).map(
        ([subName, patterns]) => ({
          name: subName,
          patterns,
        }),
      ),
    }));

  return { categories, total: all.length };
}

export function getPatternDownloadUrl(filePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${PATTERN_BUCKET}/${filePath}`;
}

export function getPatternImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${PATTERN_BUCKET}/${imagePath}`;
}
