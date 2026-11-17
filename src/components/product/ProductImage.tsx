import { Bottle } from "./Bottle";
import type { Product } from "@/lib/types";

/**
 * The product's image for cards and listings: the photo on its colour wash
 * (or the illustrated bottle when there is no photo).
 *
 * `morph` names the bottle so it glides into the product page. Only enable it
 * where each product appears once on the page — duplicate names cancel the
 * transition.
 */
export function ProductImage({
  product,
  className = "",
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  priority = false,
  morph = false,
}: {
  product: Product;
  className?: string;
  sizes?: string;
  priority?: boolean;
  morph?: boolean;
}) {
  return (
    <Bottle
      item={product}
      sizes={sizes}
      priority={priority}
      inset="9% 14% 7%"
      morph={morph ? `bottle-${product.slug}` : undefined}
      className={className}
    />
  );
}
