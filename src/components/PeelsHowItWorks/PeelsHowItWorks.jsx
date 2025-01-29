import Link from "next/link";
import PeelsMapDemo from "@/components/PeelsMapDemo";
import PeelsChatDemo from "@/components/PeelsChatDemo";
import PeelsFeaturedHostsPhotos from "@/components/PeelsFeaturedHostsPhotos";
import { styled } from "@pigment-css/react";

const OrderedList = styled("ol")(({ theme }) => ({
  marginTop: "2rem",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "5rem",
  alignItems: "center",
  counterReset: "step-counter",

  "& > li": {
    width: "100%",

    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",

    "&:before": {
      content: "counter(step-counter)",
      counterIncrement: "step-counter",
      backgroundColor: theme.colors.background.counter,
      color: theme.colors.background.sunk, // Match page background
      width: "1.5rem",
      height: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      fontSize: "1rem",
      fontWeight: "700",
    },

    "& > h3, & > p": {
      textAlign: "center",
      textWrap: "balance",
    },

    "& > h3": {
      fontSize: "1.75rem",
      fontWeight: "700",
      lineHeight: "115%",
      color: theme.colors.text.brand.primary,
    },

    // Match type styling from homepage
    "& >  p": {
      fontSize: "1rem",
      color: theme.colors.text.ui.quaternary,
      // But make a little narrower than the homepage
      maxWidth: "44ch",

      "& > a": {
        color: "inherit",
        transition: "color 150ms ease-in-out",
        "&:hover": {
          color: theme.colors.text.primary,
        },
      },
    },
  },
}));

function Step({ title, children, ...props }) {
  return (
    <li {...props}>
      <h3>{title}</h3>
      {children}
    </li>
  );
}

function PeelsHowItWorks() {
  return (
    <OrderedList>
      <Step number={1} title="Find a host">
        <p>Select a marker on the map to see who’s nearby.</p>
        <PeelsMapDemo />
      </Step>

      <Step number={2} title="Contact" id="contact">
        <p>Arrange to drop-off or collect your scraps via chat.</p>
        <PeelsChatDemo />
      </Step>

      <Step number={3} title="Drop-off">
        <p>
          Or collect, if you’ve reached out to a local business with scraps to
          give away.
        </p>
        <PeelsFeaturedHostsPhotos />
        <p>
          That’s all there is to it! <Link href="/sign-up">Get out there</Link>{" "}
          and meet your neighbours.
        </p>
      </Step>
    </OrderedList>
  );
}

export default PeelsHowItWorks;
