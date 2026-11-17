import { priceBuckets } from "./price-buckets";
import { buildSearchText, matchesSearchText } from "./search";
import { lowestPrice } from "../format";
import type { CatalogueFilters, Gender, OccasionSlug, Product, SortKey } from "../types";

/**
 * Pure query helpers shared by the shop page, collection pages and the
 * search page. Keeping them free of React and of the data source means they
 * can be unit tested and reused by a future search API.
 */

export const SORT_OPTIONS: { value: SortKey; label: string; disabled?: boolean; note?: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  {
    value: "popularity",
    label: "Popularity",
    disabled: true,
    note: "Popularity sorting unlocks once live sales data is connected.",
  },
];

export const GENDER_FILTERS: { value: Gender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Read filters out of a URL search param object. */
export function parseFilters(params: RawSearchParams): CatalogueFilters {
  return {
    occasions: toArray(params.occasion) as OccasionSlug[],
    brands: toArray(params.brand),
    genders: toArray(params.gender) as Gender[],
    priceBuckets: toArray(params.price),
    query: typeof params.q === "string" ? params.q.trim() : "",
  };
}

export function parseSort(params: RawSearchParams): SortKey {
  const sort = typeof params.sort === "string" ? params.sort : "featured";
  const known = SORT_OPTIONS.find((option) => option.value === sort);
  if (!known || known.disabled) return "featured";
  return known.value;
}

/** Same rule as the header search overlay — see ./search.ts. */
export function matchesQuery(product: Product, query: string): boolean {
  if (!query.trim()) return true;
  return matchesSearchText(buildSearchText(product), query);
}

/**
 * A fragrance is in a price band when any of its bottle sizes is — so a
 * customer filtering "R500 – R999" sees Sauvage, because its 50 ml fits.
 */
export function matchesPriceBucket(product: Product, bucketIds: string[]): boolean {
  if (bucketIds.length === 0) return true;
  return bucketIds.some((id) => {
    const bucket = priceBuckets.find((candidate) => candidate.id === id);
    if (!bucket) return true;
    return product.variants.some(
      (variant) => variant.priceZAR >= bucket.min && variant.priceZAR <= bucket.max,
    );
  });
}

export function applyFilters(products: Product[], filters: CatalogueFilters): Product[] {
  return products.filter((product) => {
    if (filters.occasions.length > 0) {
      const matchesOccasion = filters.occasions.some((occasion) =>
        product.occasions.includes(occasion),
      );
      if (!matchesOccasion) return false;
    }
    if (filters.brands.length > 0 && !filters.brands.includes(product.brandSlug)) return false;
    if (filters.genders.length > 0 && !filters.genders.includes(product.gender)) return false;
    if (!matchesPriceBucket(product, filters.priceBuckets)) return false;
    if (!matchesQuery(product, filters.query)) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    // Sort by the "From" price shown on each card, so the order matches
    // what the customer reads.
    case "price-asc":
      return sorted.sort((a, b) => lowestPrice(a.variants) - lowestPrice(b.variants));
    case "price-desc":
      return sorted.sort((a, b) => lowestPrice(b.variants) - lowestPrice(a.variants));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
    case "popularity":
      // No reliable sales data exists yet, so this falls back to the
      // curated ordering rather than pretending to rank by popularity.
      return sorted;
    case "featured":
    default:
      return sorted.sort((a, b) => {
        const aBadge = a.editorialBadge ? 0 : 1;
        const bBadge = b.editorialBadge ? 0 : 1;
        if (aBadge !== bBadge) return aBadge - bBadge;
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }
}

export function countActiveFilters(filters: CatalogueFilters): number {
  return (
    filters.occasions.length +
    filters.brands.length +
    filters.genders.length +
    filters.priceBuckets.length +
    (filters.query ? 1 : 0)
  );
}

export type FacetCounts = {
  occasions: Record<string, number>;
  brands: Record<string, number>;
  genders: Record<string, number>;
  priceBuckets: Record<string, number>;
};

/**
 * Counts for each facet value.
 *
 * Follows the standard faceted-search model: values within one facet are
 * OR-ed together, facets are AND-ed together. A value's count is therefore
 * "how many results would I get if I selected this", computed while the
 * other facets' filters stay applied.
 */
export function computeFacetCounts(
  products: Product[],
  filters: CatalogueFilters,
): FacetCounts {
  const counts: FacetCounts = {
    occasions: {},
    brands: {},
    genders: {},
    priceBuckets: {},
  };

  const matchesOccasions = (product: Product, pool: OccasionSlug[]) =>
    pool.length === 0 || pool.some((occasion) => product.occasions.includes(occasion));

  const matchesBrands = (product: Product, pool: string[]) =>
    pool.length === 0 || pool.includes(product.brandSlug);

  const matchesGenders = (product: Product, pool: Gender[]) =>
    pool.length === 0 || pool.includes(product.gender);

  const matchesPrices = (product: Product, pool: string[]) =>
    pool.length === 0 || matchesPriceBucket(product, pool);

  const matchesQueryText = (product: Product) => matchesQuery(product, filters.query);

  for (const occasion of ALL_OCCASION_SLUGS) {
    counts.occasions[occasion] = products.filter(
      (product) =>
        product.occasions.includes(occasion) &&
        matchesBrands(product, filters.brands) &&
        matchesGenders(product, filters.genders) &&
        matchesPrices(product, filters.priceBuckets) &&
        matchesQueryText(product),
    ).length;
  }

  for (const brand of allBrandSlugs(products)) {
    counts.brands[brand] = products.filter(
      (product) =>
        product.brandSlug === brand &&
        matchesOccasions(product, filters.occasions) &&
        matchesGenders(product, filters.genders) &&
        matchesPrices(product, filters.priceBuckets) &&
        matchesQueryText(product),
    ).length;
  }

  for (const gender of ALL_GENDERS) {
    counts.genders[gender] = products.filter(
      (product) =>
        product.gender === gender &&
        matchesOccasions(product, filters.occasions) &&
        matchesBrands(product, filters.brands) &&
        matchesPrices(product, filters.priceBuckets) &&
        matchesQueryText(product),
    ).length;
  }

  for (const bucket of priceBuckets) {
    counts.priceBuckets[bucket.id] = products.filter(
      (product) =>
        matchesPriceBucket(product, [bucket.id]) &&
        matchesOccasions(product, filters.occasions) &&
        matchesBrands(product, filters.brands) &&
        matchesGenders(product, filters.genders) &&
        matchesQueryText(product),
    ).length;
  }

  return counts;
}

const ALL_OCCASION_SLUGS: OccasionSlug[] = [
  "daily-wear",
  "date-night",
  "special-occasion",
  "gym-and-active",
  "office-wear",
];

const ALL_GENDERS: Gender[] = ["men", "women", "unisex"];

function allBrandSlugs(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.brandSlug))];
}

/** Serialise filters back into a URL query string. */
export function buildQueryString(
  filters: CatalogueFilters,
  sort: SortKey,
  base: Record<string, string> = {},
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(base)) {
    if (value) params.set(key, value);
  }
  if (filters.occasions.length) params.set("occasion", filters.occasions.join(","));
  if (filters.brands.length) params.set("brand", filters.brands.join(","));
  if (filters.genders.length) params.set("gender", filters.genders.join(","));
  if (filters.priceBuckets.length) params.set("price", filters.priceBuckets.join(","));
  if (filters.query) params.set("q", filters.query);
  if (sort !== "featured") params.set("sort", sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Toggle a value inside a multi-select facet. */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Human-readable summary of the active filters, used for the chips row. */
export function describeFilters(
  filters: CatalogueFilters,
  occasionNames: Map<string, string>,
  brandNames: Map<string, string>,
  bucketNames: Map<string, string>,
  genderNames: Map<string, string>,
): { key: string; label: string; value: string }[] {
  const chips: { key: string; label: string; value: string }[] = [];

  for (const occasion of filters.occasions) {
    chips.push({ key: `occasion:${occasion}`, label: "Occasion", value: occasionNames.get(occasion) ?? occasion });
  }
  for (const brand of filters.brands) {
    chips.push({ key: `brand:${brand}`, label: "Brand", value: brandNames.get(brand) ?? brand });
  }
  for (const gender of filters.genders) {
    chips.push({ key: `gender:${gender}`, label: "For", value: genderNames.get(gender) ?? gender });
  }
  for (const bucket of filters.priceBuckets) {
    chips.push({ key: `price:${bucket}`, label: "Price", value: bucketNames.get(bucket) ?? bucket });
  }
  if (filters.query) {
    chips.push({ key: "query", label: "Search", value: `“${filters.query}”` });
  }
  return chips;
}
