import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Returns and Refunds",
  description:
    "How returns and refunds work at Common Scents — what can be returned, the return window and how to start a return.",
  alternates: { canonical: "/info/returns" },
};

export default function ReturnsPage() {
  return (
    <InfoPage
      title="Returns and Refunds"
      description="Fragrance is a personal purchase, so our returns policy is designed to be straightforward."
      updated="Last updated 20 November 2026"
    >
      <InfoSection title="Our approach">
        <p>
          If a fragrance isn’t right for you, we would rather you sent it back than kept something
          you won’t wear. Unopened, unused items in their original packaging can be returned.
        </p>
        <p>
          Because fragrance can’t be resold once opened, opened bottles can only be returned if the
          item is faulty or not what you ordered. This is standard practice across the fragrance
          industry.
        </p>
      </InfoSection>

      <InfoSection title="What can be returned, and when">
        <InfoList
          items={[
            "Unopened, unused items — within 14 days of delivery.",
            "Damaged or faulty on arrival — contact us within 30 days of delivery, with photographs.",
            "The wrong item delivered — contact us within 30 days of delivery.",
            "Opened items — not returnable unless faulty or incorrect.",
          ]}
        />
      </InfoSection>

      <InfoSection title="How to start a return">
        <p>
          Send us a message through the contact form with your order reference (for example
          CS-100105) and the reason for the return. We’ll reply with the return address and the
          steps for sending the parcel back.
        </p>
        <p>
          If you’re returning an unopened item because you’ve changed your mind, the return postage
          is yours to cover. If the item is faulty or incorrect, we cover it.
        </p>
      </InfoSection>

      <InfoSection title="Refunds">
        <p>
          Once your return arrives and has been checked, we refund the item to your original
          payment method within 5 working days. Delivery fees aren’t refunded unless the return is
          our fault — for example, a damaged or incorrect item.
        </p>
      </InfoSection>

      <InfoSection title="Faulty items">
        <p>
          If a bottle is damaged, leaking or arrives in poor condition, send us photographs of the
          packaging and the item as soon as possible. We’ll arrange a replacement or a full refund,
          and we’ll cover the return postage.
        </p>
      </InfoSection>

      <InfoSection title="Gifts">
        <p>
          Fragrance bought as a gift can be returned in the same way and on the same conditions. If
          you’d like the refund to go to the original purchaser, let us know when you contact us.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
