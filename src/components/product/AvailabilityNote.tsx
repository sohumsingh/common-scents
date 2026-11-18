"use client";

import { InfoNote } from "@/components/ui/InfoNote";
import { sizeAvailability } from "@/lib/catalogue/stock";
import type { Product } from "@/lib/types";
import { useSelectedVariant } from "./SelectedVariant";

/** The product page's availability note, worded for the size being viewed. */
export function AvailabilityNote({ product }: { product: Product }) {
  const { variantId } = useSelectedVariant();
  const selected = product.variants.find((variant) => variant.id === variantId) ?? product.variants[0];
  const size = selected?.size ?? "this size";
  const others = product.variants.filter(
    (variant) => variant.id !== selected?.id && sizeAvailability(variant.stock) !== "sold-out",
  );

  switch (sizeAvailability(selected?.stock)) {
    case "sold-out":
      return (
        <InfoNote tone="notice" title="Availability">
          The {size} is sold out for now.
          {others.length > 0
            ? ` The ${others.map((variant) => variant.size).join(" and ")} ${others.length === 1 ? "is" : "are"} still available.`
            : " We are restocking with our suppliers, so check back soon."}
        </InfoNote>
      );
    case "low":
      return (
        <InfoNote tone="pending" title="Availability">
          Only {selected?.stock} of the {size} left. Bottles are not reserved until your order is
          paid.
        </InfoNote>
      );
    case "in-stock":
      return (
        <InfoNote tone="info" title="Availability">
          The {size} is in stock and ready to send.
        </InfoNote>
      );
    default:
      return (
        <InfoNote tone="pending" title="Availability">
          Stock figures for this fragrance are still being confirmed with our suppliers. The item is
          shown in the catalogue as a proposed line and can be added to your bag in the meantime.
        </InfoNote>
      );
  }
}
