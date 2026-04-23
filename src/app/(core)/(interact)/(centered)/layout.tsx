import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

// This layout is used for pages that have centered, vertically-scrolling content
const CenteredPage = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  margin-bottom: ${theme.spacing.tabBar.spaceFor};
  @media (min-width: 768px) {
    margin-bottom: 0;
    flex-direction: row;
    align-items: stretch;
    gap: ${theme.spacing.gap.desktop};
    padding: 1.5rem;
  }
`;

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <TabBarProvider>
      <CenteredPage>
        <TabBar breakpoint="md" position="dynamic" />
        {children}
        <TabBar breakpoint="sm" />
      </CenteredPage>
    </TabBarProvider>
  );
}
