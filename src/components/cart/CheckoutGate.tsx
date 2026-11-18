"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { features } from "@/lib/site";

/**
 * The checkout step in the bag. Anyone can fill the bag; checking out needs
 * an account. Signed-out shoppers get a sign-in prompt (with registration
 * underneath) that brings them back to this page with the bag open.
 */
export function CheckoutGate() {
  const auth = useAuthUser();
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

  return (
    <>
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
    </>
  );
}
