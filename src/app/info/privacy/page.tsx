import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Common Scents collects, uses and protects your personal information.",
  alternates: { canonical: "/info/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      description="What we collect, why we collect it, and what we will never do with it."
      updated="Last updated 19 November 2026"
    >
      <InfoSection title="The short version">
        <p>
          We collect the minimum we need to run a shop and answer your questions. We do not sell
          your information to anyone, and we do not send you marketing you did not ask for.
        </p>
      </InfoSection>

      <InfoSection title="What we collect">
        <InfoList
          items={[
            "Account details — your name and email address when you register. Your password is stored securely by our sign-in provider; we never see it.",
            "Order details — what you ordered, your phone number and your delivery address.",
            "Enquiry details — your name, email address, subject and message when you contact us.",
            "Newsletter preference — whether you have chosen to subscribe, and when you last changed it.",
            "Technical information — basic records our hosting providers keep to run the site securely, such as your browser type and IP address.",
          ]}
        />
      </InfoSection>

      <InfoSection title="How we use it">
        <InfoList
          items={[
            "To run your account and let you follow your orders.",
            "To prepare and deliver your orders.",
            "To answer your enquiries.",
            "To send you the newsletter, if you have asked for it. You can unsubscribe at any time from your account.",
            "To keep the site secure and working properly.",
            "To meet our legal and tax obligations.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Your shopping bag">
        <p>
          Your bag is stored in your own browser using local storage. It is not linked to an account,
          it is not visible to us, and clearing your browser data will empty it. We do not use
          third-party advertising trackers.
        </p>
      </InfoSection>

      <InfoSection title="Payment information">
        <p>
          Common Scents is a demo shop: checkout is simulated, no payment is taken and no card or
          bank details are collected. We only record which payment option you picked and a demo
          payment reference with your order.
        </p>
      </InfoSection>

      <InfoSection title="Your rights">
        <p>
          Under the Protection of Personal Information Act (POPIA), you can ask us what personal
          information we hold about you, request corrections, or ask us to delete it. You can change
          your name and newsletter preference yourself on your account page; for anything else,
          contact us and we will action it.
        </p>
      </InfoSection>

      <InfoSection title="Sharing">
        <p>
          Your information is stored with our database and sign-in provider, Supabase, and the site
          is hosted by a web hosting provider. They process it only to run the site on our behalf. We
          do not share your information with advertisers or data brokers.
        </p>
      </InfoSection>

      <InfoSection title="Cookies">
        <p>
          We use a sign-in cookie to keep you logged in, and your browser&apos;s storage to remember
          your shopping bag. Both are needed for the site to work. We do not use advertising or
          analytics cookies; if that ever changes, this policy will be updated and you will be told
          before they are used.
        </p>
      </InfoSection>

      <InfoSection title="Changes">
        <p>
          We will update this page whenever our processes change. The date at the top of this page
          reflects the most recent revision.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
