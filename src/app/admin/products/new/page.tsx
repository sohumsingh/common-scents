import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { productFormOptions } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeader, AdminSkeleton } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Add a fragrance" };

async function NewProduct() {
  const { supabase } = await requireAdmin();
  const options = await productFormOptions(supabase);
  return <ProductForm brands={options.brands} occasions={options.occasions} />;
}

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Add a fragrance"
        description={
          <>
            Fill in what you know; you can come back to anything later. Brands are managed under{" "}
            <Link href="/admin/brands" className="underline decoration-gold/60 underline-offset-4">
              Brands
            </Link>
            .
          </>
        }
      />
      <Suspense fallback={<AdminSkeleton rows={10} />}>
        <NewProduct />
      </Suspense>
    </div>
  );
}
