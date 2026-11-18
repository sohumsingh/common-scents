import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { formatSizes, formatZAR, lowestPrice } from "@/lib/format";
import { occasionBySlug } from "@/lib/catalogue/occasions";
import { getDefaultVariant } from "@/lib/catalogue/variants";
import { getProductBadge } from "@/lib/catalogue/service";
import { productAvailability } from "@/lib/catalogue/stock";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
  showAddToCart = true,
  className = "",
  morph = false,
  imageClassName = "aspect-[4/5]",
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  showAddToCart?: boolean;
  className?: string;
  /** Let the bottle glide into the product page (only where it appears once). */
  morph?: boolean;
  /** Sizing for the image area (defaults to a 4:5 frame). */
  imageClassName?: string;
  /** Hide the occasion tags, for tight layouts such as the home page. */
  compact?: boolean;
}) {
  const occasions = product.occasions
    .map((slug) => occasionBySlug.get(slug))
    .filter((occasion): occasion is NonNullable<typeof occasion> => Boolean(occasion));
  const hasSizeChoice = product.variants.length > 1;
  const hasPriceRange = new Set(product.variants.map((variant) => variant.priceZAR)).size > 1;
  const soldOut = productAvailability(product.variants) === "sold-out";
  const badge = soldOut ? "Sold out" : getProductBadge(product);

  return (
    <article
      className={`group relative flex flex-col border border-line bg-paper transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_30px_60px_-38px_rgba(41,39,37,0.5)] ${className}`}
    >
      <Link
        href={`/shop/${product.slug}`}
        className={`relative block overflow-hidden ${imageClassName}`}
        aria-label={`${product.brand} ${product.fullName} — view product`}
      >
        <div className="absolute inset-0 transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]">
          <ProductImage product={product} priority={priority} morph={morph} />
        </div>

        {badge ? (
          <span className="absolute left-4 top-4 z-10">
            <Badge tone={soldOut ? "neutral" : "gold"}>{badge}</Badge>
          </span>
        ) : null}

        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-full bg-noir/90 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-ivory backdrop-blur-sm transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-y-0">
          View Fragrance
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{product.brand}</p>
          <h3 className="mt-1.5 font-display text-[1.45rem] leading-tight text-charcoal">
            <Link href={`/shop/${product.slug}`} className="transition-colors duration-200 hover:text-gold-deep">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[11px] text-muted">{product.concentration}</p>
        </div>

        <p className={`text-[13px] leading-relaxed text-stone ${compact ? "line-clamp-2 [@media(max-height:46rem)]:hidden" : ""}`}>
          {product.shortDescription}
        </p>

        {occasions.length > 0 && !compact ? (
          <ul className="flex flex-wrap gap-1.5">
            {occasions.map((occasion) => (
              <li key={occasion.slug}>
                <Link
                  href={`/collections/${occasion.slug}`}
                  className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-stone transition-colors hover:border-charcoal/30 hover:text-charcoal"
                >
                  {occasion.shortName}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            {hasPriceRange ? (
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-muted">From</p>
            ) : null}
            <p className="whitespace-nowrap font-display text-[1.4rem] leading-none tabular-nums text-charcoal">
              {formatZAR(lowestPrice(product.variants))}
            </p>
            <p className="mt-1.5 whitespace-nowrap text-[11px] tabular-nums text-stone">
              {formatSizes(product.variants)}
            </p>
            {product.pricingStatus === "indicative" ? (
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">
                Indicative price
              </p>
            ) : null}
          </div>

          {showAddToCart && hasSizeChoice ? (
            // Several sizes: send the customer to choose one rather than
            // silently adding a size the "From" price does not describe.
            <Link
              href={`/shop/${product.slug}`}
              aria-label={`Choose a size of ${product.fullName}`}
              className="whitespace-nowrap border border-charcoal/25 px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Choose size
            </Link>
          ) : showAddToCart ? (
            <AddToCartButton
              product={product}
              variantId={getDefaultVariant(product).id}
              disabled={soldOut}
              label={soldOut ? "Sold out" : undefined}
              className="whitespace-nowrap border border-charcoal/25 px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
