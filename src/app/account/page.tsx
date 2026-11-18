import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/components/account/AuthForms";
import { FormSkeleton } from "@/components/account/params";
import { InfoNote } from "@/components/ui/InfoNote";
import { Button } from "@/components/ui/Button";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" });

async function AccountDetails({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/account");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, created_at")
    .eq("id", user.id)
    .single();

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
        </section>

        <section aria-labelledby="orders-heading" className="border-t border-line pt-8">
          <h2 id="orders-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Your orders
          </h2>
          <p className="mt-6 max-w-md text-[14px] leading-relaxed text-stone">
            Your orders will appear here once checkout opens. Until then, your bag is saved on this device.
          </p>
          {isAdmin ? (
            <InfoNote tone="pending" title="Admin" className="mt-6 max-w-md">
              This account has admin access. The admin dashboard is the next thing being built.
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
