import { styled } from "@pigment-css/react";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

// Animate details & summary with a few lines of CSS
// https://www.youtube.com/watch?v=Vzj3jSUbMtI
const DetailsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  padding: `0 ${theme.spacing.unit}`,
  width: "100%",
  boxShadow: `0px 0px 0px 1px ${theme.colors.border.light}`,
}));

const StyledDetails = styled("details")(({ theme }) => ({
  padding: `0 calc(${theme.spacing.unit} * 1.5)`,

  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },

  overflow: "hidden",

  // Parent of all the details content
  // Turn on shadow dom in Chrome to see this in dev tools
  "&::details-content": {
    color: theme.colors.text.ui.secondary,
    blockSize: "0",
    transition:
      "block-size 200ms cubic-bezier(0.4, 0, 0.2, 1), content-visibility 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    transitionBehavior: "allow-discrete",
    padding: `0 2rem 0 1rem`, // Match the summary X padding
  },

  "&[open]::details-content": {
    blockSize: "auto",
  },

  "& > p": {
    // marginBottom: "0",
    // paddingBlockStart: "1rem",

    "& + p": {
      marginTop: "0.5rem",
    },

    "&:last-of-type": {
      paddingBlockEnd: "2rem",
    },
  },

  "& summary::marker, & summary::-webkit-details-marker": {
    color: "red",
    flexShrink: "0",
    // display: "none",
  },

  "& summary": {
    cursor: "pointer",
    borderRadius: theme.corners.base,
    transition: "opacity 150ms ease-in-out",
    listStylePosition: "outside",

    "&:hover": {
      opacity: 0.65,
    },

    fontSize: "1.2rem",
    fontWeight: "550",
    color: theme.colors.text.ui.primary,
    padding: `calc(${theme.spacing.unit} * 3) 2rem calc(${theme.spacing.unit} * 3) 1rem`,

    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem",
  },
}));

function PeelsFaq() {
  return (
    <DetailsContainer>
      <StyledDetails name="faq">
        <summary>Who’s behind Peels?</summary>
        <p>
          Peels is a project led by{" "}
          <Hyperlink href="https://dannywhite.net" target="_blank">
            Danny White
          </Hyperlink>
          , an Australian product designer with 10 years experience working on
          products including Airbnb, ChatGPT, Kickstarter, and Facebook.
        </p>
        <p>
          Danny is passionate about food waste and composting. He helped start
          the composting program at Pocket City Farms, has worked on organic
          farms around the world, and has previously built a traveller’s guide
          to reducing food waste.
        </p>
      </StyledDetails>
      <StyledDetails name="faq">
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
          We’ve got plans to build out general area guides for composting and
          other features in the not too distant future.
        </p>
      </StyledDetails>
      <StyledDetails name="faq">
        <summary>What’s the financial model? Are you non-profit?</summary>
        <p>
          Peels is a non-commercial, community-led project. We may incorporate
          as a not-for-profit in the future and accept funding for further
          development, but we never intend to start charging for the service.
        </p>
      </StyledDetails>
      <StyledDetails name="faq">
        <summary>
          I have a FOGO bin. Is community composting still relevant?
        </summary>
        <p>
          Lucky you! Unfortunately, you’re in the minority. Most people don’t
          yet have access to kerbside compost collection. As long as that’s the
          case, there’ll be a need for community composting resources.
        </p>
      </StyledDetails>
      <StyledDetails name="faq">
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
      </StyledDetails>
      <StyledDetails name="faq">
        <summary>I’d like to help build Peels. How do I get involved?</summary>
        <p>
          You’re awesome.{" "}
          <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
            Email us
          </EncodedEmailHyperlink>{" "}
          and we’ll chat.
        </p>
      </StyledDetails>
      <StyledDetails name="faq">
        <summary>
          I represent local or state government. How can I get involved?
        </summary>
        <p>
          We’ve already partnered with councils from all over Australia, and are
          always keen to work with more (around the world, too!). Please{" "}
          <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
            email us
          </EncodedEmailHyperlink>{" "}
          if you’d like to get involved.
        </p>
      </StyledDetails>
    </DetailsContainer>
  );
}

export default PeelsFaq;
