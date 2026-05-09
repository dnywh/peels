import type { Metadata } from "next";
import { createPeelsMetadata, noindexFollowMetadata } from "@/utils/seo";

export const metadata: Metadata = createPeelsMetadata({
  ...noindexFollowMetadata,
  canonicalPath: "/chats",
  title: "Chats",
});

export default function ChatsIndexPage() {
  return null;
}
