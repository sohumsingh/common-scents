import { Container } from "@/components/ui/Container";

/**
 * Quiet placeholders shown for the instant between a click and a page's
 * content arriving. They mirror each page's layout so nothing jumps when
 * the real content streams in.
 */

const block = "animate-pulse bg-parchment/60";

export function ProductPageSkeleton() {
  return (
    <Container className="py-[clamp(1.25rem,3svh,2.5rem)]">
      <div role="status" aria-label="Loading fragrance">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={`aspect-[4/5] w-full lg:aspect-auto lg:h-[calc(100svh-var(--header-h)-var(--topbar-h)-2*clamp(1.25rem,3svh,2.5rem))] ${block}`} />
        <div className="flex flex-col gap-5">
          <div className={`h-3 w-64 ${block}`} />
          <div className={`h-6 w-48 ${block}`} />
          <div className={`h-12 w-3/4 ${block}`} />
          <div className={`h-8 w-32 ${block}`} />
          <div className={`h-20 w-full ${block}`} />
          <div className={`mt-6 h-12 w-full ${block}`} />
        </div>
      </div>
      </div>
    </Container>
  );
}

export function CollectionPageSkeleton() {
  return (
    <Container className="flex min-h-[calc(100svh-var(--header-h)-var(--topbar-h))] flex-col justify-center py-14">
      <div role="status" aria-label="Loading collection">
      <div className={`h-3 w-40 ${block}`} />
      <div className={`mt-6 h-14 w-2/3 max-w-xl ${block}`} />
      <div className={`mt-5 h-16 w-full max-w-2xl ${block}`} />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`aspect-[4/5] ${block}`} />
        ))}
      </div>
      </div>
    </Container>
  );
}
