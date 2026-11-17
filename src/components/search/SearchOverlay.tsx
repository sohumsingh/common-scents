"use client";

import { useRestoreFocus } from "@/hooks/useRestoreFocus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchIndexEntry } from "@/lib/catalogue/service";
import { formatFromPrice } from "@/lib/format";
import { matchesSearchText } from "@/lib/catalogue/search";
import { Portal } from "@/components/ui/Portal";
import { Bottle } from "@/components/product/Bottle";

export function SearchOverlay({
  index,
  open,
  onClose,
}: {
  index: SearchIndexEntry[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useRestoreFocus(open);

  // Resetting the query belongs with closing the overlay, not in an effect.
  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 5);
    return index.filter((entry) => matchesSearchText(entry.searchText, query)).slice(0, 6);
  }, [index, query]);

  const goToSearch = () => {
    const target = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
    close();
    router.push(target);
  };

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-[90] overflow-hidden ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close search"
          onClick={close}
          className={`absolute inset-0 bg-charcoal/40 backdrop-blur-[3px] transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal={open}
          aria-label="Search fragrances"
          className={`relative mx-auto mt-[12svh] w-[92%] max-w-2xl overflow-hidden border border-line bg-paper shadow-[0_40px_90px_-50px_rgba(41,39,37,0.6)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-stone"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToSearch();
              }}
              placeholder="Search by fragrance, brand, note or occasion…"
              className="w-full bg-transparent text-[0.95rem] text-charcoal placeholder:text-muted focus:outline-none"
              aria-label="Search fragrances"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-charcoal"
            >
              Esc
            </button>
          </div>

          <div className="scrollbar-quiet max-h-[52svh] overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-stone">
                No fragrances match “{query}”. Try a brand, a note or an occasion.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {results.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/shop/${entry.slug}`}
                      onClick={close}
                      className="group flex items-center gap-4 px-5 py-3 transition-colors duration-200 hover:bg-parchment/50"
                    >
                      <span className="h-14 w-11 shrink-0 overflow-hidden border border-line">
                        <Bottle item={entry} inset="8% 10% 5%" sizes="44px" shadow={false} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-gold-deep">
                          {entry.brand}
                        </span>
                        <span className="mt-0.5 block truncate font-display text-lg text-charcoal">
                          {entry.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] tabular-nums text-stone">
                        {formatFromPrice(entry.variants)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={goToSearch}
              className="text-[11px] uppercase tracking-[0.18em] text-gold-deep underline-offset-4 transition-colors hover:underline"
            >
              {query.trim() ? "See all results" : "Browse the full catalogue"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
