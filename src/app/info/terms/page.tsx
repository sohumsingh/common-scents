import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms that apply when you browse and purchase from Common Scents.",
  alternates: { canonical: "/info/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms and Conditions"
      description="The ground rules for using Common Scents and buying from us."
      updated="Draft terms — confirmed alongside our payment provider, courier and business registration."
      draftNote="These terms are written against the business as it is currently structured. They will be reviewed once the payment provider, courier and registered business details are confirmed."
    >
      <InfoSection title="Using this site">
        <p>
          By browsing Common Scents you agree to these terms. You may browse, search and add items
          to your bag without registering an account. You need an account only for features such
          as order history, which are not yet live.
        </p>
      </InfoSection>

      <InfoSection title="Product information and pricing">
        <p>
          We work hard to describe every fragrance accurately, including its notes, character and
          the occasions it suits. Product details are gathered from brand materials and our own
          assessment, and we flag where something is still awaiting confirmation from a supplier.
        </p>
        <p>
          Prices are shown in South African Rand and exclude any delivery charge, which is
          calculated at checkout. Prices may change without notice, and the price confirmed at
          checkout is the price charged.
        </p>
      </InfoSection>

      <InfoSection title="Orders">
        <InfoList
          items={[
            "An order is an offer to buy. It becomes a contract when we confirm the order and dispatch the goods.",
            "If an item turns out to be unavailable, we will contact you and offer a refund or an alternative — we will not quietly cancel your order.",
            "We may decline an order where a pricing error has occurred, and we will refund you in full.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Payment">
        <p>
          Payment will be processed by a South African payment provider — PayFast or Peach Payments
          — depending on the provider we contract with. No payment provider is connected to this
          site yet, so no payment can currently be taken.
        </p>
      </InfoSection>

      <InfoSection title="Intellectual property">
        <p>
          The Common Scents name, logo, website design and written content belong to Common Scents.
          Fragrance names, brands and bottle designs remain the property of their respective
          owners and are referenced here to identify the products being sold. We are not affiliated
          with or endorsed by the fragrance houses we stock.
        </p>
      </InfoSection>

      <InfoSection title="Limitation of liability">
        <p>
          We are not liable for indirect or consequential loss arising from the use of this site or
          the products on it, to the extent permitted by law. Nothing in these terms limits your
          rights as a consumer under the Consumer Protection Act.
        </p>
      </InfoSection>

      <InfoSection title="Changes to these terms">
        <p>
          We may update these terms as the business develops. The revision date at the top of this
          page shows when they last changed, and the updated version applies from that date.
        </p>
      </InfoSection>

      <InfoSection title="Contact">
        <p>
          Questions about these terms are welcome. Use the contact form and we will come back to
          you.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
