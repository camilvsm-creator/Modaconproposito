"use client";

import { createClient } from "@supabase/supabase-js";

import { INSPECTION_PHOTO_BUCKET, INSPECTOR_VERIFICATION_BUCKET, PHOTO_BUCKET } from "@/lib/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getBucket(bucket: "photos" | "inspections" | "verification") {
  if (bucket === "inspections") return INSPECTION_PHOTO_BUCKET;
  if (bucket === "verification") return INSPECTOR_VERIFICATION_BUCKET;
  return PHOTO_BUCKET;
}

async function uploadFile(file: File, bucket: "photos" | "inspections" | "verification", pathPrefix?: string): Promise<string> {
  const ext = file.name.split(".").pop() || (file.type.startsWith("video/") ? "mp4" : "jpg");
  const basePath = pathPrefix?.trim() ? `${pathPrefix.replace(/^\/+|\/+$/g, "")}/` : "client/";
  const storagePath = `${basePath}${self.crypto.randomUUID()}.${ext}`;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.storage
    .from(getBucket(bucket))
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`No pudimos subir ${file.name}. Intenta nuevamente.`);
  }

  return storagePath;
}

export async function uploadFiles(
  files: File[],
  bucket: "photos" | "inspections" | "verification",
  pathPrefix?: string,
): Promise<string[]> {
  const paths: string[] = [];

  for (const file of files) {
    const path = await uploadFile(file, bucket, pathPrefix);
    paths.push(path);
  }

  return paths;
}
