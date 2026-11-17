import Image from "next/image";
import { ViewTransition } from "react";
import { ProductVisual } from "./ProductVisual";
import type { ProductImage, ProductVisual as Visual } from "@/lib/types";

/**
 * A fragrance bottle on its coloured backdrop.
 *
 * Product photos are shot on white. Blending them with `multiply` lets the
 * white take on each product's own wash colour, so every bottle sits in a
 * consistent, styled scene instead of a white box. A soft contact shadow
 * grounds it. When a product has no photo, the illustrated bottle is used.
 *
 * `morph` names the element for React's <ViewTransition>, so the same bottle
 * glides from a product card into the product page.
 */
export function Bottle({
  item,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  priority = false,
  className = "",
  inset = "6%",
  morph,
  shadow = true,
  wash = true,
}: {
  item: { image?: ProductImage; visual: Visual; brand: string; name: string };
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Breathing room around the bottle inside its frame. */
  inset?: string;
  /** Shared-element name for the page-to-page morph. */
  morph?: string;
  shadow?: boolean;
  /** Paint the product's colour wash behind the bottle. */
  wash?: boolean;
}) {
  const content = item.image ? (
    <div className="absolute" style={{ inset }}>
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes={sizes}
        // Above-the-fold bottles load first (Next 16 deprecates `priority`).
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="object-contain object-bottom mix-blend-multiply"
      />
    </div>
  ) : (
    <ProductVisual visual={item.visual} brand={item.brand} name={item.name} className="absolute inset-0 h-full w-full" />
  );

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={wash ? { backgroundColor: item.visual.wash } : undefined}
    >
      {wash ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_42%,rgba(255,255,255,0.55),transparent_70%)]"
        />
      ) : null}
      {shadow && item.image ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[4%] left-1/2 h-[6%] w-[58%] -translate-x-1/2 rounded-[50%] bg-charcoal/25 blur-[14px]"
        />
      ) : null}
      {morph ? (
        <ViewTransition name={morph} share="bottle-morph" default="none">
          <div className="absolute inset-0">{content}</div>
        </ViewTransition>
      ) : (
        content
      )}
    </div>
  );
}
