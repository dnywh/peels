"use client";

import { useTranslations } from "next-intl";
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
  const { user, profileFirstName } = useAuthUser({ includeProfile: true });
  const label = profileFirstName?.trim() || tCommon("account");

  return user ? (
    <Button href="/profile" variant="secondary" prefetch={false} {...props}>
      {label}
    </Button>
  ) : (
    <Button href="/sign-in" variant="secondary" prefetch={false} {...props}>
      {t("signIn")}
    </Button>
  );
}
