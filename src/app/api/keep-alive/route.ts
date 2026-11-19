import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Keeps the database awake.
 *
 * Supabase pauses free projects after about a week without activity, which
 * would take the live demo offline. A Vercel Cron Job (see vercel.json) calls
 * this once a day; it runs one tiny read so the project counts as active.
 *
 * Only Vercel's scheduler can trigger it: Vercel sends the project's
 * CRON_SECRET as a bearer token, and anything else gets a 401.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const started = Date.now();
  const response = await fetch(`${supabaseUrl()}/rest/v1/products?select=id&limit=1`, {
    headers: { apikey: supabaseKey(), Authorization: `Bearer ${supabaseKey()}` },
    cache: "no-store",
  });

  return Response.json(
    { ok: response.ok, database: response.status, ms: Date.now() - started, at: new Date().toISOString() },
    { status: response.ok ? 200 : 502 },
  );
}
