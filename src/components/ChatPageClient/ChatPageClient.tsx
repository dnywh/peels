"use client";
import { theme } from "@/styles/theme.yak";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useTabBar } from "@/contexts/TabBarContext";

import ThreadsList from "@/components/ThreadsList";
import ChatWindow from "@/components/ChatWindow";
import PeelsLogo from "@/components/PeelsLogo";

import { styled } from "next-yak";
import type { User } from "@supabase/supabase-js";
import type { ChatThreadListItem, ChatThreadView } from "@/types/chat";

const ChatPageLayout = styled.main`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: ${theme.spacing.gap.desktop};
  width: 100%;
`;

const ChatWindowWrapper = styled.div`
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

const ChatWindowEmptyState = styled.div`
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
  initialThreadId,
  selectedThread,
}: {
  user: User;
  initialThreads: ChatThreadListItem[];
  initialThreadId?: string | null;
  selectedThread?: ChatThreadView | null;
}) {
  const t = useTranslations("Chat");
  const { setTabBarProps } = useTabBar();

  // Hide TabBar when thread is selected
  useEffect(() => {
    setTabBarProps((prev) => ({
      ...prev,
      visible: !initialThreadId,
    }));

    // Restore visibility on unmount
    return () => {
      setTabBarProps((prev) => ({
        ...prev,
        visible: true,
      }));
    };
  }, [initialThreadId, setTabBarProps]);

  return (
    <ChatPageLayout data-thread-selected={!!initialThreadId}>
      <ThreadsList
        user={user}
        threads={initialThreads}
        currentThreadId={initialThreadId}
      />

      <ChatWindowWrapper>
        {selectedThread?.listing ? (
          <ChatWindow
            user={user}
            listing={selectedThread.listing}
            existingThread={selectedThread}
          />
        ) : (
          <ChatWindowEmptyState>
            <PeelsLogo size={64} color="emptyState" />
            <p>
              {initialThreadId
                ? t("emptyStateUnavailable")
                : initialThreads.length === 0
                  ? t("emptyStateFirstHost")
                  : t("emptyStateSelectThread")}
            </p>
          </ChatWindowEmptyState>
        )}
      </ChatWindowWrapper>
    </ChatPageLayout>
  );
}
