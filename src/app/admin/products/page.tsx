import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { setPublished } from "../actions";
import { formatZAR } from "@/lib/format";
import { AdminHeader, AdminSkeleton, LOW_STOCK, Pill, adminButton, adminInput } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Products" };

type Row = {
  id: string;
  slug: string;
  full_name: string;
  brand_slug: string;
  is_published: boolean;
  image_src: string | null;
  visual_wash: string;
  trending_rank: number | null;
  editorial_badge: string | null;
  brands: { name: string } | null;
  product_variants: { price_zar: number; stock_quantity: number | null }[];
};

async function ProductTable({ searchParams }: { searchParams: PageProps<"/admin/products">["searchParams"] }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().toLowerCase();
  const show = typeof params.show === "string" ? params.show : "all";

  const { data } = await supabase
    .from("products")
    .select("id, slug, full_name, brand_slug, is_published, image_src, visual_wash, trending_rank, editorial_badge, brands(name), product_variants(price_zar, stock_quantity)")
    .order("sort_order");

  const rows = ((data ?? []) as unknown as Row[]).filter((row) => {
    if (show === "published" && !row.is_published) return false;
    if (show === "hidden" && row.is_published) return false;
    if (!query) return true;
    return `${row.full_name} ${row.brands?.name ?? ""}`.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col gap-6">
      {params.deleted ? <p className="border border-line bg-paper px-4 py-3 text-[14px] text-stone">The fragrance was deleted.</p> : null}

      <form className="flex flex-wrap items-center gap-3" role="search">
        <input name="q" defaultValue={query} placeholder="Search by name or brand" className={`${adminInput} max-w-xs`} aria-label="Search products" />
        <select name="show" defaultValue={show} className={`${adminInput} w-auto`} aria-label="Show">
          <option value="all">All fragrances</option>
          <option value="published">On the shop</option>
          <option value="hidden">Hidden</option>
        </select>
        <button type="submit" className="min-h-11 border border-charcoal/25 px-4 text-[11px] uppercase tracking-[0.16em] text-charcoal hover:border-charcoal">
          Filter
        </button>
        <span className="ml-auto text-[13px] text-muted">{rows.length} shown</span>
      </form>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[46rem] text-left text-[14px]">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-3 font-normal">Fragrance</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Stock</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const prices = row.product_variants.map((variant) => variant.price_zar);
              const stocks = row.product_variants.map((variant) => variant.stock_quantity);
              const known = stocks.filter((stock): stock is number => stock !== null);
              const lowest = prices.length ? Math.min(...prices) : 0;
              const highest = prices.length ? Math.max(...prices) : 0;
              return (
                <tr key={row.id} className={row.is_published ? "" : "bg-parchment/30"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden border border-line" style={{ backgroundColor: row.visual_wash }}>
                        {row.image_src ? <Image src={row.image_src} alt="" fill sizes="40px" className="object-contain p-1 mix-blend-multiply" /> : null}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/products/${row.id}`} className="block truncate text-charcoal hover:text-gold-deep">
                          {row.full_name}
                        </Link>
                        <span className="block text-[12px] text-muted">{row.brands?.name ?? row.brand_slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-charcoal">
                    {lowest === highest ? formatZAR(lowest) : `${formatZAR(lowest)} – ${formatZAR(highest)}`}
                    <span className="block text-[12px] text-muted">{prices.length} size{prices.length === 1 ? "" : "s"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {known.length < stocks.length ? (
                      <span className="text-muted">Unconfirmed</span>
                    ) : known.some((stock) => stock <= LOW_STOCK) ? (
                      <span className="text-gold-deep">{known.reduce((a, b) => a + b, 0)} · low</span>
                    ) : (
                      <span className="tabular-nums">{known.reduce((a, b) => a + b, 0)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-1.5">
                      {row.is_published ? <Pill tone="good">On the shop</Pill> : <Pill tone="muted">Hidden</Pill>}
                      {row.trending_rank ? <Pill>Trending #{row.trending_rank}</Pill> : null}
                      {row.editorial_badge ? <Pill tone="warn">{row.editorial_badge}</Pill> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <form action={setPublished}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="publish" value={row.is_published ? "false" : "true"} />
                        <button type="submit" className="min-h-11 text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
                          {row.is_published ? "Hide" : "Show"}
                        </button>
                      </form>
                      <Link href={`/admin/products/${row.id}`} className="min-h-11 content-center text-[12px] text-charcoal underline decoration-gold/60 underline-offset-4">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="px-4 py-10 text-center text-[14px] text-stone">No fragrances match.</p> : null}
      </div>
    </div>
  );
}

export default function AdminProductsPage(props: PageProps<"/admin/products">) {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Products"
        description="Every fragrance in the catalogue, including hidden ones. Hiding takes a fragrance off the shop without deleting it."
        action={
          <Link href="/admin/products/new" className={adminButton}>
            Add a fragrance
          </Link>
        }
      />
      <Suspense fallback={<AdminSkeleton rows={8} />}>
        <ProductTable searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
