import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminHeader, AdminSkeleton, LOW_STOCK } from "@/components/admin/AdminUI";
import { StockForm, type StockRow } from "@/components/admin/AdminForms";

export const metadata: Metadata = { title: "Stock & prices" };

async function StockTable() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("products")
    .select("id, full_name, is_published, brands(name), product_variants(id, size, price_zar, stock_quantity, sort_order)")
    .order("sort_order");

  type Product = {
    id: string;
    full_name: string;
    is_published: boolean;
    brands: { name: string } | null;
    product_variants: { id: string; size: string; price_zar: number; stock_quantity: number | null; sort_order: number }[];
  };

  const rows: StockRow[] = ((data ?? []) as unknown as Product[]).flatMap((product) =>
    [...product.product_variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        productId: product.id,
        productName: product.full_name,
        brand: product.brands?.name ?? "",
        isPublished: product.is_published,
        variantId: variant.id,
        size: variant.size,
        price: variant.price_zar,
        stock: variant.stock_quantity,
      })),
  );

  return <StockForm rows={rows} />;
}

export default function StockPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Stock & prices"
        description={`Update every size in one go. Leave stock empty if you don't want to track it for a size. Sizes at ${LOW_STOCK} or fewer are highlighted, and each fragrance's “in stock / low / sold out” status updates automatically when you save.`}
      />
      <Suspense fallback={<AdminSkeleton rows={12} />}>
        <StockTable />
      </Suspense>
    </div>
  );
}
