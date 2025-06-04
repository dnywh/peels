import { siteConfig } from "@/config/site";
import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

// General FAQ for 'about Peels'
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
          We want Peels to be around for the long haul, so have{" "}
          <Hyperlink
            href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`}
            target="_blank"
          >
            open sourced
          </Hyperlink>{" "}
          the project and welcome your contributions.
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
          as a not-for-profit in the future and accept grant funding or
          sponsorships for further development, but we never intend to start
          charging for the service.
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
        <p>You’re awesome. Thank you.</p>
        <p>
          If you’re inclined to help on the technical side, check out our{" "}
          <Hyperlink
            href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`}
            target="_blank"
          >
            GitHub repo
          </Hyperlink>
          . It has information on how to contribute, plus some existing issues
          that could do with your eyes.
        </p>

        <p>
          Community organising is also a big part of getting Peels off the
          ground. Please don’t hesistate to{" "}
          <EncodedEmailHyperlink address={siteConfig.email.support}>
            email us
          </EncodedEmailHyperlink>{" "}
          if that’s something you could help with.
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
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static/promo-kit.zip`}
          >
            promo kit
          </Hyperlink>{" "}
          which includes social media tiles and and a printable poster in both
          letter and A4 sizes. Don’t hesistate to{" "}
          <EncodedEmailHyperlink address={siteConfig.email.support}>
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
          <EncodedEmailHyperlink address={siteConfig.email.support}>
            email us
          </EncodedEmailHyperlink>
          .
        </p>
      </FaqDetails>
    </FaqContainer>
  );
}

export default PeelsFaq;
