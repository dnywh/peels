"use client";
import { theme } from "@/styles/theme.yak";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useTabBar } from "@/contexts/TabBarContext";

import ThreadsList from "@/components/ThreadsList";
import ChatWindow from "@/components/ChatWindow";
import PeelsLogo from "@/components/PeelsLogo";

import { styled } from "next-yak";

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
  unreadCount,
}: {
  user: any;
  initialThreads: any[];
  initialThreadId?: string | null;
  unreadCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTabBarProps } = useTabBar();

  const threads = useMemo(() => initialThreads, [initialThreads]);
  const currentThreadId = useMemo(() => initialThreadId, [initialThreadId]);

  const selectedThread = useMemo(
    () =>
      currentThreadId
        ? threads?.find((t: any) => t.id === currentThreadId)
        : null,
    [currentThreadId, threads]
  );

  // Hide TabBar when thread is selected
  useEffect(() => {
    setTabBarProps((prev: any) => ({
      ...prev,
      visible: !initialThreadId,
    }));

    // Restore visibility on unmount
    return () => {
      setTabBarProps((prev: any) => ({
        ...prev,
        visible: true,
      }));
    };
  }, [initialThreadId, setTabBarProps]);

  return (
    <ChatPageLayout data-thread-selected={!!initialThreadId}>
      <ThreadsList
        user={user}
        threads={threads}
        currentThreadId={currentThreadId}
      />

      <ChatWindowWrapper>
        {initialThreadId ? (
          <ChatWindow
            user={user}
            listing={selectedThread?.listing}
            existingThread={{
              ...selectedThread,
              chat_messages: selectedThread?.chat_messages_with_senders,
            }}
          />
        ) : (
          <ChatWindowEmptyState>
            <PeelsLogo size={64} color="emptyState" />
            <p>
              {initialThreads?.length === 0
                ? "Try contacting your first host"
                : "Select a chat from the left"}
            </p>
          </ChatWindowEmptyState>
        )}
      </ChatWindowWrapper>
    </ChatPageLayout>
  );
}
