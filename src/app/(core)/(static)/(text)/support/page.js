import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

export const metadata = {
  title: "Support",
};

export default function Support() {
  return (
    <>
      <h1>Support</h1>

      <p>Our <Hyperlink href="/#faq-section">About</Hyperlink> page has answers to some common questions.
        For anything else, please{" "}
        <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">email us directly</EncodedEmailHyperlink>
        .
      </p>
    </>
  );
}
