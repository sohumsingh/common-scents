import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/components/account/AuthForms";
import { NewsletterSetting } from "@/components/account/NewsletterSetting";
import { FormSkeleton } from "@/components/account/params";
import { InfoNote } from "@/components/ui/InfoNote";
import { Button } from "@/components/ui/Button";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { listOrders } from "@/lib/orders";
import { OrderStatusPill } from "@/components/orders/OrderView";
import { formatZAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" });
const orderDay = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" });

async function AccountDetails({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/account");

  const supabase = await createClient();
  const [{ data: profile }, orders] = await Promise.all([
    supabase.from("profiles").select("full_name, email, role, created_at, newsletter_opt_in, newsletter_updated_at").eq("id", user.id).single(),
    listOrders(supabase, { userId: user.id, limit: 20 }),
  ]);

  const params = await searchParams;
  const firstName = profile?.full_name?.split(" ")[0];
  const isAdmin = profile?.role === "admin";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            My account
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.04] text-charcoal">
            {firstName ? `Hello, ${firstName}.` : "Hello."}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-stone">
            {profile?.email ?? user.email}
            {profile?.created_at ? <span className="text-muted">· Member since {memberSince.format(new Date(profile.created_at))}</span> : null}
            {isAdmin ? (
              <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.16em] text-gold-deep">
                Admin
              </span>
            ) : null}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      {params.updated === "password" ? (
        <InfoNote tone="notice" className="mt-8">
          Your password has been changed.
        </InfoNote>
      ) : null}

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="details-heading" className="border-t border-line pt-8">
          <h2 id="details-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Your details
          </h2>
          <div className="mt-6 max-w-md">
            <ProfileForm fullName={profile?.full_name ?? ""} />
          </div>

          <h2 id="newsletter-heading" className="mt-12 text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Newsletter
          </h2>
          <div className="mt-5 max-w-md">
            <NewsletterSetting
              email={profile?.email ?? user.email ?? ""}
              subscribed={Boolean(profile?.newsletter_opt_in)}
              updatedAt={profile?.newsletter_updated_at ?? null}
            />
          </div>
        </section>

        <section aria-labelledby="orders-heading" className="border-t border-line pt-8">
          <h2 id="orders-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Your orders
          </h2>
          {orders.length === 0 ? (
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-stone">
              You haven&apos;t placed an order yet. When you do, you can follow it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.order_number}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] text-charcoal transition-colors group-hover:text-gold-deep">
                        {order.order_number}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-stone">
                        {orderDay.format(new Date(order.created_at))} · {order.item_count} item{order.item_count === 1 ? "" : "s"} ·{" "}
                        {formatZAR(order.total_zar)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <OrderStatusPill status={order.status} />
                      <span aria-hidden="true" className="text-stone transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {isAdmin ? (
            <InfoNote tone="pending" title="Admin" className="mt-6 max-w-md">
              This account has admin access.{" "}
              <Link href="/admin" className="text-charcoal underline decoration-gold/60 underline-offset-4">
                Open the admin dashboard →
              </Link>
            </InfoNote>
          ) : null}
        </section>
      </div>
    </>
  );
}

export default function AccountPage(props: PageProps<"/account">) {
  return (
    <section className="py-[clamp(2rem,6svh,5rem)]">
      <Container>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My account" }]} />
        <div className="mt-[clamp(1.5rem,4svh,3rem)]">
          <Suspense fallback={<FormSkeleton fields={2} />}>
            <AccountDetails searchParams={props.searchParams} />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
