import type { Metadata } from "next";
import { InfoList, InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Delivery Information",
  description:
    "How Common Scents delivers across South Africa — coverage, timelines, tracking and delivery fees.",
  alternates: { canonical: "/info/delivery" },
};

export default function DeliveryPage() {
  return (
    <InfoPage
      title="Delivery Information"
      description="We deliver nationwide across South Africa. Here is how it works, and what we still have to confirm."
      updated="Draft policy — details marked as to be confirmed will be updated before launch."
      draftNote="Our courier partner, delivery fees and standard timelines have not been confirmed yet. The structure below is how delivery will work; the specific numbers are pending."
    >
      <InfoSection title="Where we deliver">
        <p>
          Common Scents delivers to every major city and town across South Africa, with delivery to
          outlying and farm addresses handled on a case-by-case basis. If your address falls outside
          our standard courier network, we will let you know before you pay for anything.
        </p>
      </InfoSection>

      <InfoSection title="Delivery options">
        <p>
          We intend to offer a standard courier service and an express option for larger centres.
          The exact options available at checkout will depend on the destination you enter.
        </p>
        <InfoList
          items={[
            "Standard delivery — the economical option, suited to non-urgent orders. Estimated timeline: to be confirmed.",
            "Express delivery — prioritised handling for orders that need to arrive quickly. Estimated timeline: to be confirmed.",
            "Collection — available from our Cape Town location once confirmed. Address and hours: to be confirmed.",
          ]}
        />
      </InfoSection>

      <InfoSection title="Delivery fees">
        <p>
          Delivery fees are calculated at checkout based on the courier service you choose and the
          destination you enter, so the exact amount is always visible before you confirm an order.
          A standard delivery fee structure — including any free-delivery threshold — is still to be
          confirmed by our courier partner.
        </p>
      </InfoSection>

      <InfoSection title="Timing and dispatch">
        <p>
          Orders are prepared and dispatched once payment is confirmed and stock has been verified.
          Because stock levels are being confirmed with suppliers during our launch period, some
          lines may take slightly longer to dispatch. If an item you have ordered is not available,
          we will contact you with options rather than letting an order sit indefinitely.
        </p>
      </InfoSection>

      <InfoSection title="Tracking">
        <p>
          Tracking details will be emailed as soon as your parcel is collected. If a tracking
          reference has not reached you within a reasonable period of your order being dispatched,
          please contact us with your order reference and we will chase it up.
        </p>
      </InfoSection>

      <InfoSection title="If something goes wrong">
        <p>
          Parcels can be delayed, mis-delivered or damaged in transit. If your delivery does not
          arrive, arrives damaged, or arrives with the wrong contents, contact us within 30 days
          of the expected delivery date and include your order reference. We will work with the
          courier to resolve it.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
