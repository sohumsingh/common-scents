import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Bottle } from "@/components/product/Bottle";
import { lift, stagger } from "@/components/motion/stagger";
import { getCuratedTrending } from "@/lib/catalogue/service";
import { formatFromPrice, formatSizes } from "@/lib/format";

/**
 * "Trending Now".
 *
 * There is no live sales data behind this section yet, so it is presented
 * honestly as a curated selection rather than as verified best-sellers.
 */
export async function TrendingSection() {
  const products = await getCuratedTrending(4);

  return (
    <section className="fit-viewport relative overflow-clip bg-noir py-[clamp(2rem,6svh,5rem)] text-ivory">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_10%,rgba(184,161,123,0.16),transparent_70%)]"
      />
      <Container className="relative flex flex-1 flex-col">
        <SectionHeading
          reveal
          tone="dark"
          eyebrow="Trending Now"
          title="The ones people keep asking for."
          description="A curated selection chosen by our buyers. Live sales data will replace this list once the store is trading."
          action={
            <ArrowLink href="/shop" tone="dark">
              Shop all
            </ArrowLink>
          }
        />

        <ul className="mt-[clamp(2rem,4svh,3rem)] grid flex-1 gap-5 sm:grid-cols-2 md:auto-rows-fr lg:grid-cols-4">
          {products.map((product, index) => (
            <li
              key={product.id}
              data-reveal
              style={{ ...stagger(index), ...lift(index) }}
              className="scroll-lift flex"
            >
              <Link
                href={`/shop/${product.slug}`}
                className="group flex w-full flex-col border border-ivory/10 bg-noir-soft transition-[transform,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-gold/45"
              >
                <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[6.5rem] md:flex-1">
                  <div className="absolute inset-0 transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]">
                    <Bottle item={product} inset="10% 14% 7%" sizes="(min-width: 1024px) 24vw, 50vw" />
                  </div>
                  <span className="absolute left-4 top-4 font-display text-[1.6rem] italic leading-none text-charcoal/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold">{product.brand}</p>
                  <p className="mt-2 font-display text-[1.45rem] leading-tight text-ivory">{product.name}</p>
                  <p className="mt-2.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ivory/60">
                    {product.shortDescription}
                  </p>
                  <p className="mt-5 flex items-baseline justify-between gap-3 border-t border-ivory/12 pt-4 tabular-nums">
                    <span className="text-[14px] text-ivory/90">{formatFromPrice(product.variants)}</span>
                    <span className="text-[11px] text-ivory/50">{formatSizes(product.variants)}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
