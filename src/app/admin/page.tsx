import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminHeader, AdminSkeleton, LOW_STOCK, Panel, Pill, StatCard, adminButton } from "@/components/admin/AdminUI";

const dateTime = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

async function Overview() {
  const { supabase, user } = await requireAdmin();

  const [products, variants, brands, profiles] = await Promise.all([
    supabase.from("products").select("id, full_name, brand_slug, is_published, updated_at").order("updated_at", { ascending: false }),
    supabase.from("product_variants").select("product_id, stock_quantity"),
    supabase.from("brands").select("slug", { count: "exact", head: true }),
    supabase.from("profiles").select("full_name, email, role, created_at").order("created_at", { ascending: false }),
  ]);

  const productRows = products.data ?? [];
  const variantRows = variants.data ?? [];
  const people = profiles.data ?? [];
  const published = productRows.filter((product) => product.is_published).length;
  const unconfirmed = variantRows.filter((variant) => variant.stock_quantity === null).length;
  const low = variantRows.filter((variant) => variant.stock_quantity !== null && variant.stock_quantity <= LOW_STOCK).length;
  const admins = people.filter((person) => person.role === "admin").length;

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title={`Welcome, ${user.fullName.split(" ")[0] || "admin"}.`}
        description="Everything on the shop comes from here. Changes you save appear on the site straight away."
        action={
          <Link href="/admin/products/new" className={adminButton}>
            Add a fragrance
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Fragrances" value={productRows.length} detail={`${published} on the shop · ${productRows.length - published} hidden`} />
        <StatCard
          label="Stock to confirm"
          value={unconfirmed}
          detail={`of ${variantRows.length} sizes have no stock figure yet`}
          tone={unconfirmed > 0 ? "attention" : "plain"}
        />
        <StatCard label="Low or sold out" value={low} detail={`sizes at ${LOW_STOCK} or fewer`} tone={low > 0 ? "attention" : "plain"} />
        <StatCard label="Customers" value={people.length} detail={`${admins} admin${admins === 1 ? "" : "s"} · ${brands.count ?? 0} brands`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recently edited"
          action={
            <Link href="/admin/products" className="text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
              All products
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {productRows.slice(0, 6).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 py-2.5">
                <Link href={`/admin/products/${product.id}`} className="min-w-0 truncate text-[14px] text-charcoal hover:text-gold-deep">
                  {product.full_name}
                </Link>
                <span className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
                  {product.is_published ? null : <Pill tone="muted">Hidden</Pill>}
                  {dateTime.format(new Date(product.updated_at))}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Newest customers"
          action={
            <Link href="/admin/customers" className="text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
              All customers
            </Link>
          }
        >
          {people.length === 0 ? (
            <p className="text-[14px] text-stone">No sign-ups yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {people.slice(0, 6).map((person) => (
                <li key={person.email} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] text-charcoal">{person.full_name || "—"}</span>
                    <span className="block truncate text-[12px] text-muted">{person.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
                    {person.role === "admin" ? <Pill tone="warn">Admin</Pill> : null}
                    {dateTime.format(new Date(person.created_at))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function AdminHome() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}
