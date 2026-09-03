import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SERVICE ROLE key — this bypasses
// Row Level Security entirely, so this file must never be imported from
// anything that runs in the browser (no "use client" component, no
// client-side hook). It's used by app/api/upload/route.ts, which is a
// server-side route handler that already gates access with requireAdmin()
// before this client is ever touched.
//
// Do not reuse this for reading/writing the Postgres tables — Prisma
// (lib/prisma.ts) is the source of truth for that. This client exists only
// for Supabase Storage (file uploads), which Prisma doesn't cover.

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// Bucket used for all food/category photos uploaded via the admin panel.
// Created manually in the Supabase dashboard — see
// docs/PHASE-5-IMAGE-UPLOADS-SETUP.md.
export const FOOD_IMAGES_BUCKET = "food-images";
