"use client";

import { useState } from "react";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { CartButton } from "@/components/cart/CartButton";
import { AccountButton } from "@/components/account/AccountButton";
import { MobileNav } from "@/components/layout/MobileNav";
import type { SearchIndexEntry } from "@/lib/catalogue/service";

export function HeaderTools({
  searchIndex,
  navItems,
}: {
  searchIndex: SearchIndexEntry[];
  navItems: readonly { label: string; href: string }[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search fragrances"
          className="grid h-11 w-11 place-items-center text-charcoal transition-colors hover:text-gold-deep"
        >
          <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
        </button>

        <AccountButton />

        <CartButton />

        <MobileNav items={navItems} />
      </div>

      <SearchOverlay
        index={searchIndex}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
