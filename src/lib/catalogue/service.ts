import { brands, brandBySlug } from "./brands";
import { occasionBySlug, occasions } from "./occasions";
import { products } from "./products";
import type {
  Brand,
  CartLine,
  Occasion,
  OccasionSlug,
  Product,
  ProductImage,
  ProductWithOccasions,
} from "../types";
import { lowestPrice } from "../format";
import { buildSearchText } from "./search";
import { getFinderProfile, type CharacterKey, type IntensityKey } from "./finder-profile";

/**
 * ---------------------------------------------------------------------------
 * CATALOGUE SERVICE
 * ---------------------------------------------------------------------------
 *
 * The single access point for catalogue data. Components and pages never
 * import the raw `products` array directly — they go through this module.
 *
 * The functions are `async` on purpose. The seed catalogue is local, but the
 * moment PostgreSQL is connected (via Prisma or Drizzle) the bodies below
 * become database queries and no calling code has to change.
 *
 * Example of the future swap:
 *
 *   export async function listProducts(): Promise<Product[]> {
 *     const rows = await db.product.findMany({ include: { notes: true } });
 *     return rows.map(toProduct);
 *   }
 */

export type PriceBucket = {
  id: string;
  label: string;
  min: number;
  max: number;
};

/** Fixed price bands used by the price filter. */
export const priceBuckets: PriceBucket[] = [
  { id: "under-500", label: "Under R500", min: 0, max: 499 },
  { id: "500-999", label: "R500 – R999", min: 500, max: 999 },
  { id: "1000-1499", label: "R1 000 – R1 499", min: 1000, max: 1499 },
  { id: "1500-1999", label: "R1 500 – R1 999", min: 1500, max: 1999 },
  { id: "2000-plus", label: "R2 000 and above", min: 2000, max: Number.POSITIVE_INFINITY },
];

export async function listProducts(): Promise<Product[]> {
  return [...products];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
}

export async function listOccasions(): Promise<Occasion[]> {
  return [...occasions].sort((a, b) => a.order - b.order);
}

export async function getOccasion(slug: string): Promise<Occasion | undefined> {
  return occasionBySlug.get(slug as OccasionSlug);
}

export async function listBrands(): Promise<Brand[]> {
  return [...brands];
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  return brandBySlug.get(slug);
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
  return products.map(withOccasions);
}

export async function getProductsByOccasion(slug: OccasionSlug): Promise<Product[]> {
  return products.filter((product) => product.occasions.includes(slug));
}

/** The "Featured Fragrances" selection on the homepage. */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const badged = products.filter((product) => product.editorialBadge);
  const rest = products
    .filter((product) => !product.editorialBadge)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  return [...badged, ...rest].slice(0, limit);
}

/**
 * "Trending Now" is a *curated* selection. Real popularity data arrives
 * with the commerce backend; until then this is explicitly editorial.
 */
export async function getCuratedTrending(limit = 4): Promise<Product[]> {
  const curated = [
    "lattafa-khamrah-edp",
    "afnan-9pm-edp",
    "ysl-black-opium-edp",
    "armaf-cdnim-edt",
    "dior-sauvage-edp",
    "versace-eros-edp",
  ];
  return curated
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
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

/** Brands that actually appear in the catalogue, ordered by name. */
export async function listCatalogueBrands(): Promise<Brand[]> {
  const used = new Set(products.map((product) => product.brandSlug));
  return brands.filter((brand) => used.has(brand.slug));
}

/** The overall price range of the catalogue, used for filter scale hints. */
export async function getCataloguePriceRange(): Promise<{ min: number; max: number }> {
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

/**
 * "New In" is worked out from the dates products were added, never typed in
 * by hand, so it always points at the genuinely newest fragrances.
 */
const NEW_ARRIVAL_COUNT = 3;
const newArrivalIds = new Set(
  [...products]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, NEW_ARRIVAL_COUNT)
    .map((product) => product.id),
);

/** The label shown on a product: an editorial pick first, then "New In". */
export function getProductBadge(product: Product): string | undefined {
  if (product.editorialBadge) return product.editorialBadge;
  return newArrivalIds.has(product.id) ? "New In" : undefined;
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
  return products.map((product) => ({
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    fullName: product.fullName,
    occasions: product.occasions,
    ...getFinderProfile(product.id),
    shortDescription: product.shortDescription,
    priceZAR: product.priceZAR,
    variants: product.variants.map(({ size, priceZAR }) => ({ size, priceZAR })),
    visual: product.visual,
    image: product.image,
  }));
}
