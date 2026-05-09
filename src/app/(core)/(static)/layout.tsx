import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import SiteFooter from "@/components/SiteFooter";
import { styled } from "next-yak";
import AccountButton from "@/components/AccountButton";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

const StyledAccountButton = styled(AccountButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const StaticPage = styled.div`
  padding: 1.5rem 1rem 0;
  margin-bottom: calc(${theme.spacing.tabBar.spaceFor} + 1rem);
  overflow-x: hidden;
  @media (min-width: 768px) {
    margin-bottom: 0;
    padding: 2rem 8rem 3rem;
  }
`;

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <TabBarProvider>
      <UnreadMessagesProvider>
        <StaticPage>
          <StyledAccountButton />
          <TabBar breakpoint="md" position="fixed" />
          {children}
          <SiteFooter />
          <TabBar breakpoint="sm" />
        </StaticPage>
      </UnreadMessagesProvider>
    </TabBarProvider>
  );
}
