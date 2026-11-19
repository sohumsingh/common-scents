import type { Metadata } from "next";
import { defaultShareImage } from "@/lib/site";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Bottle } from "@/components/product/Bottle";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { stagger } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProductBySlug, getProductsByOccasion } from "@/lib/catalogue/service";
import { occasions } from "@/lib/catalogue/occasions";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Common Scents is a South African online fragrance retailer built around a simple idea: helping people find the right fragrance for every moment.",
  alternates: { canonical: "/about" },
  openGraph: {
    images: [defaultShareImage],
    title: "About Common Scents",
    description:
      "Why we organise a fragrance catalogue around moments instead of gender or brand.",
    url: "/about",
  },
};

const principles = [
  {
    title: "Occasion before category",
    body: "Gender and brand are useful reference points, but they are not how most people actually shop. The question people ask is “what should I wear for this?” — so that is how the catalogue is organised. A fragrance can sit in more than one collection, because real fragrances are not tidy.",
  },
  {
    title: "Designer and Middle Eastern, side by side",
    body: "Both families deserve to be taken seriously. We do not treat one as the premium tier and the other as the alternative. They are curated on the same terms: does it smell good, does it suit the moment, and is the pricing honest?",
  },
  {
    title: "Honest by design",
    body: "Clear prices, clear sizes and clear descriptions, with stock shown as it really is. Everything you need to choose with confidence is on the page, and nothing is dressed up.",
  },
  {
    title: "Accessible, not exclusive",
    body: "We sit between ultra-luxury fragrance boutiques and discount perfume retailers. Premium should describe the standard of what we stock and the way we present it — not a wall you have to be invited over.",
  },
];

/** Space between a section's edge and its content; scales with the screen height. */
const sectionPad = "py-[clamp(2rem,6svh,5rem)]";

