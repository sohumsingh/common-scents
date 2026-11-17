import { occasionBySlug } from "./occasions";
import type { OccasionSlug, Product } from "../types";

/**
 * The single definition of what a search matches.
 *
 * Both the header search overlay (in the browser) and the /search page (on
 * the server) use these helpers, so a query always finds the same fragrances
 * in both places. Free of catalogue imports so it is safe in the browser.
 */

type Searchable = Pick<
  Product,
  "brand" | "name" | "fullName" | "concentration" | "shortDescription" | "character" | "notes"
> & { occasions: OccasionSlug[] };

/** Everything a customer might type to find a fragrance, lower-cased once. */
export function buildSearchText(product: Searchable): string {
  return [
    product.brand,
    product.name,
    product.fullName,
    product.concentration,
    product.shortDescription,
    product.character.join(" "),
    product.notes.top.join(" "),
    product.notes.heart.join(" "),
    product.notes.base.join(" "),
    product.occasions.map((slug) => occasionBySlug.get(slug)?.name ?? "").join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

/** Every word of the query must appear somewhere in the search text. */
export function matchesSearchText(searchText: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => searchText.includes(term));
}
