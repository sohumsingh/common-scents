import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { OrderDetails, OrderProgress, OrderStatusPill, orderDate } from "@/components/orders/OrderView";
import { getOrder } from "@/lib/orders";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

/**
 * The page frame (header, footer) is prepared at build time from one example
 * address; the order itself is always loaded live for whoever is signed in.
 */
export async function generateStaticParams() {
  return [{ number: "CS-100101" }];
}

async function OrderPage({ params, searchParams }: PageProps<"/account/orders/[number]">) {
  const user = await getCurrentUser();
  const { number } = await params;
  if (!user) redirect(`/account/sign-in?next=/account/orders/${encodeURIComponent(number)}`);

  const supabase = await createClient();
  const [order, query] = await Promise.all([getOrder(supabase, number), searchParams]);
  // Someone else's order looks exactly like one that doesn't exist.
  if (!order || order.user_id !== user.id) notFound();

  const justPlaced = query.placed === "1";
  const firstName = order.full_name.split(" ")[0];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My account", href: "/account" },
          { label: order.order_number },
        ]}
      />

      {justPlaced ? (
        <div className="mt-[clamp(1.5rem,4svh,3rem)] border border-gold/35 bg-gold/8 px-6 py-7 sm:px-8">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Order confirmed
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-charcoal">
            Thank you{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone">
            Your order <span className="text-charcoal">{order.order_number}</span> has been placed. You can come back to this page from
            your account at any time to see how it&apos;s getting on.
          </p>
          <p className="mt-3 text-[12px] text-muted">This is a demo shop: nothing was charged and nothing will be sent.</p>
        </div>
      ) : (
        <div className="mt-[clamp(1.5rem,4svh,3rem)] flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Order</p>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] text-charcoal">{order.order_number}</h1>
          </div>
          <OrderStatusPill status={order.status} />
        </div>
      )}

      <p className="mt-6 text-[13px] text-stone">Placed on {orderDate.format(new Date(order.created_at))}</p>

      <div className="mt-8 border-y border-line py-7">
        <OrderProgress status={order.status} />
      </div>

      <div className="mt-10">
        <OrderDetails order={order} />
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center bg-charcoal px-7 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-noir"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="inline-flex h-12 items-center border border-charcoal/25 px-7 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
        >
          All your orders
        </Link>
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/account/orders/[number]">) {
  return (
    <section className="py-[clamp(2rem,6svh,5rem)]">
      <Container>
        <Suspense
          fallback={
            <div role="status" aria-label="Loading your order" className="flex flex-col gap-4">
              <div className="h-10 w-64 animate-pulse bg-parchment/70" />
              <div className="h-24 animate-pulse bg-parchment/50" />
              <div className="h-64 animate-pulse bg-parchment/40" />
            </div>
          }
        >
          <OrderPage {...props} />
        </Suspense>
      </Container>
    </section>
  );
}
