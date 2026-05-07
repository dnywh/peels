"use client";
import { theme } from "@/styles/theme.yak";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { useTabBar } from "@/contexts/TabBarContext";
import { getChatThreadIdFromPathname } from "@/features/chat/chatRoutes";

import ThreadsList from "@/components/ThreadsList";
import ChatWindow from "@/components/ChatWindow";
import PeelsLogo from "@/components/PeelsLogo";

import { styled } from "next-yak";
import type { User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import type { ChatThreadListItem, ChatThreadView } from "@/types/chat";

export const ChatPageLayout = styled.main`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: ${theme.spacing.gap.desktop};
  width: 100%;
`;

export const ChatWindowWrapper = styled.div`
  flex: 1;
  [data-thread-selected="true"] & {
    height: 100dvh;
    @media (min-width: 768px) {
      height: inherit;
    }
  }
  [data-thread-selected="false"] & {
    display: none;
  }
  @media (min-width: 768px) {
    [data-thread-selected="false"] & {
      display: flex;
    }
  }
`;

export const ChatWindowEmptyState = styled.div`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.pit};
  @media (min-width: 768px) {
    border-radius: ${theme.corners.base};
    border: 2px dashed ${theme.colors.border.base};
  }
  & p {
    color: ${theme.colors.text.ui.emptyState};
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 120%;
    text-wrap: balance;
  }
`;

export default function ChatPageClient({
  user,
  initialThreads,
  children,
}: {
  user: User;
  initialThreads: ChatThreadListItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const currentThreadId = getChatThreadIdFromPathname(pathname);
  const { setTabBarProps } = useTabBar();
  const t = useTranslations("Chat");

  useEffect(() => {
    setTabBarProps((prev) => ({
      ...prev,
      visible: !currentThreadId,
    }));

    return () => {
      setTabBarProps((prev) => ({
        ...prev,
        visible: true,
      }));
    };
  }, [currentThreadId, setTabBarProps]);

  return (
    <ChatPageLayout data-thread-selected={!!currentThreadId}>
      <ThreadsList
        user={user}
        threads={initialThreads}
        currentThreadId={currentThreadId}
      />

      <ChatWindowWrapper>
        {currentThreadId ? (
          children
        ) : (
          <ChatWindowEmptyState>
            <PeelsLogo size={64} color="emptyState" />
            <p>
              {initialThreads.length > 0
                ? t("emptyStateSelectThread")
                : t("emptyStateFirstHost")}
            </p>
          </ChatWindowEmptyState>
        )}
      </ChatWindowWrapper>
    </ChatPageLayout>
  );
}

export function ChatConversationClient({
  user,
  hasThreads,
  selectedThread,
  referenceNow,
}: {
  user: User;
  hasThreads: boolean;
  selectedThread?: ChatThreadView | null;
  referenceNow: string;
}) {
  const t = useTranslations("Chat");

  if (selectedThread?.listing) {
    return (
      <ChatWindow
        user={user}
        listing={selectedThread.listing}
        existingThread={selectedThread}
        referenceNow={referenceNow}
      />
    );
  }

  return (
    <ChatWindowEmptyState>
      <PeelsLogo size={64} color="emptyState" />
      <p>
        {selectedThread
          ? t("emptyStateUnavailable")
          : hasThreads
            ? t("emptyStateSelectThread")
            : t("emptyStateFirstHost")}
      </p>
    </ChatWindowEmptyState>
  );
}
