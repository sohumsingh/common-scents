"use client";

import { useCart } from "./CartProvider";

export function CartButton({ className = "" }: { className?: string }) {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open shopping bag${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
      className={`relative grid h-11 w-11 place-items-center text-charcoal transition-colors hover:text-gold-deep ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 grid h-[1.05rem] min-w-[1.05rem] place-items-center rounded-full bg-gold-deep px-1 text-[11px] font-medium tabular-nums text-ivory">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
