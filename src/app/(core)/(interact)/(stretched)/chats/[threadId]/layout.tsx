import { noindexFollowMetadata } from "@/utils/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = noindexFollowMetadata;

export default function ChatThreadLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
