import type { Product, ProductVariant } from "../types";

/**
 * Pure variant helpers.
 *
 * Kept apart from `service.ts` on purpose: the service imports the whole
 * catalogue, so a browser component importing from it would ship every
 * product to the customer's device. These helpers are safe anywhere.
 */

/** The size preselected on a product page: the one matching the list price. */
export function getDefaultVariant(product: Product): ProductVariant {
  return (
    product.variants.find((variant) => variant.priceZAR === product.priceZAR) ??
    product.variants[0]
  );
}
