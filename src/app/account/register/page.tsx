import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/AuthForms";
import { FormSkeleton, readNext } from "@/components/account/params";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

async function Form({ searchParams }: { searchParams: PageProps<"/account/register">["searchParams"] }) {
  return <RegisterForm next={readNext((await searchParams).next)} />;
}

export default function RegisterPage(props: PageProps<"/account/register">) {
  return (
    <AuthShell
      eyebrow="Your account"
      title="Create your account."
      description="It takes a minute. You'll need an account to check out."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/account/sign-in" className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </AuthShell>
  );
}
