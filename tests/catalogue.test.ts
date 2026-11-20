import { describe, expect, it } from "vitest";
import {
  applyFilters,
  countActiveFilters,
  matchesPriceBucket,
  parseFilters,
  parseSort,
  sortProducts,
} from "@/lib/catalogue/query";
import { formatFromPrice, formatSizes, formatZAR, lowestPrice, pluralise } from "@/lib/format";
import { makeProduct } from "./fixtures";

const sauvage = makeProduct();
const yara = makeProduct({
  id: "lattafa-yara",
  slug: "lattafa-yara-eau-de-parfum",
  brand: "Lattafa",
  brandSlug: "lattafa",
  name: "Yara",
  fullName: "Yara Eau de Parfum",
  gender: "women",
  occasions: ["daily-wear", "date-night"],
  priceZAR: 399,
  shortDescription: "Orchid, tangerine and creamy vanilla.",
  notes: { top: ["Orchid"], heart: ["Tangerine"], base: ["Vanilla", "Musk"] },
  addedAt: "2026-11-10",
  editorialBadge: undefined,
  variants: [{ id: "100ml", label: "100 ml Eau de Parfum", size: "100 ml", priceZAR: 399 }],
});
const khamrah = makeProduct({
  id: "lattafa-khamrah",
  slug: "lattafa-khamrah-eau-de-parfum",
  brand: "Lattafa",
  brandSlug: "lattafa",
  name: "Khamrah",
  fullName: "Khamrah Eau de Parfum",
  gender: "unisex",
  occasions: ["special-occasion"],
  priceZAR: 449,
  shortDescription: "Cinnamon and dates over praline and vanilla.",
  notes: { top: ["Cinnamon"], heart: ["Dates"], base: ["Praline"] },
  addedAt: "2026-10-01",
  editorialBadge: "Signature Pick",
  variants: [{ id: "100ml", label: "100 ml Eau de Parfum", size: "100 ml", priceZAR: 449 }],
});
const all = [sauvage, yara, khamrah];
const noFilters = parseFilters({});

describe("parseFilters and parseSort", () => {
  it("reads single and repeated values from the address bar", () => {
    const filters = parseFilters({ occasion: ["daily-wear", "date-night"], brand: "dior", q: "  vanilla " });
    expect(filters.occasions).toEqual(["daily-wear", "date-night"]);
    expect(filters.brands).toEqual(["dior"]);
    expect(filters.query).toBe("vanilla");
    expect(countActiveFilters(filters)).toBeGreaterThan(0);
  });

  it("falls back to Featured for an unknown sort", () => {
    expect(parseSort({ sort: "price-asc" })).toBe("price-asc");
    expect(parseSort({ sort: "popularity" })).toBe("featured");
    expect(parseSort({})).toBe("featured");
  });
});

describe("applyFilters", () => {
  it("returns everything when nothing is selected", () => {
    expect(applyFilters(all, noFilters)).toHaveLength(3);
  });

  it("filters by occasion, brand and gender", () => {
    expect(applyFilters(all, { ...noFilters, occasions: ["date-night"] }).map((p) => p.name)).toEqual(["Yara"]);
    expect(applyFilters(all, { ...noFilters, brands: ["lattafa"] }).map((p) => p.name)).toEqual(["Yara", "Khamrah"]);
    expect(applyFilters(all, { ...noFilters, genders: ["men"] }).map((p) => p.name)).toEqual(["Sauvage"]);
  });

  it("matches every word of a search across names, notes and occasions", () => {
    // Khamrah's description mentions vanilla, so it counts too.
    expect(applyFilters(all, { ...noFilters, query: "vanilla" }).map((p) => p.name)).toEqual(["Sauvage", "Yara", "Khamrah"]);
    expect(applyFilters(all, { ...noFilters, query: "orchid" }).map((p) => p.name)).toEqual(["Yara"]);
    expect(applyFilters(all, { ...noFilters, query: "lattafa cinnamon" }).map((p) => p.name)).toEqual(["Khamrah"]);
    expect(applyFilters(all, { ...noFilters, query: "date night" }).map((p) => p.name)).toEqual(["Yara"]);
  });
});

describe("matchesPriceBucket", () => {
  it("counts a fragrance in a price band if any of its sizes fits", () => {
    expect(matchesPriceBucket(sauvage, ["1000-1499"])).toBe(true); // the 50 ml at R1 099
    expect(matchesPriceBucket(sauvage, ["under-500"])).toBe(false);
    expect(matchesPriceBucket(yara, ["under-500"])).toBe(true);
  });
});

describe("sortProducts", () => {
  it("sorts by the lowest price shown on each card", () => {
    expect(sortProducts(all, "price-asc").map((p) => p.name)).toEqual(["Yara", "Khamrah", "Sauvage"]);
    expect(sortProducts(all, "price-desc").map((p) => p.name)).toEqual(["Sauvage", "Khamrah", "Yara"]);
  });

  it("puts the newest first", () => {
    expect(sortProducts(all, "newest").map((p) => p.name)).toEqual(["Yara", "Sauvage", "Khamrah"]);
  });

  it("puts editorial picks first for Featured", () => {
    expect(sortProducts(all, "featured")[0].name).toBe("Khamrah");
  });

  it("does not change the original list", () => {
    sortProducts(all, "price-asc");
    expect(all.map((p) => p.name)).toEqual(["Sauvage", "Yara", "Khamrah"]);
  });
});

describe("price formatting", () => {
  const plain = (text: string) => text.replace(/\s/g, " ");

  it("formats rand the South African way", () => {
    expect(plain(formatZAR(1899))).toBe("R 1 899");
    expect(plain(formatZAR(399))).toBe("R 399");
  });

  it("shows 'From' only when sizes have different prices", () => {
    expect(lowestPrice(sauvage.variants)).toBe(1099);
    expect(plain(formatFromPrice(sauvage.variants))).toBe("From R 1 099");
    expect(plain(formatFromPrice(yara.variants))).toBe("R 399");
    expect(formatSizes(sauvage.variants)).toBe("50 ml · 100 ml");
  });

  it("pluralises counts", () => {
    expect(pluralise(1, "fragrance")).toBe("1 fragrance");
    expect(pluralise(3, "fragrance")).toBe("3 fragrances");
  });
});
