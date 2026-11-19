import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { lift, stagger } from "@/components/motion/stagger";
import { getFeaturedProducts } from "@/lib/catalogue/service";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  return (
    <section className="fit-viewport border-y border-line bg-paper/45 py-[clamp(2rem,6svh,5rem)]">
      <Container className="flex flex-1 flex-col">
        <SectionHeading
          reveal
          eyebrow="Featured Fragrances"
          title="Safe to buy blind."
          description="New to fragrance? Start here. Crowd-pleasers that are easy to love and known for turning heads."
          action={<ArrowLink href="/shop">Shop all fragrances</ArrowLink>}
        />

        <div className="mt-[clamp(2rem,4svh,3rem)] grid flex-1 grid-cols-2 gap-x-4 gap-y-10 md:auto-rows-fr lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              data-reveal
              style={{ ...stagger(index % 4), ...lift(index) }}
              className="scroll-lift flex"
            >
              <ProductCard
                product={product}
                priority={index < 4}
                compact
                imageClassName="aspect-[4/5] md:aspect-auto md:min-h-[6.5rem] md:flex-1"
                className="w-full"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
