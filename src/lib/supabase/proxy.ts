import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the visitor's login session (if any) on each request, and hands
 * the refreshed cookies both to the page being rendered and to the browser.
 * Returns the response to continue with, carrying those cookies.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([header, value]) => response.headers.set(header, value));
      },
    },
  });

  // Nothing may run between creating the client and this call: it refreshes
  // an expiring session, and skipping it can sign people out at random.
  await supabase.auth.getClaims();

  return response;
}
