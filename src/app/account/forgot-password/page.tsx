import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Your account"
      title="Forgotten your password?"
      description="Enter your email and we'll send you a link to choose a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/account/sign-in" className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
