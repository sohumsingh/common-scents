import type { ReactNode } from "react";
import { LOW_STOCK } from "@/lib/catalogue/stock";

export { LOW_STOCK };

/** Shared, presentational pieces for the admin pages (server-safe). */

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] leading-tight text-charcoal">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = "plain",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "plain" | "attention";
}) {
  return (
    <div className={`border p-5 ${tone === "attention" ? "border-gold/50 bg-gold/8" : "border-line bg-paper"}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone">{label}</p>
      <p className="mt-2 font-display text-[2.2rem] leading-none tabular-nums text-charcoal">{value}</p>
      {detail ? <p className="mt-2 text-[12px] leading-relaxed text-muted">{detail}</p> : null}
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-line bg-paper">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "muted" }) {
  const tones = {
    neutral: "border-line bg-parchment/60 text-stone",
    good: "border-emerald-800/20 bg-emerald-800/[0.06] text-emerald-900",
    warn: "border-gold/50 bg-gold/10 text-gold-deep",
    muted: "border-line bg-transparent text-muted",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const adminInput =
  "h-11 w-full border border-line bg-paper px-3 text-[14px] text-charcoal transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:border-gold-deep focus:shadow-[0_2px_0_0_var(--color-gold)] focus:outline-none";

export const adminLabel = "text-[11px] uppercase tracking-[0.16em] text-stone";

export const adminButton =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-charcoal px-5 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-noir disabled:cursor-wait disabled:opacity-60";

export const adminButtonQuiet =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-charcoal/25 px-4 text-[11px] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory disabled:opacity-50";

export function AdminSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-3">
      <div className="h-9 w-64 animate-pulse bg-parchment/80" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 w-full animate-pulse bg-parchment/50" />
      ))}
    </div>
  );
}

/** Stock for one size: a number, or "unconfirmed" while the supplier hasn't said. */
export function StockText({ quantity }: { quantity: number | null }) {
  if (quantity === null) return <span className="text-muted">Unconfirmed</span>;
  if (quantity === 0) return <span className="text-red-800">Sold out</span>;
  if (quantity <= LOW_STOCK) return <span className="text-gold-deep">{quantity} left</span>;
  return <span className="tabular-nums text-charcoal">{quantity}</span>;
}

