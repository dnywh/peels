"use client";

import { useTranslations } from "next-intl";
import { styled } from "next-yak";
import Button from "@/components/Button";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { LinkButtonProps } from "@/components/Button";
import { theme } from "@/styles/theme.yak";

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
  const label = profileFirstName?.trim() || tCommon("account");

  if (isLoading) {
    return (
      <AccountButtonSkeleton
        aria-hidden="true"
        className={props.className}
        data-testid="account-button-loading"
      >
        <SkeletonLabel />
      </AccountButtonSkeleton>
    );
  }

  return user ? (
    <Button
      href="/profile"
      variant="secondary"
      {...props}
      data-testid="account-button-profile"
    >
      {label}
    </Button>
  ) : (
    <Button
      href="/sign-in"
      variant="secondary"
      {...props}
      data-testid="account-button-sign-in"
    >
      {t("signIn")}
    </Button>
  );
}

const AccountButtonSkeleton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  min-width: 6.5rem;
  height: 3rem;
  padding: 0 calc(${theme.spacing.unit} * 2);
  border-radius: ${theme.corners.base};
  background: ${theme.colors.button.secondary.background};
  box-shadow: 0px 0px 0px 2px ${theme.colors.border.base};
  opacity: 0.72;

  @media (prefers-reduced-motion: reduce) {
    opacity: 0.8;
  }
`;

const SkeletonLabel = styled.span`
  width: 3.75rem;
  height: 0.85rem;
  border-radius: 999px;
  background: ${theme.colors.border.base};
`;
