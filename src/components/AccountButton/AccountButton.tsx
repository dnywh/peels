"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { styled } from "next-yak";
import Button from "@/components/Button";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { LinkButtonProps } from "@/components/Button";

type AccountButtonProps = Omit<
  LinkButtonProps,
  "href" | "variant" | "children"
>;

export default function AccountButton({ ...props }: AccountButtonProps) {
  const t = useTranslations("Actions");
  const tCommon = useTranslations("Common");
  const { user, profileFirstName, isLoading } = useAuthUser({
    includeProfile: true,
  });
  const [isReadyToShow, setIsReadyToShow] = useState(false);
  const label = profileFirstName?.trim() || tCommon("account");

  useEffect(() => {
    if (isLoading) {
      setIsReadyToShow(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsReadyToShow(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  const hiddenButtonProps = !isReadyToShow
    ? ({
        "aria-hidden": true,
        tabIndex: -1,
      } satisfies Pick<LinkButtonProps, "aria-hidden" | "tabIndex">)
    : {};

  return user ? (
    <FadingAccountButton
      href="/profile"
      variant="secondary"
      {...props}
      {...hiddenButtonProps}
      $visible={isReadyToShow}
      data-testid="account-button-profile"
    >
      {label}
    </FadingAccountButton>
  ) : (
    <FadingAccountButton
      href="/sign-in"
      variant="secondary"
      {...props}
      {...hiddenButtonProps}
      $visible={isReadyToShow}
      data-testid="account-button-sign-in"
    >
      {t("signIn")}
    </FadingAccountButton>
  );
}

const FadingAccountButton = styled(Button)<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 160ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
