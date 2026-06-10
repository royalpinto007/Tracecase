import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext -> Cloudflare Workers config. No ISR cache needed yet (all pages are
// dynamic, reading live from Supabase), so we keep the default in-memory cache.
export default defineCloudflareConfig({});
