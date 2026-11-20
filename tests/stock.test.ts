import { describe, expect, it } from "vitest";
import {
  LOW_STOCK,
  MAX_PER_LINE,
  availabilityLabel,
  maxQuantity,
  productAvailability,
  schemaAvailability,
  sizeAvailability,
} from "@/lib/catalogue/stock";
import { getDefaultVariant } from "@/lib/catalogue/variants";
import { makeProduct } from "./fixtures";

describe("sizeAvailability", () => {
  it("treats a size with no stock figure as not tracked", () => {
    expect(sizeAvailability(null)).toBe("unconfirmed");
    expect(sizeAvailability(undefined)).toBe("unconfirmed");
  });

  it("marks 0 as sold out, small amounts as low and the rest as in stock", () => {
    expect(sizeAvailability(0)).toBe("sold-out");
    expect(sizeAvailability(1)).toBe("low");
    expect(sizeAvailability(LOW_STOCK)).toBe("low");
    expect(sizeAvailability(LOW_STOCK + 1)).toBe("in-stock");
  });
});

describe("maxQuantity", () => {
  it("never lets a bag line go above the stock", () => {
    expect(maxQuantity(2)).toBe(2);
    expect(maxQuantity(0)).toBe(0);
  });

  it("caps untracked or very large stock at the per-line limit", () => {
    expect(maxQuantity(null)).toBe(MAX_PER_LINE);
    expect(maxQuantity(500)).toBe(MAX_PER_LINE);
  });
});

describe("productAvailability", () => {
  it("is sold out only when every size is", () => {
    expect(productAvailability([{ stock: 0 }, { stock: 0 }])).toBe("sold-out");
    expect(productAvailability([{ stock: 0 }, { stock: 2 }])).toBe("low");
    expect(productAvailability([{ stock: 0 }, { stock: 20 }])).toBe("in-stock");
    expect(productAvailability([{ stock: null }])).toBe("unconfirmed");
  });
});

describe("schemaAvailability (search-engine data)", () => {
  it("maps stock to the schema.org availability values", () => {
    expect(schemaAvailability([{ stock: 10 }])).toBe("https://schema.org/InStock");
    expect(schemaAvailability([{ stock: 2 }])).toBe("https://schema.org/LimitedAvailability");
    expect(schemaAvailability([{ stock: 0 }, { stock: 0 }])).toBe("https://schema.org/OutOfStock");
    expect(schemaAvailability([{ stock: null }])).toBe("https://schema.org/PreOrder");
  });
});

describe("availabilityLabel", () => {
  it("uses the wording shown to shoppers", () => {
    expect(availabilityLabel(0)).toBe("Sold out");
    expect(availabilityLabel(2)).toBe("Only 2 left");
    expect(availabilityLabel(50)).toBe("In stock");
  });
});

describe("getDefaultVariant", () => {
  it("preselects the size that matches the headline price", () => {
    expect(getDefaultVariant(makeProduct()).id).toBe("100ml");
  });

  it("skips a sold-out size when another is available", () => {
    const product = makeProduct({
      variants: [
        { id: "50ml", label: "50 ml", size: "50 ml", priceZAR: 1099, stock: 4 },
        { id: "100ml", label: "100 ml", size: "100 ml", priceZAR: 1899, stock: 0 },
      ],
    });
    expect(getDefaultVariant(product).id).toBe("50ml");
  });
});
