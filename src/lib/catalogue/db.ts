import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type { Brand, CharacterKey, Gender, IntensityKey, OccasionSlug, Product } from "../types";

/**
 * ---------------------------------------------------------------------------
 * CATALOGUE — DATABASE READER
 * ---------------------------------------------------------------------------
 *
 * Loads the published catalogue from Supabase in one query and maps each row
 * to the storefront's `Product` shape, so no page or component changes.
 *
 * Cached with the "minutes" profile: pages stay prerendered and fast, and an
 * edit made in Supabase reaches the site within about a minute. Anything that
 * edits the catalogue (the admin dashboard) also calls
 * `revalidateTag(CATALOGUE_TAG)` to refresh it immediately.
 *
 * Reads use the publishable key, so row-level security applies: only
 * published products are visible.
 */

export const CATALOGUE_TAG = "catalogue";

/** How many of the most recently added fragrances wear the "New In" badge. */
const NEW_ARRIVAL_COUNT = 3;

type ProductRow = {
  id: string;
  slug: string;
  brand_slug: string;
  name: string;
  full_name: string;
  concentration: string;
  gender: Gender;
  price_zar: number;
  compare_at_price_zar: number | null;
  short_description: string;
  description: string;
  character: string[];
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  notes_status: Product["notesStatus"];
  pricing_status: Product["pricingStatus"];
  stock_status: Product["stockStatus"];
  added_at: string;
  editorial_badge: string | null;
  visual_accent: string;
  visual_glass: string;
  visual_wash: string;
  visual_shape: Product["visual"]["shape"];
  visual_cap: Product["visual"]["cap"];
  image_src: string | null;
  image_alt: string | null;
  finder_characters: CharacterKey[];
  finder_intensity: IntensityKey;
  wear_winter: number | null;
  wear_spring: number | null;
  wear_summer: number | null;
  wear_autumn: number | null;
  wear_day: number | null;
  wear_longevity_hours: number | string | null;
  trending_rank: number | null;
  brands: { name: string } | null;
  product_variants: { id: string; label: string; size: string; price_zar: number; sort_order: number }[];
  product_occasions: { occasion_slug: OccasionSlug; sort_order: number }[];
};

type BrandRow = { slug: string; name: string; family: Brand["family"] };

export type Catalogue = { products: Product[]; brands: Brand[] };

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

function toProduct(row: ProductRow): Omit<Product, "badge"> {
  const wearValues = [row.wear_winter, row.wear_spring, row.wear_summer, row.wear_autumn, row.wear_day, row.wear_longevity_hours];
  const hasWear = wearValues.every((value) => value !== null);

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brands?.name ?? row.brand_slug,
    brandSlug: row.brand_slug,
    name: row.name,
    fullName: row.full_name,
    concentration: row.concentration,
    gender: row.gender,
    occasions: [...row.product_occasions].sort(bySortOrder).map((tag) => tag.occasion_slug),
    priceZAR: row.price_zar,
    ...(row.compare_at_price_zar !== null ? { compareAtPriceZAR: row.compare_at_price_zar } : {}),
    variants: [...row.product_variants]
      .sort(bySortOrder)
      .map((variant) => ({ id: variant.id, label: variant.label, size: variant.size, priceZAR: variant.price_zar })),
    shortDescription: row.short_description,
    description: row.description,
    character: row.character,
    notes: { top: row.notes_top, heart: row.notes_heart, base: row.notes_base },
    notesStatus: row.notes_status,
    pricingStatus: row.pricing_status,
    stockStatus: row.stock_status,
    addedAt: row.added_at,
    ...(row.editorial_badge ? { editorialBadge: row.editorial_badge } : {}),
    visual: {
      accent: row.visual_accent,
      glass: row.visual_glass,
      wash: row.visual_wash,
      shape: row.visual_shape,
      cap: row.visual_cap,
    },
    ...(row.image_src ? { image: { src: row.image_src, alt: row.image_alt ?? `${row.full_name} bottle` } } : {}),
    finder: { characters: row.finder_characters, intensity: row.finder_intensity },
    ...(hasWear
      ? {
          wear: {
            seasons: {
              winter: row.wear_winter!,
              spring: row.wear_spring!,
              summer: row.wear_summer!,
              autumn: row.wear_autumn!,
            },
            day: row.wear_day!,
            longevityHours: Number(row.wear_longevity_hours),
          },
        }
      : {}),
    ...(row.trending_rank !== null ? { trendingRank: row.trending_rank } : {}),
  };
}

/** The whole published catalogue, in merchandising order. */
export async function loadCatalogue(): Promise<Catalogue> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOGUE_TAG);

  const supabase = client();
  const [productsResult, brandsResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, brands(name), product_variants(id, label, size, price_zar, sort_order), product_occasions(occasion_slug, sort_order)",
      )
      .order("sort_order"),
    supabase.from("brands").select("slug, name, family").order("sort_order"),
  ]);

  if (productsResult.error) throw new Error(`Could not load products: ${productsResult.error.message}`);
  if (brandsResult.error) throw new Error(`Could not load brands: ${brandsResult.error.message}`);

  const products = (productsResult.data as ProductRow[]).map(toProduct);

  // "New In" is worked out from the dates products were added, never typed by hand.
  const newest = new Set(
    [...products]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, NEW_ARRIVAL_COUNT)
      .map((product) => product.id),
  );

  return {
    products: products.map((product) => {
      const badge = product.editorialBadge ?? (newest.has(product.id) ? "New In" : undefined);
      return badge ? { ...product, badge } : product;
    }),
    brands: (brandsResult.data as BrandRow[]).map(({ slug, name, family }) => ({ slug, name, family })),
  };
}
