"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatZAR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useSelectedVariant } from "./SelectedVariant";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { variantId, setVariantId } = useSelectedVariant();
  const [quantity, setQuantity] = useState(1);

  const selected = product.variants.find((variant) => variant.id === variantId);

  return (
    <div className="flex flex-col gap-6">
      {/* Size */}
      {product.variants.length > 1 ? (
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={variantId === variant.id}
                className={`flex min-w-[6.5rem] flex-col items-start border px-4 py-2.5 text-left transition-[background-color,border-color,color] duration-300 ${
                  variantId === variant.id
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line bg-paper text-ink hover:border-charcoal/50"
                }`}
              >
                <span className="text-[13px]">{variant.size}</span>
                <span
                  className={`mt-0.5 text-[12px] tabular-nums ${
                    variantId === variant.id ? "text-ivory/75" : "text-stone"
                  }`}
                >
                  {formatZAR(variant.priceZAR)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Quantity + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center border border-line bg-paper">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid h-12 w-12 place-items-center text-stone transition-colors hover:bg-parchment hover:text-charcoal"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <span className="w-9 text-center text-[14px] tabular-nums text-charcoal" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            className="grid h-12 w-12 place-items-center text-stone transition-colors hover:bg-parchment hover:text-charcoal"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <AddToCartButton
          product={product}
          variantId={variantId}
          quantity={quantity}
          label="Add to Bag"
          // Full width when stacked on phones; `flex-1` only in the row layout
          // (in a column it would zero the button's height).
          className="sheen h-12 w-full bg-charcoal px-8 text-[11px] uppercase tracking-[0.2em] text-ivory shadow-[0_14px_30px_-18px_rgba(41,39,37,0.6)] transition-[background-color,transform] duration-300 hover:bg-noir active:scale-[0.98] sm:w-auto sm:flex-1"
        />
      </div>

      {selected ? (
        <p className="text-[12px] text-stone">
          {selected.label} ·{" "}
          <span className="tabular-nums text-charcoal">{formatZAR(selected.priceZAR)}</span>
        </p>
      ) : null}
    </div>
  );
}
