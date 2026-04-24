"use client";

import RouteBoundaryState from "@/components/RouteBoundaryState/RouteBoundaryState";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations();

  return <RouteBoundaryState message={t("Common.loading")} />;
}
