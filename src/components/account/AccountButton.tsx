"use client";

import Link from "next/link";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * The account icon in the header. Goes to "My account" when signed in
 * (shown with a small gold dot) and to the sign-in page otherwise.
 */
export function AccountButton() {
  const auth = useAuthUser();
  const signedIn = auth.status === "signed-in";

  return (
    <Link
      href={signedIn ? "/account" : "/account/sign-in"}
      aria-label={signedIn ? "My account" : "Sign in"}
      title={signedIn ? "My account" : "Sign in"}
      className="relative grid h-11 w-11 place-items-center text-charcoal transition-colors hover:text-gold-deep"
    >
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" strokeLinecap="round" />
      </svg>
      {signedIn ? <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gold" /> : null}
    </Link>
  );
}
