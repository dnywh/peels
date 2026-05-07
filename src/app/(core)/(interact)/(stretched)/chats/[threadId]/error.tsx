"use client";

import RouteBoundaryState from "@/components/RouteBoundaryState/RouteBoundaryState";
import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  return (
    <RouteBoundaryState
      message={t("Errors.genericLater")}
      onRetry={reset}
      retryLabel={t("Actions.tryAgain")}
    />
  );
}
