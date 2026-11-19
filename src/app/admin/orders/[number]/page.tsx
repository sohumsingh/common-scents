import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getOrder } from "@/lib/orders";
import { ORDER_STATUS, ORDER_STEPS } from "@/lib/checkout";
import { setOrderStatus } from "../../actions";
import { OrderDetails, OrderProgress, OrderStatusPill, orderDate } from "@/components/orders/OrderView";
import { AdminHeader, AdminSkeleton, adminButton, adminButtonQuiet } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Order" };

/**
 * The page frame (header, footer) is prepared at build time from one example
 * address; the order itself is always loaded live for whoever is signed in.
 */
export async function generateStaticParams() {
  return [{ number: "CS-100101" }];
}

async function AdminOrder({ params, searchParams }: PageProps<"/admin/orders/[number]">) {
  const { supabase } = await requireAdmin();
  const [{ number }, query] = await Promise.all([params, searchParams]);
  const order = await getOrder(supabase, number);
  if (!order) notFound();

  const cancelled = order.status === "cancelled";
  const next = ORDER_STEPS[ORDER_STEPS.indexOf(order.status) + 1];
  const canCancel = !cancelled && order.status !== "delivered";

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title={order.order_number}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <OrderStatusPill status={order.status} />
            <span>
              {order.full_name} · {order.email} · placed {orderDate.format(new Date(order.created_at))}
            </span>
          </span>
        }
        action={
          <Link href="/admin/orders" className={adminButtonQuiet}>
            ← All orders
          </Link>
        }
      />

      {typeof query.error === "string" ? (
        <p role="alert" className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[14px] text-red-900">
          {query.error}
        </p>
      ) : query.updated ? (
        <p role="status" className="border border-emerald-800/20 bg-emerald-800/[0.05] px-4 py-3 text-[14px] text-emerald-900">
          Order updated. The customer sees the new status on their order page.
        </p>
      ) : null}

      <section className="border border-line bg-paper p-5 sm:p-6">
        <OrderProgress status={order.status} />
        {cancelled ? null : (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            {next ? (
              <form action={setOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="number" value={order.order_number} />
                <input type="hidden" name="status" value={next} />
                <button type="submit" className={adminButton}>
                  Mark as {ORDER_STATUS[next].label.toLowerCase()}
                </button>
              </form>
            ) : (
              <p className="text-[14px] text-stone">This order is complete.</p>
            )}
            {canCancel && !query.confirmCancel ? (
              <Link href={`/admin/orders/${order.order_number}?confirmCancel=1`} className={adminButtonQuiet}>
                Cancel order
              </Link>
            ) : null}
          </div>
        )}

        {canCancel && query.confirmCancel ? (
          <form action={setOrderStatus} className="mt-5 border border-red-800/25 bg-red-800/[0.03] p-4">
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="number" value={order.order_number} />
            <input type="hidden" name="status" value="cancelled" />
            <input type="hidden" name="confirm" value="cancel" />
            <p className="text-[14px] text-red-900">
              Cancel {order.order_number}? Any stock it used goes back on the shop. A cancelled order can&apos;t be reopened.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" className="inline-flex min-h-11 items-center bg-red-900 px-5 text-[11px] uppercase tracking-[0.18em] text-ivory hover:bg-red-950">
                Yes, cancel it
              </button>
              <Link href={`/admin/orders/${order.order_number}`} className={adminButtonQuiet}>
                Keep it
              </Link>
            </div>
          </form>
        ) : null}
      </section>

      <section className="border border-line bg-paper p-5 sm:p-6">
        <OrderDetails order={order} linkProducts={false} />
      </section>
    </div>
  );
}

export default function AdminOrderPage(props: PageProps<"/admin/orders/[number]">) {
  return (
    <Suspense fallback={<AdminSkeleton rows={5} />}>
      <AdminOrder {...props} />
    </Suspense>
  );
}