export default async function AboutPage() {
  const [samples, occasionBottles] = await Promise.all([
    Promise.all([
      getProductBySlug("lattafa-khamrah-eau-de-parfum"),
      getProductBySlug("swiss-arabian-shaghaf-oud"),
      getProductBySlug("ysl-y-eau-de-parfum"),
    ]).then((list) => list.filter((product): product is NonNullable<typeof product> => Boolean(product))),
    // One bottle per collection tile, never the same one twice.
    Promise.all(occasions.map((occasion) => getProductsByOccasion(occasion.slug))).then((lists) => {
      const used = new Set<string>();
      return lists.map((products) => {
        const pick = products.find((product) => product.image && !used.has(product.id)) ?? products[0];
        if (pick) used.add(pick.id);
        return pick;
      });
    }),
  ]);

  return (
    <>
      {/* 1 — Opening: the first screen */}
      <header className="relative flex min-h-[calc(100svh-var(--header-h)-var(--topbar-h))] flex-col overflow-hidden border-b border-line bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_90%_0%,rgba(216,203,184,0.45),transparent_70%)]"
        />
        <Container className={`relative flex flex-1 flex-col justify-center ${sectionPad}`}>
          <div className="rise-in" style={stagger(0)}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
          </div>

          <div className="mt-[clamp(1.5rem,5svh,3.5rem)] grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <span className="eyebrow rise-in flex items-center gap-3" style={stagger(1)}>
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                Our Story
              </span>
              <h1
                className="rise-in mt-[clamp(1rem,2.5svh,1.5rem)] text-balance text-[clamp(2.4rem,min(5vw,8svh),4.4rem)] leading-[1.02] text-charcoal"
                style={stagger(2)}
              >
                Fragrance is personal. Finding yours should be too.
              </h1>
              <p
                className="rise-in mt-[clamp(1rem,3svh,1.75rem)] max-w-xl text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed text-stone"
                style={stagger(3)}
              >
                Common Scents is a South African online fragrance store built on a simple idea: it is
                easier to choose a scent for a moment in your life than from a list of brands.
              </p>
              <div className="rise-in mt-[clamp(1.5rem,4.5svh,2.5rem)] flex flex-wrap gap-3" style={stagger(4)}>
                <Button href="/shop">Browse the catalogue</Button>
                <Button href="/contact" variant="secondary">
                  Talk to us
                </Button>
              </div>
            </div>

            {/* Imagery: scales with the screen height as well as the width */}
            <div className="mx-auto grid w-full grid-cols-3 gap-3 sm:gap-4 lg:max-w-[calc((100svh-var(--header-h)-var(--topbar-h))*0.78)]">
              {samples.map((product, index) => (
                <div
                  key={product.id}
                  className={`rise-in aspect-[3/4.6] overflow-hidden rounded-t-[999px] border border-white/60 shadow-[0_30px_60px_-46px_rgba(41,39,37,0.55)] ${
                    index === 1 ? "mt-[12%]" : index === 2 ? "mt-[24%]" : ""
                  }`}
                  style={stagger(index + 2)}
                >
                  <Bottle item={product} inset="20% 12% 8%" sizes="(min-width: 1024px) 14vw, 30vw" priority />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </header>

      {/* 2 — The idea */}
      <section className={`fit-viewport ${sectionPad}`}>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div data-reveal>
              <span className="eyebrow flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                Why moments
              </span>
              <p className="mt-6 font-display text-[clamp(1.8rem,min(3.4vw,6svh),3rem)] leading-[1.2] text-charcoal">
                A fragrance is not just a detail you add at the end of getting dressed. It is part of how
                you meet a room.
              </p>
            </div>

            <div
              data-reveal
              style={stagger(1)}
              className="space-y-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed text-stone lg:border-l lg:border-line lg:pl-12"
            >
              <p>
                Most perfume websites ask you to choose a gender first, then browse a brand, then
                work out which bottle suits you. It is a sensible-sounding system that rarely matches
                how anyone actually decides what to wear.
              </p>
              <p>
                People choose by moment. Something you can wear all day without thinking about.
                Something warmer for a dinner. Something fresh after the gym. Something that earns
                its keep at a wedding. Those are the questions worth organising a catalogue around —
                and they are the five collections that sit at the centre of Common Scents.
              </p>
              <p>
                We started with a deliberately small, carefully chosen catalogue of designer and
                Middle Eastern fragrances, and we are building outwards from there. We would rather
                get a smaller selection genuinely right than pad a large one with lines nobody has
                thought about.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3 — Principles */}
      <section className={`fit-viewport border-y border-line bg-paper/60 ${sectionPad}`}>
        <Container>
          <SectionHeading
            reveal
            eyebrow="How we work"
            title="What we stand for."
            description="Four principles that shape everything we stock and how we sell it."
          />

          <div className="mt-[clamp(2rem,5svh,3.5rem)] grid gap-x-12 gap-y-[clamp(1.25rem,4svh,3rem)] sm:grid-cols-2">
            {principles.map((principle, index) => (
              <article
                key={principle.title}
                data-reveal
                style={stagger(index % 2)}
                className="border-t border-line pt-[clamp(1.25rem,3svh,1.75rem)]"
              >
                <span className="font-display text-[1.8rem] italic leading-none text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-[clamp(1.35rem,min(2vw,3.4svh),1.7rem)] leading-snug text-charcoal">
                  {principle.title}
                </h3>
                <p className="mt-2.5 max-w-xl text-[0.92rem] leading-relaxed text-stone">{principle.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 4 — The five collections */}
      <section className={`fit-viewport ${sectionPad}`}>
        <Container className="flex flex-1 flex-col">
          <SectionHeading
            reveal
            eyebrow="The five collections"
            title="Start with the moment."
            description="Every fragrance in the catalogue is tagged with the occasions it genuinely suits. Sometimes that is more than one."
          />

          <ul className="mt-[clamp(2rem,5svh,3rem)] grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {occasions.map((occasion, index) => {
              const bottle = occasionBottles[index];
              return (
                <li key={occasion.slug} data-reveal style={stagger(index)} className="flex">
                  <Link
                    href={`/collections/${occasion.slug}`}
                    className="group relative flex w-full flex-col overflow-hidden border border-line p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_22px_44px_-34px_rgba(41,39,37,0.5)]"
                    style={{ backgroundColor: occasion.wash }}
                  >
                    <span className="text-[11px] tabular-nums tracking-[0.22em] text-charcoal/45">
                      {String(occasion.order).padStart(2, "0")}
                    </span>
                    <span className="mt-3 font-display text-[1.4rem] leading-tight text-charcoal transition-colors group-hover:text-gold-deep">
                      {occasion.name}
                    </span>
                    <span className="mt-2 text-[12px] leading-relaxed text-charcoal/65">{occasion.tagline}</span>

                    {bottle ? (
                      <span
                        aria-hidden="true"
                        className="relative mx-auto mt-4 hidden w-[70%] flex-1 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-y-1.5 lg:block lg:min-h-[6rem]"
                      >
                        <Bottle item={bottle} wash={false} inset="4% 6% 2%" sizes="(min-width: 1024px) 12vw, 40vw" />
                      </span>
                    ) : null}

                    <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-charcoal/70 transition-colors group-hover:text-gold-deep">
                      Explore →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* 5 — Closing invitation */}
      <section className={`border-t border-line ${sectionPad}`}>
        <Container>
          <div
            data-reveal
            className="relative overflow-hidden bg-noir px-6 py-[clamp(3rem,9svh,6rem)] text-center sm:px-12"
          >
            {/* Quiet monogram watermarks and a gold rule, echoing the brand marks. */}
            <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-14 w-[clamp(12rem,20vw,20rem)] opacity-[0.06]">
              <LogoMark tone="ivory" className="w-full" />
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 w-[clamp(14rem,24vw,24rem)] rotate-6 opacity-[0.06]">
              <LogoMark tone="ivory" className="w-full" />
            </div>
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gold" />

            <div className="relative mx-auto max-w-2xl">
              <p className="eyebrow inline-flex items-center gap-3 text-gold">
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                Get in touch
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
              </p>
              <h2 className="mt-5 text-balance text-[clamp(2.1rem,min(4.4vw,7svh),3.8rem)] leading-[1.05] text-ivory">
                Questions? <span className="italic text-sand">We&apos;re here to help.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed text-ivory/65">
                Not sure which fragrance is right for you, or need a hand with an order? Send us a
                message and we&apos;ll get back to you.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="sheen inline-flex min-h-12 items-center justify-center bg-ivory px-8 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:bg-paper"
                >
                  Contact us
                </Link>
                <Button href="/shop" variant="light">
                  Browse the catalogue
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
