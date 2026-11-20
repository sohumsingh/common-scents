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
      updated="Last updated 20 November 2026"
    >
      <InfoSection title="About this site">
        <p>
          Common Scents is a portfolio project: a fully working demonstration of an online
          fragrance store. Orders can be placed and followed, but checkout is simulated — no
          payment is ever taken and nothing is delivered. Products and prices are for demonstration
          only.
        </p>
      </InfoSection>

      <InfoSection title="Using this site">
        <p>
          By browsing Common Scents you agree to these terms. You may browse, search and add items
          to your bag without registering an account. You need an account to check out and to
          view your order history, which you can find on your account page.
        </p>
      </InfoSection>

      <InfoSection title="Product information and pricing">
        <p>
          We work hard to describe every fragrance accurately, including its notes, character and
          the occasions it suits. Product details are gathered from brand materials and our own
          assessment.
        </p>
        <p>
          Prices are shown in South African rand and exclude delivery, which is added at checkout
          before you pay. Prices may change without notice; the price shown when you place your
          order is the price that applies to it.
        </p>
      </InfoSection>

      <InfoSection title="Orders">
        <InfoList
          items={[
            "An order is an offer to buy. It is accepted when it appears in your account with an order reference.",
            "Stock is checked again the moment you place an order, so an order can’t be placed for a size that has sold out.",
            "If an item turns out to be unavailable, we will contact you and offer a refund or an alternative — we will not quietly cancel your order.",
            "We may decline an order where a pricing error has occurred, and we will refund you in full.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Payment">
        <p>
          Checkout offers card and Instant EFT as demonstrations only. No card or bank details are
          requested or stored, and no money is ever taken. Each order is given a demo payment
          reference so the full order journey can be shown.
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
          We may update these terms from time to time. The date at the top of this page shows when
          they last changed, and the updated version applies from that date.
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
