import Link from "next/link";
import { useTranslations } from "next-intl";
import PeelsMapDemo from "@/components/PeelsMapDemo";
import PeelsChatDemo from "@/components/PeelsChatDemo";
import PeelsFeaturedHostsPhotos from "@/components/PeelsFeaturedHostsPhotos";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { LiHTMLAttributes, ReactNode } from "react";

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

const anchoredStepStyles = css`
  gap: 0.5rem;

  @media (min-width: 960px) {
    flex-direction: row-reverse;
    gap: 3.5rem;
  }
`;

const OrderedList = styled.ol`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  align-items: center;
  counter-reset: step-counter;

  @media (min-width: 960px) {
    gap: 8rem;
  }
`;

const StyledStep = styled.li<{ $anchor?: "left" }>`
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ $anchor }) => $anchor === "left" && anchoredStepStyles}
`;

const sharedStepStyles = css`
  & > h3,
  & > p {
    text-align: center;
    text-wrap: balance;
  }

  & > h3 {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 115%;
    color: ${theme.colors.text.brand.primary};
  }

  & > p {
    font-size: 1rem;
    color: ${theme.colors.text.ui.quaternary};
    max-width: ${theme.spacing.container.textOpticalWidth};
  }

  & > p > a {
    color: inherit;
    transition: ${theme.transitions.textColor};
  }

  & > p > a:hover {
    color: ${theme.colors.text.primary};
  }

  @media (min-width: 960px) {
    & > h3 {
      font-size: 2.2rem;
    }
  }
`;

const StepHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  ${sharedStepStyles}

  &::before {
    content: counter(step-counter);
    counter-increment: step-counter;
    background-color: ${theme.colors.background.counter};
    color: ${theme.colors.background.sunk};
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1rem;
    font-weight: 700;
    font-variant-numeric: lining-nums;
  }
`;

const StepFooter = styled.footer`
  ${sharedStepStyles}
`;

function Step({
  anchor,
  children,
  ...props
}: {
  anchor?: "left";
  children?: ReactNode;
} & LiHTMLAttributes<HTMLLIElement>) {
  return (
    <StyledStep $anchor={anchor} {...props}>
      {children}
    </StyledStep>
  );
}
