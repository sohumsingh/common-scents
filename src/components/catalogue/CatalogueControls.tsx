"use client";

import { useRestoreFocus } from "@/hooks/useRestoreFocus";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { CatalogueFilters, Gender, OccasionSlug, SortKey } from "@/lib/types";
import { buildQueryString, SORT_OPTIONS, toggleValue } from "@/lib/catalogue/query";
import { Portal } from "@/components/ui/Portal";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  hint?: string;
};

export type FacetGroup = {
  id: "occasion" | "brand" | "gender" | "price";
  title: string;
  options: FacetOption[];
  collapsible?: boolean;
};

export type CatalogueState = {
  filters: CatalogueFilters;
  sort: SortKey;
  groups: FacetGroup[];
  total: number;
  resultCount: number;
  basePath: string;
  baseParams: Record<string, string>;
};

type ControlsContextValue = {
  state: CatalogueState;
  isPending: boolean;
  toggle: (groupId: FacetGroup["id"], value: string) => void;
  setSort: (sort: SortKey) => void;
  clearAll: () => void;
  removeChip: (key: string) => void;
  selectedFor: (groupId: FacetGroup["id"]) => string[];
};

const ControlsContext = createContext<ControlsContextValue | null>(null);

export function CatalogueControlsProvider({
  state,
  children,
}: {
  state: CatalogueState;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { filters, sort, basePath, baseParams } = state;

  const navigate = useCallback(
    (nextFilters: CatalogueFilters, nextSort: SortKey) => {
      const query = buildQueryString(nextFilters, nextSort, baseParams);
      startTransition(() => {
        router.push(`${basePath}${query}`, { scroll: false });
      });
    },
    [basePath, baseParams, router],
  );

  const toggle = useCallback(
    (groupId: FacetGroup["id"], value: string) => {
      const next: CatalogueFilters = { ...filters };
      if (groupId === "occasion") {
        next.occasions = toggleValue(filters.occasions, value) as OccasionSlug[];
      } else if (groupId === "brand") {
        next.brands = toggleValue(filters.brands, value);
      } else if (groupId === "gender") {
        next.genders = toggleValue(filters.genders, value) as Gender[];
      } else {
        next.priceBuckets = toggleValue(filters.priceBuckets, value);
      }
      navigate(next, sort);
    },
    [filters, sort, navigate],
  );

  const setSort = useCallback(
    (value: SortKey) => navigate(filters, value),
    [filters, navigate],
  );

  const clearAll = useCallback(
    () => navigate({ occasions: [], brands: [], genders: [], priceBuckets: [], query: "" }, sort),
    [navigate, sort],
  );

  const removeChip = useCallback(
    (key: string) => {
      const next: CatalogueFilters = { ...filters };
      if (key.startsWith("occasion:")) {
        next.occasions = filters.occasions.filter((item) => item !== key.slice(9));
      } else if (key.startsWith("brand:")) {
        next.brands = filters.brands.filter((item) => item !== key.slice(6));
      } else if (key.startsWith("gender:")) {
        next.genders = filters.genders.filter((item) => item !== key.slice(7));
      } else if (key.startsWith("price:")) {
        next.priceBuckets = filters.priceBuckets.filter((item) => item !== key.slice(6));
      } else if (key === "query") {
        next.query = "";
      }
      navigate(next, sort);
    },
    [filters, sort, navigate],
  );

  const selectedFor = useCallback(
    (groupId: FacetGroup["id"]) => {
      if (groupId === "occasion") return filters.occasions;
      if (groupId === "brand") return filters.brands;
      if (groupId === "gender") return filters.genders;
      return filters.priceBuckets;
    },
    [filters],
  );

  const value = useMemo<ControlsContextValue>(
    () => ({ state, isPending, toggle, setSort, clearAll, removeChip, selectedFor }),
    [state, isPending, toggle, setSort, clearAll, removeChip, selectedFor],
  );

  return <ControlsContext.Provider value={value}>{children}</ControlsContext.Provider>;
}

export function useCatalogueControls(): ControlsContextValue {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useCatalogueControls must be used inside <CatalogueControlsProvider>.");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*  Facet panel                                                               */
/* -------------------------------------------------------------------------- */

function FacetCheckbox({
  option,
  checked,
  onChange,
}: {
  option: FacetOption;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <label className="group flex cursor-pointer items-center gap-3 py-1.5">
        <span className="relative grid h-4 w-4 shrink-0 place-items-center">
          <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
          <span
            aria-hidden="true"
            className={`grid h-4 w-4 place-items-center border transition-all duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep ${
              checked
                ? "border-charcoal bg-charcoal"
                : "border-line-strong bg-paper group-hover:border-charcoal/50"
            }`}
          >
            {checked ? (
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-ivory" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
        </span>

        <span className="flex-1 text-[13px] leading-snug text-ink transition-colors group-hover:text-charcoal">
          {option.label}
          {option.hint ? <span className="block text-[11px] text-muted">{option.hint}</span> : null}
        </span>

        <span className="text-[11px] tabular-nums text-muted">{option.count}</span>
      </label>
    </li>
  );
}

function FacetSection({
  group,
  selected,
  onToggle,
}: {
  group: FacetGroup;
  selected: string[];
  onToggle: (groupId: FacetGroup["id"], value: string) => void;
}) {
  const [expanded, setExpanded] = useState(!group.collapsible);
  const visible = expanded ? group.options : group.options.slice(0, 6);

  return (
    <section className="border-b border-line pb-6 pt-6 first:pt-0">
      <h3 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">{group.title}</h3>

      <ul className="mt-4 flex flex-col">
        {visible.map((option) => (
          <FacetCheckbox
            key={option.value}
            option={option}
            checked={selected.includes(option.value)}
            onChange={() => onToggle(group.id, option.value)}
          />
        ))}
      </ul>

      {group.collapsible && group.options.length > 6 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-[11px] uppercase tracking-[0.16em] text-stone underline-offset-4 transition-colors hover:text-charcoal hover:underline"
        >
          {expanded ? "Show less" : `Show all ${group.options.length}`}
        </button>
      ) : null}
    </section>
  );
}

export function FilterSidebar() {
  const { state, toggle, clearAll, selectedFor } = useCatalogueControls();

  const activeCount =
    state.filters.occasions.length +
    state.filters.brands.length +
    state.filters.genders.length +
    state.filters.priceBuckets.length;

  return (
    <aside className="hidden lg:block">
      <div className="scrollbar-quiet sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100svh-var(--header-h)-3rem)] overflow-y-auto pr-3">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">Refine</h2>
        <div className="mt-4">
          {state.groups.map((group) => (
            <FacetSection
              key={group.id}
              group={group}
              selected={selectedFor(group.id)}
              onToggle={toggle}
            />
          ))}
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 text-[11px] uppercase tracking-[0.16em] text-stone underline-offset-4 transition-colors hover:text-charcoal hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                   */
/* -------------------------------------------------------------------------- */

export function CatalogueToolbar() {
  const { state, setSort, isPending } = useCatalogueControls();
  const { sort, resultCount, total } = state;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <p
        className={`text-[11px] uppercase tracking-[0.16em] text-stone transition-opacity duration-300 ${
          isPending ? "opacity-40" : "opacity-100"
        }`}
        aria-live="polite"
      >
        {resultCount} {resultCount === 1 ? "fragrance" : "fragrances"}
        {resultCount !== total ? <span className="text-muted"> of {total}</span> : null}
      </p>

      <div className="flex items-center gap-2.5">
        <label htmlFor="catalogue-sort" className="text-[11px] uppercase tracking-[0.16em] text-muted">
          Sort
        </label>
        <div className="relative">
          <select
            id="catalogue-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="appearance-none border border-line bg-paper py-2.5 pl-4 pr-9 text-[12px] text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal/30"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-stone"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Active filter chips                                                       */
/* -------------------------------------------------------------------------- */

export function ActiveFilterChips({
  chips,
}: {
  chips: { key: string; label: string; value: string }[];
}) {
  const { removeChip, clearAll } = useCatalogueControls();

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip.key)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] tracking-[0.04em] text-ink transition-colors hover:border-charcoal/40 hover:text-charcoal"
        >
          <span className="text-muted">{chip.label}</span>
          <span>{chip.value}</span>
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-1 text-[11px] uppercase tracking-[0.16em] text-stone underline-offset-4 transition-colors hover:text-charcoal hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile filter drawer                                                      */
/* -------------------------------------------------------------------------- */

export function MobileFilters() {
  const { state, toggle, clearAll, selectedFor } = useCatalogueControls();
  const [open, setOpen] = useState(false);
  useRestoreFocus(open);

  const activeCount =
    state.filters.occasions.length +
    state.filters.brands.length +
    state.filters.genders.length +
    state.filters.priceBuckets.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border border-line bg-paper px-5 py-3.5 text-[11px] uppercase tracking-[0.16em] text-charcoal lg:hidden"
      >
        <span>Filter & refine</span>
        <span className="flex items-center gap-2 text-gold-deep">
          {activeCount > 0 ? (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-charcoal text-[11px] text-ivory">
              {activeCount}
            </span>
          ) : null}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <Portal>
        <div
          className={`fixed inset-0 z-[85] overflow-hidden lg:hidden ${open ? "" : "pointer-events-none"}`}
          inert={!open}
        >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal={open}
          aria-label="Filter fragrances"
          className={`scrollbar-quiet absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">Filter & refine</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-stone transition-colors hover:bg-parchment hover:text-charcoal"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="px-5 pb-6">
            {state.groups.map((group) => (
              <FacetSection
                key={group.id}
                group={group}
                selected={selectedFor(group.id)}
                onToggle={toggle}
              />
            ))}
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line bg-paper px-5 py-4">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 border border-charcoal/25 px-4 py-3.5 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 bg-charcoal px-4 py-3.5 text-[11px] uppercase tracking-[0.16em] text-ivory"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
      </Portal>
    </>
  );
}
