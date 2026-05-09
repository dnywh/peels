import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

// This layout is used for pages that have content that always spans the full viewport width and height of the screen
const StretchedPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: stretch;
    gap: ${theme.spacing.gap.desktop};
    padding: 1.5rem;
  }
`;

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <TabBarProvider>
      <UnreadMessagesProvider>
        <StretchedPage>
          <TabBar breakpoint="md" />
          {children}
          <TabBar breakpoint="sm" />
        </StretchedPage>
      </UnreadMessagesProvider>
    </TabBarProvider>
  );
}
