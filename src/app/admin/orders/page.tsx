import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders";
import { ORDER_STATUS, type OrderStatus } from "@/lib/checkout";
import { formatZAR } from "@/lib/format";
import { OrderStatusPill } from "@/components/orders/OrderView";
import { AdminHeader, AdminSkeleton } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Orders" };

const placed = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const FILTERS: { value?: OrderStatus; label: string }[] = [
  { label: "All" },
  { value: "paid", label: ORDER_STATUS.paid.label },
  { value: "processing", label: ORDER_STATUS.processing.label },
  { value: "shipped", label: ORDER_STATUS.shipped.label },
  { value: "delivered", label: ORDER_STATUS.delivered.label },
  { value: "cancelled", label: ORDER_STATUS.cancelled.label },
];

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = FILTERS.find((filter) => filter.value && filter.value === params.status)?.value;
  const orders = await listOrders(supabase, { status });

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.value === status;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders"}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 text-[12px] transition-colors ${
                active ? "border-charcoal bg-charcoal text-ivory" : "border-line bg-paper text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <p className="border border-line bg-paper px-5 py-8 text-center text-[14px] text-stone">
          {status ? `No orders are "${ORDER_STATUS[status].label.toLowerCase()}" right now.` : "No orders yet. They appear here as soon as someone checks out."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[46rem] text-left text-[14px]">
            <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-stone">
              <tr>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Placed</th>
                <th className="px-4 py-3 font-normal">Items</th>
                <th className="px-4 py-3 text-right font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-parchment/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.order_number}`} className="text-charcoal underline decoration-gold/50 underline-offset-4 hover:decoration-charcoal">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-charcoal">{order.full_name}</span>
                    <span className="block text-[12px] text-muted">{order.email}</span>
                  </td>
                  <td className="px-4 py-3 text-stone">{placed.format(new Date(order.created_at))}</td>
                  <td className="px-4 py-3 tabular-nums text-stone">{order.item_count}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-charcoal">{formatZAR(order.total_zar)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusPill status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Orders"
        description="Every order placed through the demo checkout. Open one to move it along or cancel it. Cancelling puts the stock back."
      />
      <Suspense fallback={<AdminSkeleton rows={6} />}>
        <Orders searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
