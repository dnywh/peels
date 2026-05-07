"use client";

import { ChatWindowEmptyState } from "@/components/ChatPageClient";
import PeelsLogo from "@/components/PeelsLogo";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations();

  return (
    <ChatWindowEmptyState aria-busy={true}>
      <PeelsLogo size={64} color="emptyState" />
      <p>{t("Common.loading")}</p>
    </ChatWindowEmptyState>
  );
}
