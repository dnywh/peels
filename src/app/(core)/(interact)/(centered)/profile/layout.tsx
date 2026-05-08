import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { noindexFollowMetadata } from "@/utils/seo";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = noindexFollowMetadata;

const ProfilePageLayout = styled.main`
  flex: 1;
  width: 100%;
  margin: 2rem auto;
  max-width: ${theme.spacing.container.maxWidth.text};
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <ProfilePageLayout>{children}</ProfilePageLayout>;
}
