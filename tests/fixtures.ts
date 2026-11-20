import type { Product, ProductVariant } from "@/lib/types";

/** A small, realistic product for tests. Override only what a test cares about. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  const variants: ProductVariant[] = overrides.variants ?? [
    { id: "50ml", label: "50 ml Eau de Parfum", size: "50 ml", priceZAR: 1099, stock: null },
    { id: "100ml", label: "100 ml Eau de Parfum", size: "100 ml", priceZAR: 1899, stock: null },
  ];
  return {
    id: "dior-sauvage-edp",
    slug: "dior-sauvage-eau-de-parfum",
    brand: "Dior",
    brandSlug: "dior",
    name: "Sauvage",
    fullName: "Sauvage Eau de Parfum",
    concentration: "Eau de Parfum",
    gender: "men",
    occasions: ["daily-wear", "office-wear"],
    priceZAR: 1899,
    shortDescription: "A crisp, modern aromatic built on bergamot and Sichuan pepper.",
    description: "",
    character: ["Aromatic", "Fresh"],
    notes: { top: ["Bergamot"], heart: ["Sichuan Pepper", "Lavender"], base: ["Ambroxan", "Vanilla"] },
    notesStatus: "pending-verification",
    pricingStatus: "indicative",
    stockStatus: "pending-verification",
    addedAt: "2026-11-01",
    visual: { accent: "#000000", glass: "#000000", wash: "#ffffff", shape: "tall", cap: "cylindrical" },
    finder: { characters: ["fresh"], intensity: "balanced" },
    ...overrides,
    variants,
  } as Product;
}
