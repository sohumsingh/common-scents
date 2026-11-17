"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  variantId,
  quantity = 1,
  label = "Add to Bag",
  className = "",
  disabled = false,
}: {
  product: Product;
  variantId?: string;
  quantity?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleClick = () => {
    addItem(product, variantId, quantity);
    setConfirmed(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirmed(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {confirmed ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Added
        </>
      ) : (
        label
      )}
    </button>
  );
}
