"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { formatZAR } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Shares the chosen bottle size across the product page, so the headline
 * price and the purchase panel always describe the same size.
 */

type SelectedVariantValue = {
  variantId: string;
  setVariantId: (id: string) => void;
};

const SelectedVariantContext = createContext<SelectedVariantValue | null>(null);

export function SelectedVariantProvider({
  defaultVariantId,
  children,
}: {
  defaultVariantId: string;
  children: ReactNode;
}) {
  const [variantId, setVariantId] = useState(defaultVariantId);
  return (
    <SelectedVariantContext.Provider value={{ variantId, setVariantId }}>
      {children}
    </SelectedVariantContext.Provider>
  );
}

export function useSelectedVariant(): SelectedVariantValue {
  const value = useContext(SelectedVariantContext);
  if (!value) throw new Error("useSelectedVariant must be used inside <SelectedVariantProvider>.");
  return value;
}

/** The headline price for whichever size is currently selected. */
export function SelectedPrice({ product, className }: { product: Product; className?: string }) {
  const { variantId } = useSelectedVariant();
  const selected = product.variants.find((variant) => variant.id === variantId) ?? product.variants[0];
  return <p className={className}>{formatZAR(selected.priceZAR)}</p>;
}
