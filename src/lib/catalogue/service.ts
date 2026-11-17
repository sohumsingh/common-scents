import "server-only";
import { occasionBySlug, occasions } from "./occasions";
import { loadCatalogue } from "./db";
import type {
  Brand,
  CartLine,
  CharacterKey,
  IntensityKey,
  Occasion,
  OccasionSlug,
  Product,
  ProductImage,
  ProductWithOccasions,
} from "../types";
import { lowestPrice } from "../format";
import { buildSearchText } from "./search";

/**
 * ---------------------------------------------------------------------------
 * CATALOGUE SERVICE
 * ---------------------------------------------------------------------------
 *
 * The single access point for catalogue data. Pages and server components go
 * through this module; none of them talk to the database directly.
 *
 * Products and brands come from Supabase (see db.ts), loaded once per cache
 * window and shared by every function below. The five occasions are part of
 * the site's structure (their slugs are routes and types), so they live in
 * code (occasions.ts); the database holds a matching copy.
 */

export { priceBuckets, type PriceBucket } from "./price-buckets";

export async function listProducts(): Promise<Product[]> {
  const { products } = await loadCatalogue();
  return [...products];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { products } = await loadCatalogue();
  return products.find((product) => product.slug === slug);
}

export async function listOccasions(): Promise<Occasion[]> {
  return [...occasions].sort((a, b) => a.order - b.order);
}

export async function getOccasion(slug: string): Promise<Occasion | undefined> {
  return occasionBySlug.get(slug as OccasionSlug);
}

export async function listBrands(): Promise<Brand[]> {
  const { brands } = await loadCatalogue();
  return [...brands];
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  const { brands } = await loadCatalogue();
  return brands.find((brand) => brand.slug === slug);
}

/** Attach the resolved occasion objects to a product. */
export function withOccasions(product: Product): ProductWithOccasions {
  return {
    ...product,
    occasionList: product.occasions
      .map((slug) => occasionBySlug.get(slug))
      .filter((occasion): occasion is Occasion => Boolean(occasion)),
  };
}

export async function listProductsWithOccasions(): Promise<ProductWithOccasions[]> {
  const { products } = await loadCatalogue();
  return products.map(withOccasions);
}

export async function getProductsByOccasion(slug: OccasionSlug): Promise<Product[]> {
  const { products } = await loadCatalogue();
  return products.filter((product) => product.occasions.includes(slug));
}

/** The "Featured Fragrances" selection on the homepage. */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await loadCatalogue();
  const badged = products.filter((product) => product.editorialBadge);
  const rest = products
    .filter((product) => !product.editorialBadge)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  return [...badged, ...rest].slice(0, limit);
}

/**
 * "Trending Now" is a *curated* selection, ordered by each product's
 * trending rank. Real popularity data arrives with orders; until then this
 * is explicitly editorial.
 */
export async function getCuratedTrending(limit = 4): Promise<Product[]> {
  const { products } = await loadCatalogue();
  return products
    .filter((product) => product.trendingRank !== undefined)
    .sort((a, b) => (a.trendingRank ?? 0) - (b.trendingRank ?? 0))
    .slice(0, limit);
}

/**
 * For each occasion a fragrance suits, the other fragrances for that same
 * occasion, closest in price first. Powers the "Also for …" comparison on
 * product pages, so customers compare like for like: same moment, similar
 * spend. Occasions with no other fragrances are left out.
 */
export async function getOccasionAlternatives(
  product: Product,
  limit = 4,
): Promise<{ occasion: Occasion; products: Product[] }[]> {
  const { products } = await loadCatalogue();
  const price = lowestPrice(product.variants);

  return product.occasions
    .map((slug) => {
      const occasion = occasionBySlug.get(slug);
      if (!occasion) return null;
      const alternatives = products
        .filter((candidate) => candidate.id !== product.id && candidate.occasions.includes(slug))
        .sort(
          (a, b) =>
            Math.abs(lowestPrice(a.variants) - price) - Math.abs(lowestPrice(b.variants) - price),
        )
        .slice(0, limit);
      return alternatives.length > 0 ? { occasion, products: alternatives } : null;
    })
    .filter((group): group is { occasion: Occasion; products: Product[] } => group !== null);
}

