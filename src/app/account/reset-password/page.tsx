import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

/** Reached from the reset email (via /auth/confirm, which signs the visitor in). */
export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Your account" title="Choose a new password." description="You'll stay signed in afterwards.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
