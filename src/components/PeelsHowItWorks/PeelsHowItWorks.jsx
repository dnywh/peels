import Link from "next/link";
import { useTranslations } from "next-intl";
import PeelsMapDemo from "@/components/PeelsMapDemo";
import PeelsChatDemo from "@/components/PeelsChatDemo";
import PeelsFeaturedHostsPhotos from "@/components/PeelsFeaturedHostsPhotos";
import { styled } from "@pigment-css/react";

function PeelsHowItWorks() {
  const t = useTranslations("Index.howItWorks");
  return (
    <OrderedList>
      <Step>
        <PeelsMapDemo
          stepHeader={
            <StepHeader>
              <h3>{t("findAHost.title")}</h3>
              <p>{t("findAHost.subtitle")}</p>
            </StepHeader>
          }
        />
      </Step>

      <Step anchor="left" id="contact">
        <StepHeader>
          <h3>{t("contact.title")}</h3>
          <p>{t("contact.subtitle")}</p>
        </StepHeader>
        <PeelsChatDemo />
      </Step>

      <Step id="drop-off">
        <StepHeader>
          <h3>{t("dropOff.title")}</h3>
          <p>{t("dropOff.subtitle")}</p>
        </StepHeader>

        <PeelsFeaturedHostsPhotos />

        <StepFooter>
          <p>
            {t.rich("footer", {
              page: (chunks) => <Link href="/sign-up">{chunks}</Link>,
            })}
          </p>
        </StepFooter>
      </Step>
    </OrderedList>
  );
}

export default PeelsHowItWorks;

const OrderedList = styled("ol")(({ theme }) => ({
  marginTop: "2rem",
  // width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "5rem",
  alignItems: "center",
  counterReset: "step-counter",

  "@media (min-width: 960px)": {
    gap: "8rem",
  },
}));

const StyledStep = styled("li")(({ theme }) => ({
  // width: "100%",
  listStyle: "none",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  variants: [
    {
      props: { anchor: "left" },
      style: {
        gap: "0.5rem",

        "@media (min-width: 960px)": {
          flexDirection: "row-reverse",
          gap: "3.5rem",
        },
      },
    },
  ],
}));

const sharedStepStyles = ({ theme }) => ({
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
    maxWidth: theme.spacing.container.textOpticalWidth,

    "& > a": {
      color: "inherit",
      transition: theme.transitions.textColor,
      "&:hover": {
        color: theme.colors.text.primary,
      },
    },
  },

  "@media (min-width: 960px)": {
    "& > h3": {
      fontSize: "2.2rem",
    },
  },
});

const StepHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",

  ...sharedStepStyles({ theme }),

  "&::before": {
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
    // Override the oldstyle numbers just in this case, since that was affecting optical alignment
    fontVariantNumeric: "lining-nums",
  },
}));

const StepFooter = styled("footer")(({ theme }) => ({
  ...sharedStepStyles({ theme }),
}));

function Step({ title, anchor, children, ...props }) {
  return (
    <StyledStep anchor={anchor} {...props}>
      {children}
    </StyledStep>
  );
}
