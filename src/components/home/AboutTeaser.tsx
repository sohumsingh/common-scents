import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { Bottle } from "@/components/product/Bottle";
import { stagger } from "@/components/motion/stagger";
import { getProductBySlug } from "@/lib/catalogue/service";

export async function AboutTeaser() {
  const products = (
    await Promise.all([
      getProductBySlug("ysl-libre-eau-de-parfum"),
      getProductBySlug("lattafa-khamrah-eau-de-parfum"),
    ])
  ).filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <section className="fit-viewport py-[clamp(3rem,7svh,6rem)]">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Imagery: a designer and a Middle Eastern fragrance, side by side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto grid max-w-lg grid-cols-2 gap-5 lg:max-w-[min(100%,calc((100svh-var(--header-h))*0.72))] lg:gap-7">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  data-reveal
                  style={stagger(index)}
                  className={`aspect-[3/4.4] overflow-hidden rounded-t-[999px] border border-line shadow-[0_40px_70px_-50px_rgba(41,39,37,0.55)] ${
                    index === 1 ? "mt-16" : ""
                  }`}
                >
                  <Bottle item={product} inset="20% 12% 8%" sizes="(min-width: 1024px) 22vw, 45vw" />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 left-1/2 w-40 -translate-x-1/2 opacity-15">
              <LogoMark className="w-full" />
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2" data-reveal>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              About Common Scents
            </p>
            <h2 className="mt-5 max-w-xl text-balance text-[clamp(2rem,min(4.4vw,7svh),4rem)] leading-[1.04] text-charcoal">
              Fragrance is how you turn up for a moment.
            </h2>
            <div className="mt-7 max-w-lg space-y-4 text-[clamp(15px,1.15vw,17px)] leading-relaxed text-stone">
              <p>
                A scent is not a detail you add at the end of getting dressed. It is part of how you
                meet a room, a meeting, a memory. Common Scents exists to make finding the right
                one less of a gamble.
              </p>
              <p>
                We curate designer and Middle Eastern fragrances side by side, and we organise them
                around the way people actually shop — by the moment, not the marketing category.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/about">Read our story</Button>
              <Button href="/shop" variant="secondary">
                Browse fragrances
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
