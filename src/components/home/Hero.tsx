import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { Bottle } from "@/components/product/Bottle";
import { stagger } from "@/components/motion/stagger";
import { CineSnap } from "@/components/home/CineSnap";
import { getProductBySlug, getProductsByOccasion, listBrands } from "@/lib/catalogue/service";
import { occasions } from "@/lib/catalogue/occasions";

/** One women's, one men's and one unisex fragrance, so the stage feels open to everyone. */
const HERO_SLUGS = [
  "dior-jadore-eau-de-parfum",
  "dior-sauvage-eau-de-parfum",
  "lattafa-khamrah-eau-de-parfum",
];

const arches = [
  // frame classes, float delay, and how far the arch drifts up as you scroll
  { frame: "mt-16 w-[30%] aspect-[3/4.6]", delay: "0s", drift: "-50px" },
  { frame: "w-[36%] aspect-[3/4.9] z-10", delay: "-2.4s", drift: "-110px" },
  { frame: "mt-24 w-[30%] aspect-[3/4.6]", delay: "-4.6s", drift: "-75px" },
];

/** Inline style for a `scroll-drift` layer (see globals.css). */
const drift = (distance: string) => ({ "--drift": distance }) as CSSProperties;

/*
 * The cinematic hero: the stage stays pinned while scrolling plays six scenes —
 * the opening, then one scene per occasion. Each scene owns a slice of the
 * scroll (see `.cine-*` in globals.css); neighbouring slices overlap slightly
 * so scenes cross-fade. Without scroll-driven animation support, or for
 * reduced-motion visitors, only the opening scene shows, as a normal hero.
 */
const SCENES = occasions.length + 1;
const OVERLAP = 2; // percent of the pinned scroll shared by neighbouring scenes

function sceneRange(index: number) {
  const width = 100 / SCENES;
  const start = index === 0 ? 0 : index * width - OVERLAP;
  const end = index === SCENES - 1 ? 100 : (index + 1) * width + OVERLAP;
  return { "--cine-range": `contain ${start.toFixed(2)}% contain ${end.toFixed(2)}%` } as CSSProperties;
}

function scenePosition(index: number) {
  return index === 0 ? "first" : index === SCENES - 1 ? "last" : "mid";
}

