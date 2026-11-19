import Link from "next/link";
import { Bottle } from "@/components/product/Bottle";
import { listProducts } from "@/lib/catalogue/service";
import { ORDER_STATUS, ORDER_STEPS, PAYMENT_LABELS, deliveryLabel, type OrderStatus } from "@/lib/checkout";
import { formatZAR } from "@/lib/format";
import type { Order } from "@/lib/orders";

export const orderDate = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusTone: Record<OrderStatus, string> = {
  paid: "border-gold/50 bg-gold/10 text-gold-deep",
  processing: "border-gold/50 bg-gold/10 text-gold-deep",
  shipped: "border-charcoal/20 bg-charcoal/[0.05] text-charcoal",
  delivered: "border-emerald-800/20 bg-emerald-800/[0.06] text-emerald-900",
  cancelled: "border-red-800/20 bg-red-800/[0.05] text-red-900",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] ${statusTone[status]}`}>
      {ORDER_STATUS[status].label}
    </span>
  );
}

/** Where the order is on its way: paid → being prepared → on its way → delivered. */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="text-[14px] text-red-900">{ORDER_STATUS.cancelled.customer}</p>;
  }
  const reached = ORDER_STEPS.indexOf(status);
  return (
    <div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
        {ORDER_STEPS.map((step, index) => {
          const done = index <= reached;
          return (
            <li key={step} aria-current={index === reached ? "step" : undefined}>
              <span className={`block h-1 rounded-full transition-colors ${done ? "bg-gold-deep" : "bg-line"}`} />
              <span className={`mt-2 block text-[11px] uppercase tracking-[0.12em] ${done ? "text-charcoal" : "text-muted"}`}>
                {ORDER_STATUS[step].label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[14px] text-stone">{ORDER_STATUS[status].customer}</p>
    </div>
  );
}

/** The order's lines, totals, delivery and payment. Shared by the account and the admin. */
export async function OrderDetails({ order, linkProducts = true }: { order: Order; linkProducts?: boolean }) {
  const products = new Map((await listProducts()).map((product) => [product.slug, product]));
  const address = [order.address_line1, order.address_line2, order.suburb, order.city, order.province, order.postal_code]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
          Items
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.order_items.map((line) => {
            const product = products.get(line.slug);
            const name = (
              <>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-gold-deep">{line.brand}</span>
                <span className="block font-display text-[1.1rem] leading-snug text-charcoal">{line.name}</span>
              </>
            );
            return (
              <li key={line.id} className="flex items-center gap-4 py-4">
                <div className="h-20 w-16 shrink-0 border border-line bg-paper">
                  {product ? <Bottle item={product} inset="8% 10% 5%" sizes="64px" shadow={false} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  {linkProducts && product ? (
                    <Link href={`/shop/${line.slug}`} className="block transition-opacity hover:opacity-70">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  <p className="mt-0.5 text-[12px] text-muted">
                    {line.variant_label} · {line.quantity} × {formatZAR(line.unit_price_zar)}
                  </p>
                </div>
                <p className="shrink-0 text-[14px] tabular-nums text-charcoal">{formatZAR(line.unit_price_zar * line.quantity)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="ml-auto mt-4 max-w-xs space-y-2 text-[14px]">
          <div className="flex justify-between text-stone">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-charcoal">{formatZAR(order.subtotal_zar)}</dd>
          </div>
          <div className="flex justify-between text-stone">
            <dt>Delivery</dt>
            <dd className="tabular-nums text-charcoal">{order.delivery_fee_zar === 0 ? "Free" : formatZAR(order.delivery_fee_zar)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-stone">Total</dt>
            <dd className="font-display text-[1.6rem] leading-none tabular-nums text-charcoal">{formatZAR(order.total_zar)}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-col gap-8">
        <section aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Delivery
          </h2>
          <p className="mt-3 text-[14px] text-charcoal">{deliveryLabel(order.delivery_method)}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-stone">
            {order.full_name}
            <br />
            {order.delivery_method === "collect" ? "Collection from our Cape Town studio" : address}
            <br />
            {order.phone}
          </p>
        </section>
        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Payment
          </h2>
          <p className="mt-3 text-[14px] text-charcoal">{PAYMENT_LABELS[order.payment_method]}</p>
          <p className="mt-1 text-[12px] text-muted">
            Reference <span className="font-mono">{order.payment_reference}</span>
          </p>
          <p className="mt-1 text-[12px] text-muted">Demo payment: nothing was charged.</p>
        </section>
      </div>
    </div>
  );
}
