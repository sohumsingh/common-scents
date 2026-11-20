import { describe, expect, it } from "vitest";
import { DELIVERY_OPTIONS, FREE_DELIVERY_FROM, ORDER_STEPS, deliveryFee, deliveryLabel } from "@/lib/checkout";

describe("deliveryFee", () => {
  it("charges R99 for standard delivery below the free-delivery threshold", () => {
    expect(deliveryFee("standard", 599)).toBe(99);
    expect(deliveryFee("standard", FREE_DELIVERY_FROM - 1)).toBe(99);
  });

  it("makes standard delivery free from R1 500", () => {
    expect(deliveryFee("standard", FREE_DELIVERY_FROM)).toBe(0);
    expect(deliveryFee("standard", 5000)).toBe(0);
  });

  it("always charges R180 for express and nothing for collection", () => {
    expect(deliveryFee("express", 100)).toBe(180);
    expect(deliveryFee("express", 10_000)).toBe(180);
    expect(deliveryFee("collect", 100)).toBe(0);
  });
});

describe("delivery options", () => {
  it("offers exactly the three methods the database accepts", () => {
    expect(DELIVERY_OPTIONS.map((option) => option.id)).toEqual(["standard", "express", "collect"]);
  });

  it("gives each method a readable label", () => {
    expect(deliveryLabel("express")).toBe("Express courier");
    expect(deliveryLabel("unknown-method")).toBe("unknown-method");
  });
});

describe("order progress", () => {
  it("runs paid → being prepared → on its way → delivered", () => {
    expect(ORDER_STEPS).toEqual(["paid", "processing", "shipped", "delivered"]);
  });
});
