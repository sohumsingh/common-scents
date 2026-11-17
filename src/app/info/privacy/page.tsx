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
      updated="Draft policy — written against South African POPIA and the current feature set."
      draftNote="This policy reflects the features that exist today. It will be reviewed once customer accounts, payment processing and the mailing list are connected."
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
            "Enquiry details — your name, email address, subject and message when you contact us.",
            "Order details — what you bought, where it is being delivered and how you paid, once checkout is connected.",
            "Technical information — your browser type, device and pages visited, in order to understand how the site is used.",
            "Newsletter addresses — only if you choose to subscribe.",
          ]}
        />
      </InfoSection>

      <InfoSection title="How we use it">
        <InfoList
          items={[
            "To answer your enquiries and support your order.",
            "To process and deliver purchases.",
            "To send you the newsletter, if you have asked for it. Every email includes an unsubscribe link.",
            "To understand which pages are useful and where the site needs work.",
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
          Payment details are handled entirely by our payment provider and never touch our servers.
          We only receive confirmation of the payment method, the amount and the reference.
        </p>
      </InfoSection>

      <InfoSection title="Your rights">
        <p>
          Under the Protection of Personal Information Act (POPIA), you can ask us what personal
          information we hold about you, request corrections, or ask us to delete it. Contact us and
          we will action it. Note that we are required to keep certain transaction records for tax
          purposes.
        </p>
      </InfoSection>

      <InfoSection title="Sharing">
        <p>
          We share only what is necessary to fulfil an order — with our courier so they can deliver
          it, and with our payment provider so they can take the payment. We do not share your
          information with advertisers or data brokers.
        </p>
      </InfoSection>

      <InfoSection title="Cookies">
        <p>
          This site uses functional storage for your shopping bag and your display preferences. We
          do not use advertising cookies. If advertising or analytics cookies are introduced later,
          this policy will be updated and you will be told before they are used.
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
