import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/catalogue/ProductCard";
import {
  ActiveFilterChips,
  CatalogueControlsProvider,
  CatalogueToolbar,
  FilterSidebar,
  MobileFilters,
  type FacetGroup,
  type CatalogueState,
} from "@/components/catalogue/CatalogueControls";
import {
  applyFilters,
  computeFacetCounts,
  describeFilters,
  parseFilters,
  parseSort,
  sortProducts,
} from "@/lib/catalogue/query";
import { listCatalogueBrands, listProducts, listOccasions, priceBuckets } from "@/lib/catalogue/service";
import { GENDER_FILTERS, buildQueryString, countActiveFilters } from "@/lib/catalogue/query";
import { ResultsTrailRecorder } from "@/components/catalogue/ResultsTrail";
import { stagger } from "@/components/motion/stagger";
import type { CatalogueFilters, Gender, OccasionSlug } from "@/lib/types";

export type CataloguePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /** Path the filter controls navigate within, e.g. "/shop" or "/collections/daily-wear". */
  basePath: string;
  /** Params that are always preserved, e.g. a locked occasion. */
  baseParams?: Record<string, string>;
  /** Occasion locked to this collection. */
  lockedOccasion?: OccasionSlug;
  /** Search terms locked into the query. */
  lockedQuery?: string;
};

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="border border-line bg-paper">
          <div className="aspect-[4/5] animate-pulse bg-parchment/60" />
          <div className="space-y-3 p-5">
            <div className="h-2 w-16 animate-pulse bg-parchment" />
            <div className="h-5 w-3/4 animate-pulse bg-parchment" />
            <div className="h-3 w-full animate-pulse bg-parchment" />
          </div>
        </div>
      ))}
    </div>
  );
}

export async function CatalogueView({
  searchParams,
  basePath,
  baseParams = {},
  lockedOccasion,
  lockedQuery,
}: CataloguePageProps) {
  const params = await searchParams;

  const parsed = parseFilters(params);
  const filters: CatalogueFilters = {
    ...parsed,
    occasions: lockedOccasion ? [lockedOccasion] : parsed.occasions,
    query: lockedQuery ?? parsed.query,
  };
  const sort = parseSort(params);

  const [allProducts, brands, occasions] = await Promise.all([
    listProducts(),
    listCatalogueBrands(),
    listOccasions(),
  ]);

  const results = sortProducts(applyFilters(allProducts, filters), sort);
  const counts = computeFacetCounts(allProducts, filters);

  const groups: FacetGroup[] = [
    ...(lockedOccasion
      ? []
      : [
          {
            id: "occasion" as const,
            title: "Occasion",
            options: occasions.map((occasion) => ({
              value: occasion.slug,
              label: occasion.name,
              hint: occasion.question,
              count: counts.occasions[occasion.slug] ?? 0,
            })),
          },
        ]),
    {
      id: "gender",
      title: "For",
      options: GENDER_FILTERS.map((option) => ({
        value: option.value,
        label: option.label,
        count: counts.genders[option.value] ?? 0,
      })),
    },
    {
      id: "brand",
      title: "Brand",
      collapsible: true,
      options: brands.map((brand) => ({
        value: brand.slug,
        label: brand.name,
        count: counts.brands[brand.slug] ?? 0,
      })),
    },
    {
      id: "price",
      title: "Price",
      options: priceBuckets.map((bucket) => ({
        value: bucket.id,
        label: bucket.label,
        count: counts.priceBuckets[bucket.id] ?? 0,
      })),
    },
  ];

  const occasionNames = new Map(occasions.map((occasion) => [occasion.slug, occasion.name]));
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  const bucketNames = new Map(priceBuckets.map((bucket) => [bucket.id, bucket.label]));
  const genderNames = new Map<string, string>(
    GENDER_FILTERS.map((option) => [option.value as Gender, option.label]),
  );

  const chips = describeFilters(
    filters,
    occasionNames,
    brandNames,
    bucketNames,
    genderNames,
  ).filter((chip) => !(lockedOccasion && chip.key.startsWith("occasion:")));

  // Remember this exact list for the product page's "Back to …" link. The
  // plain, unfiltered catalogue is skipped: "Shop All" already goes there.
  const isPlainCatalogue = !lockedOccasion && countActiveFilters(parsed) === 0 && sort === "featured";
  const trail = isPlainCatalogue
    ? null
    : {
        href: `${basePath}${buildQueryString(parsed, sort, baseParams)}`,
        label: lockedOccasion
          ? `Back to ${occasionNames.get(lockedOccasion) ?? "results"}`
          : "Back to results",
      };

  const state: CatalogueState = {
    filters,
    sort,
    groups,
    total: allProducts.length,
    resultCount: results.length,
    basePath,
    baseParams,
  };

  return (
    <Container>
      <ResultsTrailRecorder trail={trail} />
      <CatalogueControlsProvider state={state}>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-14">
          <FilterSidebar />

          <div className="min-w-0">
            <MobileFilters />

            <div className="mt-6 lg:mt-0">
              <CatalogueToolbar />
            </div>

            <ActiveFilterChips chips={chips} />

            {results.length === 0 ? (
              <div className="border border-dashed border-line-strong px-8 py-20 text-center">
                <p className="font-display text-2xl text-charcoal">Nothing matches those filters</p>
                <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-stone">
                  Try removing a filter — the catalogue is still growing, and not every combination
                  has a match yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
                {results.map((product, index) => (
                  <div key={product.id} data-reveal="rise-sm" style={stagger(index % 3)} className="flex">
                    <ProductCard product={product} priority={index < 3} morph className="w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CatalogueControlsProvider>
    </Container>
  );
}

export function CatalogueFallback() {
  return (
    <Container>
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-14">
        <div className="hidden lg:block">
          <div className="h-64 animate-pulse bg-parchment/40" />
        </div>
        <div>
          <ResultsSkeleton />
        </div>
      </div>
    </Container>
  );
}

export { Suspense };