export async function Hero() {
  const [heroProducts, brands, byOccasion] = await Promise.all([
    Promise.all(HERO_SLUGS.map((slug) => getProductBySlug(slug))),
    listBrands(),
    Promise.all(occasions.map((occasion) => getProductsByOccasion(occasion.slug))),
  ]);
  const stage = heroProducts.filter((product): product is NonNullable<typeof product> => Boolean(product));

  // A different bottle for each occasion scene, avoiding the opening three.
  const used = new Set(stage.map((product) => product.id));
  const sceneBottles = byOccasion.map((products) => {
    const pick = products.find((product) => product.image && !used.has(product.id)) ?? products[0];
    if (pick) used.add(pick.id);
    return pick;
  });

  return (
    <section className="relative" aria-label="Find your scent for every moment">
      <div className="cine-track" style={{ "--cine-steps": SCENES - 1 } as CSSProperties}>
        <CineSnap scenes={SCENES} overlap={OVERLAP} />
        <div className="cine-stage">
          {/* Scene 1 — the opening */}
          <div className="cine-scene" data-pos="first" style={sceneRange(0)}>
            <div className="cine-opening relative flex w-full flex-col">
              {/* Background washes */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_80%_20%,rgba(216,203,184,0.5),transparent_62%),radial-gradient(70%_60%_at_5%_90%,rgba(184,161,123,0.18),transparent_60%)]"
              />

              <Container className="relative flex flex-1 flex-col justify-center">
                <div className="grid items-center gap-[clamp(1.5rem,5svh,3.5rem)] pb-[clamp(1.5rem,6svh,4rem)] pt-[clamp(1.25rem,4svh,3rem)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-[3.5svh]">
                  {/* Copy */}
                  <div className="max-w-xl">
                    <p className="eyebrow rise-in" style={stagger(0)}>
                      South African Fragrance Retail
                    </p>

                    <h1
                      className="rise-in mt-[clamp(0.75rem,2.5svh,1.5rem)] text-balance text-[clamp(2.4rem,min(6.6vw,9svh),5.2rem)] leading-[0.96] text-charcoal"
                      style={stagger(1)}
                    >
                      Find Your Scent for <span className="italic text-gold-deep">Every Moment.</span>
                    </h1>

                    <p
                      className="rise-in mt-[clamp(0.9rem,3svh,1.75rem)] max-w-md text-[1.02rem] leading-relaxed text-stone"
                      style={stagger(2)}
                    >
                      Discover fragrances chosen for the moment you are dressing for — your everyday, your
                      evenings and the occasions worth remembering.
                    </p>

                    <div
                      className="rise-in mt-[clamp(1.25rem,4.5svh,2.5rem)] flex flex-col gap-4 sm:flex-row sm:items-center"
                      style={stagger(3)}
                    >
                      <Button href="/shop" size="lg">
                        Shop Now
                      </Button>
                      <Link
                        href="#occasions"
                        className="group inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-charcoal"
                      >
                        <span className="link-underline">Start with an occasion</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>

                    {/* Occasion shortcuts */}
                    <ul
                      className="cine-compact-hide rise-in mt-[clamp(1.25rem,5svh,3.5rem)] flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-[clamp(0.9rem,2.5svh,1.5rem)]"
                      style={stagger(4)}
                    >
                      {occasions.map((occasion) => (
                        <li key={occasion.slug}>
                          <Link
                            href={`/collections/${occasion.slug}`}
                            className="link-underline text-[11px] uppercase tracking-[0.18em] text-stone transition-colors hover:text-charcoal"
                          >
                            {occasion.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* The arches */}
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
                    >
                      <div className="scroll-drift" style={drift("50px")}>
                        <Logo animate className="w-full" sizes="700px" />
                      </div>
                    </div>

                    <div className="relative mx-auto flex w-full max-w-[calc((100svh-var(--header-h)-var(--topbar-h))*0.42)] items-start justify-center gap-3 sm:gap-5 lg:max-w-[calc((100svh-var(--header-h)-var(--topbar-h))*0.82)]">
                      {stage.map((product, index) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.slug}`}
                          aria-label={`${product.brand} ${product.fullName} — view product`}
                          className={`group rise-in relative block ${arches[index]?.frame ?? arches[0].frame}`}
                          style={stagger(index + 2)}
                        >
                          <div className="scroll-drift h-full w-full" style={drift(arches[index]?.drift ?? "-60px")}>
                            <div className="float-slow h-full w-full" style={{ animationDelay: arches[index]?.delay }}>
                              <div className="h-full w-full overflow-hidden rounded-t-[999px] border border-white/60 shadow-[0_40px_70px_-45px_rgba(41,39,37,0.55)] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-y-2">
                                <Bottle
                                  item={product}
                                  priority
                                  inset="18% 12% 8%"
                                  sizes="(min-width: 1024px) 18vw, 32vw"
                                  className="transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
                                />
                              </div>
                              <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-stone transition-colors group-hover:text-charcoal [@media(max-height:47rem)]:hidden">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Container>
            </div>
          </div>

          {/* Scenes 2–6 — one per occasion */}
          {occasions.map((occasion, index) => {
            const product = sceneBottles[index];
            const sceneIndex = index + 1;
            return (
              <div
                key={occasion.slug}
                className="cine-scene"
                data-pos={scenePosition(sceneIndex)}
                style={sceneRange(sceneIndex)}
              >
                {/* The occasion's colour */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(75% 85% at 72% 45%, ${occasion.wash}, transparent 72%), radial-gradient(40% 50% at 15% 85%, ${occasion.accent}22, transparent 70%)`,
                  }}
                />

                <Container className="relative flex h-full items-center">
                  <div className="grid w-full items-center gap-[4svh] lg:grid-cols-[1fr_1fr] lg:gap-16">
                    <div className="cine-copy max-w-xl">
                      <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold-deep">
                        <span className="tabular-nums">
                          {String(occasion.order).padStart(2, "0")} / {String(occasions.length).padStart(2, "0")}
                        </span>
                        <span aria-hidden="true" className="h-px w-10 bg-gold" />
                        For the moment
                      </p>
                      <h2 className="mt-[clamp(0.75rem,2.5svh,1.5rem)] font-display text-[clamp(2.6rem,min(8vw,12svh),7rem)] leading-[0.95] text-charcoal">
                        {occasion.name}
                      </h2>
                      <p className="mt-[clamp(0.6rem,2svh,1.25rem)] font-display text-[clamp(1.2rem,min(2.2vw,3.6svh),1.8rem)] italic leading-snug text-charcoal/75">
                        {occasion.question}
                      </p>
                      <p className="mt-[clamp(0.6rem,2svh,1.25rem)] hidden max-w-md text-[15px] leading-relaxed text-stone sm:block">
                        {occasion.tagline}
                      </p>
                      <div className="mt-[clamp(1rem,4svh,2.25rem)]">
                        <Button href={`/collections/${occasion.slug}`} variant="secondary">
                          Explore {occasion.name}
                        </Button>
                      </div>
                    </div>

                    {product ? (
                      <Link
                        href={`/shop/${product.slug}`}
                        aria-label={`${product.brand} ${product.fullName} — view product`}
                        className="cine-bottle group relative mx-auto block w-[min(62%,calc((100svh-var(--header-h))*0.34))] lg:w-[min(70%,calc((100svh-var(--header-h))*0.5))]"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-1/2 top-[55%] -z-0 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl"
                          style={{ backgroundColor: occasion.accent }}
                        />
                        <span
                          className="relative block aspect-[3/4.4] overflow-hidden rounded-t-[999px] border border-white/60 shadow-[0_50px_90px_-50px_rgba(41,39,37,0.6)]"
                          style={{ backgroundColor: occasion.wash }}
                        >
                          <Bottle item={product} wash={false} inset="14% 10% 6%" sizes="(min-width: 1024px) 30vw, 60vw" />
                        </span>
                        <span className="mt-3 block text-center text-[11px] uppercase tracking-[0.2em] text-stone transition-colors group-hover:text-charcoal">
                          {product.brand} · {product.name}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                </Container>
              </div>
            );
          })}

          {/* Progress through the five occasions; each mark jumps to its scene (see CineSnap) */}
          <nav aria-label="Occasions in this story" className="cine-rail absolute bottom-[2svh] left-1/2 -translate-x-1/2">
            <ol className="flex items-center gap-1 lg:gap-2">
              {occasions.map((occasion, index) => (
                <li key={occasion.slug} className="cine-mark" style={sceneRange(index + 1)}>
                  <button
                    type="button"
                    data-cine-scene={index + 1}
                    aria-label={`Show ${occasion.name}`}
                    className="flex min-h-10 min-w-10 items-center justify-center gap-2 px-2 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                  >
                    <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold" />
                    <span aria-hidden="true" className="hidden text-[11px] uppercase tracking-[0.2em] text-charcoal lg:inline">
                      {occasion.shortName}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Brand ticker */}
      <div
        className="relative border-y border-line bg-paper/70 py-[clamp(0.75rem,2svh,1.25rem)]"
        aria-label="Fragrance houses we carry"
      >
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          {/* The loop and the scroll push live on separate layers so neither overrides the other. */}
          <div className="scroll-nudge w-max">
            <ul className="marquee-track flex w-max items-center">
              {[0, 1].map((copy) =>
                brands.map((brand) => (
                  <li
                    key={`${copy}-${brand.slug}`}
                    aria-hidden={copy === 1 ? true : undefined}
                    className="flex items-center"
                  >
                    <span className="whitespace-nowrap px-7 font-display text-[1.35rem] italic text-charcoal/70">
                      {brand.name}
                    </span>
                    <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-gold" />
                  </li>
                )),
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
