"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where an error reporting service would be called.
    console.error(error);
  }, [error]);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] text-charcoal">
            We hit an unexpected note.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-stone">
            An error occurred while loading this page. Try again — and if it keeps happening, let
            us know.
          </p>

          {error.digest ? (
            <p className="mt-4 text-[11px] text-muted">Reference: {error.digest}</p>
          ) : null}

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center bg-charcoal px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
            >
              Try again
            </button>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center border border-charcoal/25 px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Browse fragrances
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
