/**
 * The search box on the search results page. A plain GET form, so it works
 * before any JavaScript loads and keeps the query in the address bar.
 */
export function SearchForm({ query = "" }: { query?: string }) {
  return (
    <form action="/search" method="get" role="search" className="mb-10 flex max-w-xl gap-3">
      <label htmlFor="search-page-query" className="sr-only">
        Search fragrances
      </label>
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" strokeLinecap="round" />
        </svg>
        <input
          id="search-page-query"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Name, house or note — “vanilla”, “YSL”, “oud”"
          className="h-12 w-full border border-line bg-paper pl-11 pr-4 text-[15px] text-charcoal transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:border-gold-deep focus:shadow-[0_2px_0_0_var(--color-gold)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="sheen h-12 shrink-0 bg-charcoal px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:bg-noir"
      >
        Search
      </button>
    </form>
  );
}
