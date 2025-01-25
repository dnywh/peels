import PhotoThumbnail from "@/components/PhotoThumbnail";
import { styled } from "@pigment-css/react";

const featuredListingPhotos = [
  "284dad8e-36d5-421f-b831-b9922cb90bd4.jpg",
  "ae184537-0f9f-43ab-9bd7-b0351c4836a6.jpeg",
  "f418551d-f2bd-43f9-8f00-8ff37c98910d.jpg",
];

const tempListingPhotos = [
  "pcf-hot-compost-piles.jpeg",
  "noah-chickens.jpeg",
  "pcf-crew.jpeg",
];

const OrderedList = styled("ol")(({ theme }) => ({
  marginTop: "2rem",

  display: "flex",
  flexDirection: "column",
  gap: "5rem",
  alignItems: "center",
  textAlign: "center",
  counterReset: "step-counter",

  "& > li": {
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
      textWrap: "balance",
    },
  },
}));

const PhotoRow = styled("ul")(({ theme }) => ({
  marginTop: "2rem",
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  justifyContent: "center",

  "& li": {
    transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    "&:first-of-type": {
      transform: "rotate(-2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(-2deg) translateY(0.5rem) scale(1.05)",
      },
    },
    "&:nth-of-type(2)": {
      transform: "scale(1)",
      "&:hover": {
        transform: "scale(1.05)",
      },
    },
    "&:last-of-type": {
      transform: "rotate(2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(2deg) translateY(0.5rem) scale(1.05)",
      },
    },
  },
}));

function Step({ title, children }) {
  return (
    <li>
      <h3>{title}</h3>
      {children}
    </li>
  );
}

function PeelsHowItWorks() {
  return (
    <OrderedList>
      <Step number={1} title="Find a host">
        <p>Select a marker on the map.</p>
      </Step>

      <Step number={2} title="Contact">
        <p>Arrange a drop-off via chat, if necessary.</p>
      </Step>

      <Step number={3} title="Drop-off">
        <p>
          Or collect, if you’ve reached out to a local business with scraps to
          give away.
        </p>
        <p>
          That’s all there is to it! Get out there and meet your neighbours.
        </p>

        <PhotoRow>
          <PhotoThumbnail fileName={tempListingPhotos[0]} />
          <PhotoThumbnail fileName={tempListingPhotos[1]} />
          <PhotoThumbnail fileName={tempListingPhotos[2]} />
        </PhotoRow>
      </Step>
    </OrderedList>
  );
}

export default PeelsHowItWorks;
