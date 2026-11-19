import { NextResponse, type NextRequest } from "next/server";
import { occasions } from "@/lib/catalogue/occasions";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every page:
 *
 *  1. Refreshes the visitor's login session (lib/supabase/proxy.ts).
 *  2. Sends signed-out visitors to sign in before the admin area, checkout
 *     and order pages.
 *  3. Gives unknown product and collection addresses a real 404.
 *
 * Product and collection pages stream (so navigation feels instant), and a
 * page that has started streaming can no longer change its HTTP status. This
 * proxy runs before rendering: an address that is not in the catalogue is
 * rewritten to an unmatched internal path, which Next.js answers with the
 * site's "not found" page and a genuine 404 status.
 *
 * Product addresses come from the database (published products only) and are
 * remembered for a minute between checks. If the database can't be reached,
 * the request is let through and the page handles it, so an outage never
 * turns real products into 404s.
 */

const collectionSlugs = new Set<string>(occasions.map((occasion) => occasion.slug));

const SLUG_TTL_MS = 60_000;
let productSlugs: { set: Set<string>; fetchedAt: number } | null = null;

/** Re-check an unknown address at most this often, so newly added products work at once. */
const MISS_RECHECK_MS = 5_000;

async function loadProductSlugs(lookingFor?: string): Promise<Set<string> | null> {
  const age = productSlugs ? Date.now() - productSlugs.fetchedAt : Infinity;
  const fresh = age < SLUG_TTL_MS;
  const missing = lookingFor !== undefined && productSlugs !== null && !productSlugs.set.has(lookingFor);
  if (productSlugs && fresh && !(missing && age > MISS_RECHECK_MS)) return productSlugs.set;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const response = await fetch(`${url}/rest/v1/products?select=slug`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) return productSlugs?.set ?? null;
    const rows = (await response.json()) as { slug: string }[];
    productSlugs = { set: new Set(rows.map((row) => row.slug)), fetchedAt: Date.now() };
    return productSlugs.set;
  } catch {
    return productSlugs?.set ?? null;
  }
}

export async function proxy(request: NextRequest) {
  // Every page: keep the visitor's login session fresh.
  const { response: session, signedIn } = await updateSession(request);

  // Signed-in areas: signed-out visitors go to sign in before anything is sent.
  // (Admin rights themselves are checked by each admin page and action.)
  const { pathname } = request.nextUrl;
  if (!signedIn && (pathname.startsWith("/admin") || pathname === "/checkout" || pathname.startsWith("/account/orders"))) {
    const signInUrl = new URL("/account/sign-in", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    const toSignIn = NextResponse.redirect(signInUrl);
    session.cookies.getAll().forEach((cookie) => toSignIn.cookies.set(cookie));
    return toSignIn;
  }

  // Product and collection addresses: answer unknown ones with a real 404.
  const [, section, slug, extra] = request.nextUrl.pathname.split("/");
  if (extra !== undefined || !slug || (section !== "shop" && section !== "collections")) return session;

  if (section === "collections") {
    return collectionSlugs.has(slug) ? session : notFound(request, session);
  }

  const slugs = await loadProductSlugs(slug);
  if (!slugs || slugs.has(slug)) return session;
  return notFound(request, session);
}

/** Rewrite to the 404 page, keeping any refreshed session cookies. */
function notFound(request: NextRequest, session: NextResponse) {
  const response = NextResponse.rewrite(new URL("/__not-found", request.url));
  session.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export const config = {
  // Every page, but not Next.js build files, images or other static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images/|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
