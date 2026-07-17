import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const ENV_FILE = ".env.migration.local";

function loadEnv(path) {
  const env = {};
  const content = readFileSync(path, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }

  return env;
}

const env = loadEnv(ENV_FILE);

const oldUrl = env.OLD_SUPABASE_URL;
const oldKey = env.OLD_SUPABASE_SERVICE_ROLE_KEY;
const newUrl = env.NEW_SUPABASE_URL || env.SUPABASE_URL;
const newKey = env.NEW_SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY || env.NEW_SUPABASE_SERVICE_ROLE_KEY;

if (!oldUrl || !oldKey || !newUrl || !newKey) {
  throw new Error(
    "Missing migration env vars. Required: OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_URL/SUPABASE_SECRET_KEY for the new project.",
  );
}

const oldClient = createClient(oldUrl, oldKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const newClient = createClient(newUrl, newKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tablePlans = [
  {
    table: "workshops",
    columns: [
      "id",
      "name",
      "slug",
      "responsible_name",
      "email",
      "phone",
      "whatsapp",
      "instagram",
      "state",
      "city",
      "municipality",
      "public_location",
      "description",
      "what_they_do",
      "initial_photo_path",
      "avatar_path",
      "identity_document",
      "public_name_allowed",
      "public_location_allowed",
      "public_instagram_allowed",
      "public_whatsapp_allowed",
      "status",
      "admin_notes",
      "approved_at",
      "rejected_at",
      "created_at",
      "updated_at",
    ],
    transform(row) {
      return { ...row, user_id: null, approved_by: null };
    },
  },
  {
    table: "workshop_needs",
    columns: [
      "id",
      "workshop_id",
      "title",
      "description",
      "requested_items",
      "urgency",
      "status",
      "admin_notes",
      "published_at",
      "closed_at",
      "created_at",
      "updated_at",
    ],
  },
  {
    table: "workshop_photos",
    columns: [
      "id",
      "workshop_id",
      "title",
      "description",
      "storage_path",
      "status",
      "reviewed_at",
      "created_at",
      "updated_at",
    ],
    transform(row) {
      return { ...row, uploaded_by: null, reviewed_by: null };
    },
  },
  {
    table: "workshop_help_offers",
    columns: [
      "id",
      "workshop_id",
      "need_id",
      "donor_name",
      "donor_contact",
      "donor_email",
      "donor_phone",
      "help_type",
      "description",
      "quantity",
      "availability",
      "location",
      "status",
      "admin_notes",
      "created_at",
      "updated_at",
    ],
  },
  {
    table: "sewing_patterns",
    columns: [
      "id",
      "title",
      "description",
      "difficulty",
      "category",
      "subgroup",
      "file_path",
      "file_size_bytes",
      "image_path",
      "status",
      "created_at",
      "updated_at",
    ],
    transform(row) {
      return { ...row, created_by_user_id: null };
    },
  },
  {
    table: "cartuchera_donations",
    columns: ["id", "donor_name", "donor_email", "donor_phone", "help_type", "description", "quantity", "created_at"],
  },
  {
    table: "workshop_volunteers",
    columns: ["id", "workshop_id", "name", "role", "phone", "instagram", "created_at"],
  },
];

const buckets = ["workshop-photos", "sewing-patterns"];

function selectList(columns) {
  return [...new Set(columns)].join(",");
}

async function fetchAll(table, columns) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];

  while (true) {
    const { data, error } = await oldClient
      .from(table)
      .select(selectList(columns))
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function upsertRows(table, rows) {
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await newClient.from(table).upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function migrateTable(plan) {
  const columns = [...plan.columns];
  const rows = await fetchAll(plan.table, columns);
  const transformed = plan.transform ? rows.map((row) => plan.transform(row)) : rows;

  if (transformed.length > 0) {
    await upsertRows(plan.table, transformed);
  }

  console.log(`${plan.table}: ${transformed.length} rows`);
}

async function listObjectsRecursive(client, bucket, prefix = "") {
  const entries = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      if (error.message.toLowerCase().includes("not found")) return entries;
      throw new Error(`${bucket}: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        entries.push(...await listObjectsRecursive(client, bucket, path));
      } else {
        entries.push(path);
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return entries;
}

async function migrateBucket(bucket) {
  const paths = await listObjectsRecursive(oldClient, bucket);
  let copied = 0;

  for (const path of paths) {
    const { data: blob, error: downloadError } = await oldClient.storage.from(bucket).download(path);
    if (downloadError) throw new Error(`${bucket}/${path}: ${downloadError.message}`);

    const { error: uploadError } = await newClient.storage.from(bucket).upload(path, blob, {
      upsert: true,
      contentType: blob.type || undefined,
    });

    if (uploadError) throw new Error(`${bucket}/${path}: ${uploadError.message}`);
    copied += 1;
  }

  console.log(`${bucket}: ${copied} objects`);
}

async function main() {
  console.log("Migrating Promoda tables...");
  for (const plan of tablePlans) {
    await migrateTable(plan);
  }

  console.log("Migrating storage buckets...");
  for (const bucket of buckets) {
    await migrateBucket(bucket);
  }

  console.log("Migration completed. Auth users, user_workshops, and activation tokens were intentionally not migrated.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
