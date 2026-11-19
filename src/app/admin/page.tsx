import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders";
import { OrderStatusPill } from "@/components/orders/OrderView";
import { formatZAR } from "@/lib/format";
import { AdminHeader, AdminSkeleton, LOW_STOCK, Panel, Pill, StatCard, adminButton } from "@/components/admin/AdminUI";

const dateTime = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

async function Overview() {
  const { supabase, user } = await requireAdmin();

  const [products, variants, brands, profiles, orders] = await Promise.all([
    supabase.from("products").select("id, full_name, brand_slug, is_published, updated_at").order("updated_at", { ascending: false }),
    supabase.from("product_variants").select("product_id, stock_quantity"),
    supabase.from("brands").select("slug", { count: "exact", head: true }),
    supabase.from("profiles").select("full_name, email, role, created_at").order("created_at", { ascending: false }),
    listOrders(supabase),
  ]);
  const live = orders.filter((order) => order.status !== "cancelled");
  const toSend = orders.filter((order) => order.status === "paid" || order.status === "processing").length;
  const sales = live.reduce((sum, order) => sum + order.total_zar, 0);

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Orders to send"
          value={toSend}
          detail={`paid or being prepared · ${orders.length} order${orders.length === 1 ? "" : "s"} in total`}
          tone={toSend > 0 ? "attention" : "plain"}
        />
        <StatCard label="Sales (demo)" value={formatZAR(sales)} detail={`from ${live.length} order${live.length === 1 ? "" : "s"}, excluding cancelled`} />
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

      <Panel
        title="Latest orders"
        action={
          <Link href="/admin/orders" className="text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
            All orders
          </Link>
        }
      >
        {orders.length === 0 ? (
          <p className="text-[14px] text-stone">No orders yet. They appear here as soon as someone checks out.</p>
        ) : (
          <ul className="divide-y divide-line">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.order_number}`} className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                  <span className="min-w-0">
                    <span className="text-[14px] text-charcoal group-hover:text-gold-deep">{order.order_number}</span>
                    <span className="ml-3 text-[12px] text-muted">{order.full_name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
                    <span className="tabular-nums text-charcoal">{formatZAR(order.total_zar)}</span>
                    <OrderStatusPill status={order.status} />
                    {dateTime.format(new Date(order.created_at))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

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
