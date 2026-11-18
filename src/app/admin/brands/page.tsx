import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteBrand } from "../actions";
import { AdminHeader, AdminSkeleton, Panel } from "@/components/admin/AdminUI";
import { BrandForm, type BrandRow } from "@/components/admin/AdminForms";

export const metadata: Metadata = { title: "Brands" };

async function Brands({ searchParams }: { searchParams: PageProps<"/admin/brands">["searchParams"] }) {
  const { supabase } = await requireAdmin();
  const [{ data: brands }, { data: products }, params] = await Promise.all([
    supabase.from("brands").select("slug, name, family, sort_order").order("sort_order"),
    supabase.from("products").select("brand_slug"),
    searchParams,
  ]);

  const counts = new Map<string, number>();
  for (const product of products ?? []) counts.set(product.brand_slug, (counts.get(product.brand_slug) ?? 0) + 1);
  const rows: BrandRow[] = (brands ?? []).map((brand) => ({ ...brand, products: counts.get(brand.slug) ?? 0 }));

  return (
    <div className="flex flex-col gap-6">
      {params.inUse ? (
        <p role="alert" className="border border-gold/50 bg-gold/10 px-4 py-3 text-[14px] text-gold-deep">
          That brand still has fragrances. Move or delete them first.
        </p>
      ) : null}

      <Panel title="Add a brand">
        <BrandForm />
      </Panel>

      <Panel title={`All brands (${rows.length})`}>
        <ul className="divide-y divide-line">
          {rows.map((brand) => (
            <li key={brand.slug} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4 text-[12px] text-muted">
                <span>
                  {brand.products} fragrance{brand.products === 1 ? "" : "s"} · /shop?brand={brand.slug}
                </span>
                {brand.products === 0 ? (
                  <form action={deleteBrand}>
                    <input type="hidden" name="slug" value={brand.slug} />
                    <button type="submit" className="min-h-11 text-[12px] text-stone underline-offset-4 hover:text-red-800 hover:underline">
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
              <BrandForm brand={brand} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export default function BrandsPage(props: PageProps<"/admin/brands">) {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Brands"
        description="The houses in the catalogue. Order controls the brand ribbon and the shop's brand filter. A brand can only be deleted once no fragrance uses it."
      />
      <Suspense fallback={<AdminSkeleton rows={8} />}>
        <Brands searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
