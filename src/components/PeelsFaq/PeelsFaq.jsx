import FaqContainer from "@/Components/FaqContainer";
import FaqDetails from "@/Components/FaqDetails";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

function PeelsFaq() {
  return (
    <FaqContainer>
      <FaqDetails>
        <summary>Who’s behind Peels?</summary>
        <p>
          Peels is a project led by{" "}
          <Hyperlink href="https://dannywhite.net" target="_blank">
            Danny White
          </Hyperlink>
          , a product designer with 10 years experience working on products
          including Airbnb, ChatGPT, Kickstarter, and Facebook. He helped start
          the composting program at Pocket City Farms and previously built a
          traveller’s guide to reducing food waste.
        </p>
        <p>
          We plan for Peels to be around for the long haul, so will open source
          the project and welcome community code contributions from later this
          year.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>How is Peels different to ShareWaste?</summary>
        <p>
          ShareWaste was a precursor to Peels with a similar idea: connecting
          people locally to divert organic material from landfill. Sadly,
          ShareWaste shut down at the end of 2024.
        </p>
        <p>
          Right now, we’re just trying to fill the gap that ShareWaste left. You
          can think of Peels as a direct replacement for ShareWaste.
        </p>
        <p>
          We’ve got plenty of other ideas in the pipeline, including general
          area guides for composting. Stay tuned for those.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>What’s the financial model? Are you non-profit?</summary>
        <p>
          Peels is a non-commercial, community-led project. We may incorporate
          as a not-for-profit in the future and accept funding for further
          development, but we never intend to start charging for the service.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>
          I have a FOGO bin. Is community composting still relevant?
        </summary>
        <p>
          Lucky you! Unfortunately, you’re in the minority. Most people don’t
          yet have access to kerbside compost collection. As long as that’s the
          case, there’ll be a need for community composting resources.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>
          I’m not comfortable putting my address on a map. Can I still
          participate?
        </summary>
        <p>
          Yes! We encourage folks with residential listings to ‘roughen’ their
          location to a nearby street corner or similar, and use a pseudonym if
          they feel more comfortable doing so.
        </p>
        <p>
          Even if you choose to use your real name and upload a photo, only
          signed in Peels members can see those details.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>I’d like to help build Peels. How do I get involved?</summary>
        <p>
          You’re awesome.{" "}
          <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
            Email us
          </EncodedEmailHyperlink>{" "}
          and we’ll chat.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>How can I promote Peels to my community?</summary>
        <p>
          First off, thank you! Peels only works with a thriving map of
          listings, so getting the word out is crucial.
        </p>
        <p>
          Check out our{" "}
          <Hyperlink
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/promo-kit.zip`}
          >
            promo kit
          </Hyperlink>{" "}
          which includes social media tiles and and a printable poster in both
          letter and A4 sizes. Don’t hesistate to{" "}
          <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
            reach out
          </EncodedEmailHyperlink>{" "}
          for something more specific to your community.
        </p>
      </FaqDetails>
      <FaqDetails>
        <summary>
          I represent local or state government. How can I get involved?
        </summary>
        <p>
          We’ve already partnered with councils from all over Australia, and are
          always keen to work with more (around the world, too!). Please{" "}
          <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
            email us
          </EncodedEmailHyperlink>
          .
        </p>
      </FaqDetails>
    </FaqContainer>
  );
}

export default PeelsFaq;