/** Brands that actually appear in the catalogue, in display order. */
export async function listCatalogueBrands(): Promise<Brand[]> {
  const { products, brands } = await loadCatalogue();
  const used = new Set(products.map((product) => product.brandSlug));
  return brands.filter((brand) => used.has(brand.slug));
}

/** The overall price range of the catalogue, used for filter scale hints. */
export async function getCataloguePriceRange(): Promise<{ min: number; max: number }> {
  const { products } = await loadCatalogue();
  const prices = products.flatMap((product) => product.variants.map((variant) => variant.priceZAR));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * Everything the bag needs to know about each purchasable size, keyed the
 * same way as bag lines (`productId::variantId`). Passed to the browser so a
 * saved bag is re-checked against the live catalogue: current prices and
 * names win, and discontinued sizes are dropped.
 */
export type CartCatalogue = Record<string, Omit<CartLine, "key" | "quantity">>;

export async function getCartCatalogue(): Promise<CartCatalogue> {
  const { products } = await loadCatalogue();
  const entries: CartCatalogue = {};
  for (const product of products) {
    for (const variant of product.variants) {
      entries[`${product.id}::${variant.id}`] = {
        productId: product.id,
        slug: product.slug,
        brand: product.brand,
        name: product.name,
        fullName: product.fullName,
        variantId: variant.id,
        variantLabel: variant.label,
        priceZAR: variant.priceZAR,
        visual: product.visual,
        image: product.image,
        occasions: product.occasions,
      };
    }
  }
  return entries;
}

/** The label shown on a product: an editorial pick first, then "New In" (set when the catalogue loads). */
export function getProductBadge(product: Product): string | undefined {
  return product.badge;
}

/** Re-exported for server code; browser components import from ./variants. */
export { getDefaultVariant } from "./variants";

/**
 * A trimmed projection of the catalogue used by the quick-search overlay.
 * Shipping only what the search needs keeps the client bundle small.
 */
export type SearchIndexEntry = {
  slug: string;
  brand: string;
  name: string;
  fullName: string;
  occasions: OccasionSlug[];
  character: string[];
  shortDescription: string;
  priceZAR: number;
  variants: { size: string; priceZAR: number }[];
  /** Pre-built text the overlay matches against (same rule as /search). */
  searchText: string;
  visual: Product["visual"];
  image?: ProductImage;
};

export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  const { products } = await loadCatalogue();
  return products.map((product) => ({
    variants: product.variants.map(({ size, priceZAR }) => ({ size, priceZAR })),
    searchText: buildSearchText(product),
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    fullName: product.fullName,
    occasions: product.occasions,
    character: product.character,
    shortDescription: product.shortDescription,
    priceZAR: product.priceZAR,
    visual: product.visual,
    image: product.image,
  }));
}

/**
 * Projection used by the signature-scent finder. It carries enough detail
 * to match and display a recommendation without shipping the full product
 * records to the browser.
 */
export type FinderEntry = {
  slug: string;
  brand: string;
  name: string;
  fullName: string;
  occasions: OccasionSlug[];
  /** The finder's character answers this fragrance satisfies (editorial). */
  characters: CharacterKey[];
  /** How strongly it comes across (editorial). */
  intensity: IntensityKey;
  shortDescription: string;
  priceZAR: number;
  /** Every bottle size and its price, so the finder can match a budget. */
  variants: { size: string; priceZAR: number }[];
  visual: Product["visual"];
  image?: ProductImage;
};

export async function getFinderCatalogue(): Promise<FinderEntry[]> {
  const { products } = await loadCatalogue();
  return products.map((product) => ({
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    fullName: product.fullName,
    occasions: product.occasions,
    characters: product.finder.characters,
    intensity: product.finder.intensity,
    shortDescription: product.shortDescription,
    priceZAR: product.priceZAR,
    variants: product.variants.map(({ size, priceZAR }) => ({ size, priceZAR })),
    visual: product.visual,
    image: product.image,
  }));
}
