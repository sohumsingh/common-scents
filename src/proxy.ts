import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/lib/catalogue/products";
import { occasions } from "@/lib/catalogue/occasions";

/**
 * Real 404s for unknown product and collection addresses.
 *
 * Product and collection pages stream (so navigation feels instant), and a
 * page that has started streaming can no longer change its HTTP status. This
 * proxy runs before rendering: an address that is not in the catalogue is
 * rewritten to an unmatched internal path, which Next.js answers with the
 * site's "not found" page and a genuine 404 status.
 *
 * The valid addresses come from the seed catalogue. When products move to a
 * database, replace these sets with a fast lookup (or a cached slug list).
 */

const productSlugs = new Set<string>(products.map((product) => product.slug));
const collectionSlugs = new Set<string>(occasions.map((occasion) => occasion.slug));

export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const known = section === "shop" ? productSlugs.has(slug) : collectionSlugs.has(slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__not-found", request.url));
}

export const config = {
  matcher: ["/shop/:slug", "/collections/:slug"],
};
