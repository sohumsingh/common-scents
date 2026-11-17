"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Occasion } from "@/lib/types";

/**
 * Occasion dropdown used at the medium breakpoint, where there is not enough
 * room to show every collection inline.
 */
export function OccasionsMenu({ occasions }: { occasions: Occasion[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-gold-deep"
      >
        Occasions
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-1/2 top-full z-50 w-[19rem] -translate-x-1/2 border border-line bg-paper p-2 shadow-[0_28px_60px_-40px_rgba(41,39,37,0.5)]">
          <ul>
            {occasions.map((occasion) => (
              <li key={occasion.slug}>
                <Link
                  href={`/collections/${occasion.slug}`}
                  onClick={() => setOpen(false)}
                  className="group/item flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-parchment/60"
                >
                  <span className="font-display text-lg leading-none text-charcoal transition-colors group-hover/item:text-gold-deep">
                    {occasion.name}
                  </span>
                  <span className="text-[11px] leading-snug text-muted">{occasion.question}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
