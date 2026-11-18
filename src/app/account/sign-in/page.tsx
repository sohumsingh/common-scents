import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { SignInForm } from "@/components/account/AuthForms";
import { FormSkeleton, readNext } from "@/components/account/params";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

async function Form({ searchParams }: { searchParams: PageProps<"/account/sign-in">["searchParams"] }) {
  const params = await searchParams;
  return <SignInForm next={readNext(params.next)} linkError={params.error === "link"} />;
}

async function RegisterLink({ searchParams }: { searchParams: PageProps<"/account/sign-in">["searchParams"] }) {
  const next = readNext((await searchParams).next);
  const href = next === "/account" ? "/account/register" : `/account/register?next=${encodeURIComponent(next)}`;
  return (
    <>
      New to Common Scents?{" "}
      <Link href={href} className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal">
        Create an account
      </Link>
    </>
  );
}

export default function SignInPage(props: PageProps<"/account/sign-in">) {
  return (
    <AuthShell
      eyebrow="Your account"
      title="Welcome back."
      description="Sign in to check out and pick up your bag on any device."
      footer={
        <Suspense fallback={<span>New to Common Scents?</span>}>
          <RegisterLink searchParams={props.searchParams} />
        </Suspense>
      }
    >
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}
