"use client";

import { useRestoreFocus } from "@/hooks/useRestoreFocus";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { Bottle } from "@/components/product/Bottle";
import { formatZAR } from "@/lib/format";
import { features } from "@/lib/site";
import { Portal } from "@/components/ui/Portal";
import { occasions } from "@/lib/catalogue/occasions";

const occasionsInOrder = [...occasions].sort((a, b) => a.order - b.order);

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, removeItem, setQuantity, clearCart } =
    useCart();
  useRestoreFocus(isOpen);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCart]);

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[80] overflow-hidden ${isOpen ? "" : "pointer-events-none"}`}
        inert={!isOpen}
      >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close shopping bag"
        onClick={closeCart}
        className={`absolute inset-0 bg-charcoal/35 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal={isOpen}
        aria-label="Shopping bag"
        // The shadow only exists while open: off-screen, it would otherwise
        // spill back onto the page as a grey strip down the right edge.
        className={`absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col bg-paper transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "translate-x-0 shadow-[-24px_0_60px_-30px_rgba(41,39,37,0.4)]"
            : "translate-x-full shadow-none"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow">Your Bag</p>
            <p className="mt-1 font-display text-2xl text-charcoal">
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-stone transition-colors hover:bg-parchment hover:text-charcoal"
            aria-label="Close shopping bag"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="scrollbar-quiet flex flex-1 flex-col overflow-y-auto px-6 py-8">
            <p className="font-display text-xl text-charcoal">Nothing in your bag yet</p>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              Start with the moment you are dressing for — that is where the right fragrance usually
              begins.
            </p>

            <ul className="mt-6 divide-y divide-line border-y border-line">
              {occasionsInOrder.map((occasion) => (
                <li key={occasion.slug}>
                  <Link
                    href={`/collections/${occasion.slug}`}
                    onClick={closeCart}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors"
                  >
                    <span>
                      <span className="block font-display text-[1.2rem] leading-tight text-charcoal transition-colors group-hover:text-gold-deep">
                        {occasion.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-stone">{occasion.question}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-stone transition-transform duration-300 group-hover:translate-x-1 group-hover:text-charcoal"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-6 self-start text-[11px] uppercase tracking-[0.18em] text-charcoal underline decoration-gold/60 underline-offset-[7px] transition-colors hover:decoration-charcoal"
            >
              Or browse all fragrances
            </Link>
          </div>
        ) : (
          <>
            <ul className="scrollbar-quiet flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={closeCart}
                    className="h-24 w-20 shrink-0 overflow-hidden border border-line"
                  >
                    <Bottle item={item} inset="8% 10% 5%" sizes="80px" shadow={false} />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gold-deep">
                          {item.brand}
                        </p>
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="mt-0.5 block truncate font-display text-[1.05rem] leading-snug text-charcoal hover:text-gold-deep"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-muted">{item.variantLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted underline-offset-4 transition-colors hover:text-charcoal hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center text-stone transition-colors hover:bg-parchment hover:text-charcoal"
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="w-7 text-center text-[13px] tabular-nums text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center text-stone transition-colors hover:bg-parchment hover:text-charcoal"
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[13px] tabular-nums text-charcoal">
                        {formatZAR(item.priceZAR * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-ivory px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-stone">Subtotal</span>
                <span className="font-display text-2xl tabular-nums text-charcoal">
                  {formatZAR(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Delivery and payment options are confirmed at checkout.
              </p>

              <button
                type="button"
                disabled
                className="mt-4 w-full cursor-not-allowed bg-charcoal/85 px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory"
              >
                Proceed to checkout
              </button>
              <p className="mt-2.5 border border-gold/30 bg-gold/8 px-3 py-2.5 text-[11px] leading-relaxed text-gold-deep">
                {features.checkout
                  ? "Checkout is not connected yet."
                  : "Checkout is not connected yet — no payment provider has been configured. Our team is completing that step now."}
              </p>
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full text-center text-[11px] uppercase tracking-[0.16em] text-muted underline-offset-4 transition-colors hover:text-charcoal hover:underline"
              >
                Empty bag
              </button>
            </footer>
          </>
        )}
      </aside>
      </div>
    </Portal>
  );
}
