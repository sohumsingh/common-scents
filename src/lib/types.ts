/**
 * Core domain types for the Common Scents catalogue.
 *
 * These types are the contract between the catalogue data source and the UI.
 * They are intentionally storage-agnostic so the seed catalogue can be
 * replaced by PostgreSQL (via Prisma/Drizzle) without touching components.
 */

export type Gender = "men" | "women" | "unisex";

export type OccasionSlug =
  | "daily-wear"
  | "date-night"
  | "special-occasion"
  | "gym-and-active"
  | "office-wear";

/** Occasions a fragrance genuinely suits. A fragrance may appear in several. */
export type Occasion = {
  slug: OccasionSlug;
  name: string;
  /** Short label used on product cards and chips. */
  shortName: string;
  /** One-line editorial description used on cards and collection headers. */
  tagline: string;
  /** Longer paragraph used on the collection landing page. */
  description: string;
  /** Question the customer might be asking when they land here. */
  question: string;
  /** Accent colour used for the collection's generated artwork. */
  accent: string;
  /** Secondary colour used for artwork gradients. */
  wash: string;
  /** Ordinal used for editorial numbering. */
  order: number;
};

export type Brand = {
  slug: string;
  name: string;
  /** "Designer" or "Middle Eastern" — the two families in the brief. */
  family: "designer" | "middle-eastern";
};

export type FragranceNotes = {
  top: string[];
  heart: string[];
  base: string[];
};

/** A bottle size offered for a fragrance. */
export type ProductVariant = {
  id: string;
  /** Human label, e.g. "100 ml Eau de Parfum". */
  label: string;
  /** Size only, e.g. "100 ml". */
  size: string;
  priceZAR: number;
  /** Bottles in stock; null while unconfirmed by the supplier. */
  stock?: number | null;
};

/**
 * Art direction for the generated bottle artwork used in place of product
 * photography. Once Cloudinary imagery is available, set `image` on the
 * product and the artwork component steps aside.
 */
export type ProductVisual = {
  /** Dominant colour of the liquid / label. */
  accent: string;
  /** Tint of the glass. */
  glass: string;
  /** Background wash behind the bottle. */
  wash: string;
  shape: "flacon" | "classic" | "tall" | "orb" | "square";
  cap: "cylindrical" | "square" | "faceted";
};

export type Product = {
  id: string;
  slug: string;
  /** Display name of the house, e.g. "Yves Saint Laurent". */
  brand: string;
  /** Slug used to look the brand up in the brand registry. */
  brandSlug: string;
  /** Fragrance name without the brand, e.g. "Sauvage". */
  name: string;
  /** Full retail name, e.g. "Sauvage Eau de Parfum". */
  fullName: string;
  /** Concentration line, e.g. "Eau de Parfum". */
  concentration: string;
  gender: Gender;
  occasions: OccasionSlug[];
  /** The headline price in rand (the default size's price). */
  priceZAR: number;
  compareAtPriceZAR?: number;
  variants: ProductVariant[];
  /** One-line character summary used on cards. */
  shortDescription: string;
  /** Full description used on the product page. */
  description: string;
  /** Sensory character tags, e.g. "Aromatic", "Warm". */
  character: string[];
  notes: FragranceNotes;
  /** Stored with each product; kept for the data model, not shown on the site. */
  notesStatus: "verified" | "pending-verification";
  pricingStatus: "confirmed" | "indicative";
  stockStatus: "in-stock" | "low-stock" | "out-of-stock" | "pending-verification";
  /** ISO date used for "newest arrivals" ordering. */
  addedAt: string;
  /** Optional editorial marker, e.g. "Curator's Edit". */
  editorialBadge?: string;
  visual: ProductVisual;
  /** Real product photography. When present it replaces the generated artwork. */
  image?: ProductImage;
  /** How the signature finder matches this fragrance (editorial). */
  finder: FinderProfile;
  /** When and how long it wears (normalised community votes). */
  wear?: WearGuide;
  /** Position in "Trending Now" (1 = first); absent when not trending. */
  trendingRank?: number;
  /** The label shown on cards: the editorial badge, else "New In" for the newest. */
  badge?: string;
};

/**
 * A product as written in the seed files (src/lib/catalogue/products.ts).
 * The finder profile, wear guide, trending rank and badge are stored as
 * separate seed tables and joined on when the catalogue is loaded.
 */
export type SeedProduct = Omit<Product, "finder" | "wear" | "trendingRank" | "badge">;

/** The finder's character answers a fragrance satisfies, and how strongly it comes across. */
export type CharacterKey = "fresh" | "woody" | "sweet" | "bold" | "floral";
export type IntensityKey = "light" | "balanced" | "rich";
export type FinderProfile = { characters: CharacterKey[]; intensity: IntensityKey };

/** Season suitability and day share are 0–100; longevity is typical hours on skin. */
export type WearGuide = {
  seasons: { winter: number; spring: number; summer: number; autumn: number };
  day: number;
  longevityHours: number;
};

/** A product photograph (demo images, credited in the README). */
export type ProductImage = { src: string; alt: string };

/** A product with its resolved occasion objects, ready for display. */
export type ProductWithOccasions = Product & {
  occasionList: Occasion[];
};

export type CartLine = {
  /** Composite key: productId + variant id. */
  key: string;
  productId: string;
  slug: string;
  brand: string;
  name: string;
  fullName: string;
  variantId: string;
  variantLabel: string;
  priceZAR: number;
  quantity: number;
  visual: ProductVisual;
  image?: ProductImage;
  occasions: OccasionSlug[];
  /** Bottles in stock for this size (null while unconfirmed), used to cap the quantity. */
  stock?: number | null;
};

export type CatalogueFilters = {
  occasions: OccasionSlug[];
  brands: string[];
  genders: Gender[];
  priceBuckets: string[];
  query: string;
};

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";
