import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";

export const metadata = {
  title: "Support",
};

export default function Support() {
  return (
    <>
      <h1>Support</h1>
      <p>
        We’ll keep updating this page with answers to common questions as they
        come in. Feel free to{" "}
        <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
          email us directly
        </EncodedEmailHyperlink>{" "}
        for anything else.
      </p>

      <h2>Using Peels</h2>
      <SupportFaq />

      <h2>About Peels</h2>
      <PeelsFaq />
    </>
  );
}
