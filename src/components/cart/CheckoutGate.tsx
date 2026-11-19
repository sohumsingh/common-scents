"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { DEMO_CHECKOUT_NOTE } from "@/lib/checkout";
import { useCart } from "./CartProvider";

/**
 * The checkout step in the bag. Anyone can fill the bag; checking out needs
 * an account. Signed-out shoppers get a sign-in prompt (with registration
 * underneath) that brings them back to this page with the bag open.
 */
export function CheckoutGate() {
  const auth = useAuthUser();
  const { items, closeCart } = useCart();
  const pathname = usePathname();
  const back = encodeURIComponent(`${pathname}?bag=open`);

  if (auth.status === "signed-out") {
    return (
      <div className="mt-4">
        <p className="text-[12px] leading-relaxed text-stone">Sign in to check out. Your bag stays as it is.</p>
        <Link
          href={`/account/sign-in?next=${back}`}
          className="sheen mt-3 flex h-12 w-full items-center justify-center bg-charcoal px-6 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors duration-300 hover:bg-noir"
        >
          Sign in to check out
        </Link>
        <p className="mt-2.5 text-center text-[12px] text-stone">
          New here?{" "}
          <Link
            href={`/account/register?next=${back}`}
            className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal"
          >
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  const soldOut = items.some((item) => item.stock === 0);

  return (
    <>
      {soldOut ? (
        <p className="mt-4 text-[12px] leading-relaxed text-red-900">
          Remove the sold-out item from your bag to check out.
        </p>
      ) : null}
      <Link
        href="/checkout"
        onClick={closeCart}
        aria-disabled={soldOut}
        tabIndex={soldOut ? -1 : undefined}
        className={`sheen mt-4 flex h-12 w-full items-center justify-center bg-charcoal px-6 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors duration-300 hover:bg-noir ${
          soldOut ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Proceed to checkout
      </Link>
      <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted">{DEMO_CHECKOUT_NOTE}</p>
    </>
  );
}
