import type { Product, ProductVariant } from "../types";

/**
 * Pure variant helpers.
 *
 * Kept apart from `service.ts` on purpose: the service imports the whole
 * catalogue, so a browser component importing from it would ship every
 * product to the customer's device. These helpers are safe anywhere.
 */

/**
 * The size preselected on a product page: the one matching the list price,
 * unless it's sold out and another size isn't.
 */
export function getDefaultVariant(product: Product): ProductVariant {
  const listed = product.variants.find((variant) => variant.priceZAR === product.priceZAR) ?? product.variants[0];
  if (listed && listed.stock !== 0) return listed;
  return product.variants.find((variant) => variant.stock !== 0) ?? listed;
}
