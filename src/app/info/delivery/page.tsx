import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";
import { DELIVERY_OPTIONS, FREE_DELIVERY_FROM, deliveryFee } from "@/lib/checkout";
import { formatZAR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery Information",
  description:
    "How Common Scents delivers across South Africa — delivery options, fees, timing and tracking.",
  alternates: { canonical: "/info/delivery" },
};

/** The options, prices and timings come from the checkout’s own rules, so the two always agree. */
const options = DELIVERY_OPTIONS.map((option) => {
  const fee = deliveryFee(option.id, 0);
  const price =
    option.id === "standard"
      ? `${formatZAR(fee)}, free on orders of ${formatZAR(FREE_DELIVERY_FROM)} or more`
      : fee === 0
        ? "Free"
        : formatZAR(fee);
  return `${option.label} — ${option.timing.replace(/^Ready/, "ready")}. ${price}.${option.id === "express" ? " Available in main centres." : ""}${
    option.id === "collect" ? " We’ll message you when your order is ready to collect." : ""
  }`;
});

export default function DeliveryPage() {
  return (
    <InfoPage
      title="Delivery Information"
      description="We deliver nationwide across South Africa. Here’s everything you need to know."
      updated="Last updated 20 November 2026"
    >
      <InfoSection title="Where we deliver">
        <p>
          Common Scents delivers to every major city and town across South Africa. Outlying and farm
          addresses are handled case by case — if your address falls outside our standard courier
          network, we’ll let you know before your order is processed.
        </p>
      </InfoSection>

      <InfoSection title="Delivery options">
        <p>Choose how you’d like to receive your order at checkout:</p>
        <InfoList items={options} />
      </InfoSection>

      <InfoSection title="Delivery fees">
        <p>
          Your delivery fee is shown at checkout before you pay, and standard delivery is free on
          orders of {formatZAR(FREE_DELIVERY_FROM)} or more. There are no hidden charges.
        </p>
      </InfoSection>

      <InfoSection title="Timing and dispatch">
        <p>
          Orders are packed and dispatched within one working day of payment. Delivery times above
          are counted from dispatch, in working days (Monday to Friday, excluding public holidays).
          You can follow every order — paid, being prepared, on its way, delivered — from your
          account.
        </p>
      </InfoSection>

      <InfoSection title="Tracking">
        <p>
          As soon as your parcel is with the courier, your order shows as “On its way” in your
          account. If anything seems to be taking longer than it should, contact us with your order
          reference and we’ll chase it up.
        </p>
      </InfoSection>

      <InfoSection title="If something goes wrong">
        <p>
          Parcels can occasionally be delayed, mis-delivered or damaged in transit. If your delivery
          doesn’t arrive, arrives damaged, or contains the wrong item, contact us within 30 days of
          the expected delivery date with your order reference, and we’ll put it right.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
