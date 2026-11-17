import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { occasions } from "@/lib/catalogue/occasions";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="fit-viewport py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-5 text-balance text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] text-charcoal">
            This page has lost its scent.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-stone">
            The page you were looking for is not here. It may have moved, or it may never have
            existed. The collections below are a good place to pick the thread back up.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-charcoal px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
            >
              Browse all fragrances
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-charcoal/25 px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Back to home
            </Link>
          </div>

          <ul className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-line pt-8">
            {occasions.map((occasion) => (
              <li key={occasion.slug}>
                <Link
                  href={`/collections/${occasion.slug}`}
                  className="text-[11px] uppercase tracking-[0.18em] text-stone transition-colors hover:text-gold-deep"
                >
                  {occasion.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
