import { cacheLife } from "next/cache";

/**
 * The current year, cached so it can be prerendered safely.
 *
 * Next.js Cache Components treats `new Date()` during prerender as an
 * unstable value, so the lookup is wrapped in a cached scope with a daily
 * lifetime. The copyright line therefore stays correct without forcing the
 * footer out of the static shell.
 */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
