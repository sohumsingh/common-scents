import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Returns and Refunds",
  description:
    "How returns and refunds work at Common Scents — eligibility, timelines and how to start a return.",
  alternates: { canonical: "/info/returns" },
};

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns and Refunds"
      description="Fragrance is a personal purchase, so our returns policy is designed to be straightforward. Here is the draft."
      updated="Draft policy — the final terms are confirmed alongside our courier and payment partners."
      draftNote="Our returns window, conditions and refund method are still being finalised with our courier and payment partners. The structure below is how we intend to handle returns."
    >
      <InfoSection title="Our intention">
        <p>
          If a fragrance is not right for you, we would rather you sent it back than kept it
          because it felt wrong to return it. Our draft policy allows returns on unopened,
          unused items in their original packaging.
        </p>
        <p>
          Because fragrance cannot be resold once opened, opened bottles cannot be returned except
          where the item is faulty or incorrect. This is standard practice across the fragrance
          industry, not a policy we invented.
        </p>
      </InfoSection>

      <InfoSection title="Return window">
        <InfoList
          items={[
            "Unopened, unused items — returnable within a window to be confirmed (likely 14 days from delivery).",
            "Damaged or faulty on arrival — contact us immediately with photographs, within 30 days of delivery.",
            "Incorrect item delivered — contact us within 30 days of delivery.",
            "Opened items — not returnable unless faulty or incorrect.",
          ]}
        />
      </InfoSection>

      <InfoSection title="How to start a return">
        <p>
          Email us with your order reference and the reason for the return. We will confirm the
          return address and the steps for sending the parcel back. Return postage costs are
          currently to be confirmed — where we are responsible for a fault or an error, we will
          cover them.
        </p>
      </InfoSection>

      <InfoSection title="Refunds">
        <p>
          Once a returned item has been inspected and accepted, refunds are issued to the original
          payment method. Delivery fees are not refundable unless the return is our fault — for
          example a damaged or incorrect item.
        </p>
        <p>
          The exact refund timeline depends on your payment provider. We will confirm the details
          when the return is accepted.
        </p>
      </InfoSection>

      <InfoSection title="Faulty items">
        <p>
          If a bottle is damaged, leaks, or arrives in poor condition, send us photographs of the
          packaging and the item as soon as possible. We will arrange a replacement or a full
          refund, and we will cover the return postage.
        </p>
      </InfoSection>

      <InfoSection title="Gift items">
        <p>
          Fragrance bought as a gift can be returned in the same way, subject to the same
          conditions. If you would like the refund sent to the original purchaser, let us know when
          you contact us.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
