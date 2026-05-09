"use client";

import LocalePicker from "@/components/LocalePicker";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function FooterLocaleSlot() {
  const { user, isLoading } = useAuthUser();

  if (isLoading || user) {
    return null;
  }

  return <LocalePicker compact={true} />;
}
