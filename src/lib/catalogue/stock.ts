/**
 * Stock rules, shared by the shop, the bag and the admin dashboard.
 * Safe to use in the browser.
 *
 * A size's stock is a number of bottles, or null while the supplier hasn't
 * confirmed it. Unconfirmed sizes can still be added to the bag (as before);
 * sizes at 0 are sold out and can't be.
 */

/** At or below this many bottles, a size counts as low stock. */
export const LOW_STOCK = 3;

/** Most bottles of one size a single bag line can hold. */
export const MAX_PER_LINE = 99;

export type Availability = "unconfirmed" | "in-stock" | "low" | "sold-out";

export function sizeAvailability(stock: number | null | undefined): Availability {
  if (stock === null || stock === undefined) return "unconfirmed";
  if (stock <= 0) return "sold-out";
  if (stock <= LOW_STOCK) return "low";
  return "in-stock";
}

/** The most of one size someone may put in their bag. */
export function maxQuantity(stock: number | null | undefined): number {
  return stock === null || stock === undefined ? MAX_PER_LINE : Math.max(0, Math.min(MAX_PER_LINE, stock));
}

/** Whole-fragrance availability: sold out only when every size is. */
export function productAvailability(variants: { stock?: number | null }[]): Availability {
  const states = variants.map((variant) => sizeAvailability(variant.stock));
  if (states.length > 0 && states.every((state) => state === "sold-out")) return "sold-out";
  if (states.includes("in-stock")) return "in-stock";
  if (states.includes("low")) return "low";
  return "unconfirmed";
}

/** schema.org availability for a product's offers (search results). */
export function schemaAvailability(variants: { stock?: number | null }[]): string {
  const states = variants.map((variant) => sizeAvailability(variant.stock));
  const kind = states.includes("unconfirmed")
    ? "PreOrder"
    : states.includes("in-stock")
      ? "InStock"
      : states.every((state) => state === "sold-out")
        ? "OutOfStock"
        : "LimitedAvailability";
  return `https://schema.org/${kind}`;
}

/** Short wording for one size. */
export function availabilityLabel(stock: number | null | undefined): string {
  switch (sizeAvailability(stock)) {
    case "sold-out":
      return "Sold out";
    case "low":
      return `Only ${stock} left`;
    case "in-stock":
      return "In stock";
    default:
      return "Stock being confirmed";
  }
}
