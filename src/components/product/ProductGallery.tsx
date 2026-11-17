"use client";

import { useState } from "react";
import { Bottle } from "./Bottle";
import { FragranceProfile } from "./FragranceProfile";
import type { WearGuide } from "@/lib/types";
import type { Product } from "@/lib/types";

type ViewId = "bottle" | "detail" | "profile";

const views: { id: ViewId; label: string }[] = [
  { id: "bottle", label: "Bottle" },
  { id: "detail", label: "Detail" },
  { id: "profile", label: "Profile" },
];

/**
 * Product gallery: the bottle, a close detail, and the fragrance profile card
 * (notes, seasons, day/night and longevity). The bottle view is the landing
 * point of the card-to-page morph.
 */
export function ProductGallery({ product, wear }: { product: Product; wear?: WearGuide }) {
  const [active, setActive] = useState<ViewId>("bottle");

  return (
    <div
      className={`flex flex-col gap-[clamp(0.6rem,1.6svh,1rem)] ${
        // Bottle and detail views fill the screen height and stay in view while the details
        // scroll; the taller profile card keeps its natural height and scrolls with the page.
        active === "profile"
          ? ""
          : "lg:sticky lg:top-[calc(var(--header-h)+clamp(1.25rem,3svh,2.5rem))] lg:h-[calc(100svh-var(--header-h)-var(--topbar-h)-2*clamp(1.25rem,3svh,2.5rem))]"
      }`}
    >
      {active === "profile" ? (
        <div key="profile" className="rise-in">
          <FragranceProfile product={product} wear={wear} />
        </div>
      ) : (
        <div className="relative aspect-[4/5] w-full overflow-hidden border border-line lg:aspect-auto lg:min-h-0 lg:flex-1">
          <div className={`absolute inset-0 ${active === "detail" ? "hidden" : ""}`}>
            <Bottle
              item={product}
              priority
              inset="8% 14% 6%"
              sizes="(min-width: 1024px) 45vw, 100vw"
              morph={`bottle-${product.slug}`}
            />
          </div>

          {active === "detail" ? (
            <div key="detail" className="rise-in absolute inset-0">
              <Bottle
                item={product}
                inset="-25% -10% -45%"
                sizes="(min-width: 1024px) 70vw, 140vw"
                shadow={false}
              />
            </div>
          ) : null}

          <span className="absolute bottom-4 left-4 z-10 rounded-full bg-paper/85 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-stone backdrop-blur-sm">
            Representative image
          </span>
        </div>
      )}

      <div role="group" aria-label="Product views" className="grid grid-cols-3 gap-3">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            aria-pressed={active === view.id}
            aria-label={`Show ${view.label.toLowerCase()} view of ${product.name}`}
            onClick={() => setActive(view.id)}
            className={`group overflow-hidden border transition-[border-color,transform] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 ${
              active === view.id ? "border-charcoal" : "border-line hover:border-charcoal/40"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[clamp(3.25rem,8svh,6rem)]">
              {view.id === "profile" ? (
                <div
                  className="flex h-full flex-col justify-center gap-2 px-4"
                  style={{ backgroundColor: product.visual.wash }}
                >
                  <div className="flex gap-1">
                    {["#8FA8C2", "#A3BC8A", "#E2B657", "#C47A4F"].map((color) => (
                      <span key={color} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full">
                    <span className="w-3/5 bg-[#EADCB0]" />
                    <span className="flex-1 bg-noir-soft" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...product.notes.top, ...product.notes.heart].slice(0, 3).map((note) => (
                      <span key={note} className="h-2 w-6 rounded-full bg-charcoal/15" />
                    ))}
                  </div>
                </div>
              ) : (
                <Bottle
                  item={product}
                  inset={view.id === "detail" ? "-25% -10% -45%" : "8% 18% 6%"}
                  sizes="160px"
                  shadow={false}
                />
              )}
            </div>
            <span className="block border-t border-line bg-paper py-[clamp(0.3rem,0.9svh,0.5rem)] text-[11px] uppercase tracking-[0.16em] text-stone transition-colors group-hover:text-charcoal">
              {view.label === "Profile" ? "Profile & notes" : view.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
