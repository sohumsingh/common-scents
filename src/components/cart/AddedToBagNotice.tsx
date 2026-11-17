"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { Portal } from "@/components/ui/Portal";

const VISIBLE_FOR_MS = 4500;

/**
 * Small-screen confirmation shown after adding to the bag.
 *
 * It sits at the bottom of the screen, leaves the page usable, and offers a
 * way into the bag. The live region stays mounted so screen readers announce
 * each addition; the visible card only exists while a notice is showing, so
 * nothing hidden can take keyboard focus.
 */
export function AddedToBagNotice() {
  const { addedNotice, dismissAddedNotice, openCart, isOpen } = useCart();

  useEffect(() => {
    if (!addedNotice) return;
    const timer = setTimeout(dismissAddedNotice, VISIBLE_FOR_MS);
    return () => clearTimeout(timer);
  }, [addedNotice, dismissAddedNotice]);

  // Opening the bag makes the confirmation redundant.
  useEffect(() => {
    if (isOpen && addedNotice) dismissAddedNotice();
  }, [isOpen, addedNotice, dismissAddedNotice]);

  return (
    <Portal>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {addedNotice ? (
          <div
            key={addedNotice.id}
            className="pointer-events-auto mx-auto flex max-w-md notice-in items-center gap-3 border border-line bg-paper px-4 py-3 shadow-[0_18px_40px_-24px_rgba(41,39,37,0.55)]"
          >
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-charcoal text-ivory"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="min-w-0 flex-1 text-[13px] leading-snug text-charcoal">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-muted">
                Added to your bag
              </span>
              <span className="block truncate">
                {addedNotice.name} · {addedNotice.size}
                {addedNotice.quantity > 1 ? ` × ${addedNotice.quantity}` : ""}
              </span>
            </p>
            <button
              type="button"
              onClick={openCart}
              className="shrink-0 whitespace-nowrap border border-charcoal/25 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              View bag
            </button>
            <button
              type="button"
              onClick={dismissAddedNotice}
              aria-label="Dismiss"
              className="-mr-1 grid h-11 w-11 shrink-0 place-items-center text-stone transition-colors hover:text-charcoal"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </Portal>
  );
}
