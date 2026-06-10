import { createClient } from "@supabase/supabase-js";

// Server-only admin client (service-role key). Never import this into a
// "use client" component. Reused across the AgentPostmortem Supabase project;
// Tracecase owns the tc_* tables.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Ingest auth: CI posts runs with this shared token in the x-tracecase-token header.
export function checkIngestToken(token: string | null): boolean {
  const expected = process.env.TRACECASE_INGEST_TOKEN;
  return !!expected && token === expected;
}
