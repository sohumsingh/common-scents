import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { CheckoutForm, type CheckoutDefaults } from "@/components/checkout/CheckoutForm";
import { getLastOrderDetails } from "@/lib/orders";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { DeliveryMethod } from "@/lib/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

/** Signed-in only (the proxy sends everyone else to sign in first). */
async function Checkout() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/checkout");

  const supabase = await createClient();
  const [{ data: profile }, last] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    getLastOrderDetails(supabase, user.id),
  ]);

  // Returning customers start with the details from their last delivery.
  const defaults: CheckoutDefaults = {
    email: profile?.email ?? user.email ?? "",
    full_name: profile?.full_name ?? "",
    phone: last?.phone ?? "",
    delivery_method: (last?.delivery_method as DeliveryMethod | undefined) ?? "standard",
    address_line1: last?.address_line1 ?? "",
    address_line2: last?.address_line2 ?? "",
    suburb: last?.suburb ?? "",
    city: last?.city ?? "",
    province: last?.province ?? "",
    postal_code: last?.postal_code ?? "",
  };

  return <CheckoutForm defaults={defaults} />;
}

export default function CheckoutPage() {
  return (
    <section className="py-[clamp(2rem,6svh,5rem)]">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <div className="mt-[clamp(1.25rem,3svh,2.5rem)] flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.04] text-charcoal">Checkout</h1>
          <p className="flex items-center gap-2 text-[12px] text-stone">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-deep" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
              <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            </svg>
            Secure checkout · Demo payments only
          </p>
        </div>
        <div className="mt-[clamp(1.5rem,4svh,3rem)]">
          <Suspense
            fallback={
              <div role="status" aria-label="Loading checkout" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse bg-parchment/60" />
                  ))}
                </div>
                <div className="h-80 animate-pulse bg-parchment/50" />
              </div>
            }
          >
            <Checkout />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
