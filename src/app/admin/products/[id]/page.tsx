import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { listProducts } from "@/lib/catalogue/service";
import { loadProductForEdit, productFormOptions } from "@/lib/admin/products";
import { deleteProduct } from "../../actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeader, AdminSkeleton, Pill, adminButtonQuiet } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Edit fragrance" };

/**
 * Known product ids, so the page frame (header, tab bar) can be prepared at
 * build time. The editor itself always loads live, behind the admin check;
 * products added later work too, rendered on request.
 */
export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ id: product.id }));
}

async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const [product, options] = await Promise.all([loadProductForEdit(supabase, id), productFormOptions(supabase)]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title={product.full_name}
        description={
          <span className="flex flex-wrap items-center gap-3">
            {product.is_published ? <Pill tone="good">On the shop</Pill> : <Pill tone="muted">Hidden</Pill>}
            {product.is_published ? (
              <Link href={`/shop/${product.slug}`} target="_blank" className="underline decoration-gold/60 underline-offset-4">
                View on the shop ↗
              </Link>
            ) : null}
          </span>
        }
        action={
          <Link href="/admin/products" className={adminButtonQuiet}>
            ← All products
          </Link>
        }
      />

      {query.saved ? (
        <p role="status" className="border border-emerald-800/20 bg-emerald-800/[0.05] px-4 py-3 text-[14px] text-emerald-900">
          Saved. The shop has been updated.
        </p>
      ) : null}

      <ProductForm product={product} brands={options.brands} occasions={options.occasions} />

      <section className="border border-red-800/20 p-6">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-red-900">Delete this fragrance</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-stone">
          Deleting removes it and its sizes for good, and drops it from shoppers&apos; bags. To take it off the shop for a while, untick
          “Show on the shop” instead.
        </p>
        {query.confirmDelete ? (
          <form action={deleteProduct} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="confirm" value="delete" />
            <span className="text-[14px] text-red-900">Delete {product.full_name} permanently?</span>
            <button type="submit" className="min-h-11 bg-red-900 px-5 text-[11px] uppercase tracking-[0.16em] text-ivory hover:bg-red-950">
              Yes, delete
            </button>
            <Link href={`/admin/products/${product.id}`} className="min-h-11 content-center px-3 text-[12px] text-stone underline-offset-4 hover:underline">
              Cancel
            </Link>
          </form>
        ) : (
          <form action={deleteProduct} className="mt-4">
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="min-h-11 border border-red-800/40 px-5 text-[11px] uppercase tracking-[0.16em] text-red-900 hover:bg-red-900 hover:text-ivory">
              Delete…
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton rows={10} />}>
      <EditProduct {...props} />
    </Suspense>
  );
}
