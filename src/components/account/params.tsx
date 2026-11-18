/** Shared helpers for the account pages. */

/** The page to return to after signing in: on this site only, else the account page. */
export function readNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

/** Placeholder shown for the instant before a form's details arrive. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-5">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <div className="h-3 w-28 animate-pulse bg-parchment/80" />
          <div className="mt-2 h-12 w-full animate-pulse bg-parchment/60" />
        </div>
      ))}
      <div className="h-12 w-full animate-pulse bg-parchment/80" />
    </div>
  );
}
