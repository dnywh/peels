"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useTabBar } from "@/contexts/TabBarContext";

import ThreadsList from "@/components/ThreadsList";
import ChatWindow from "@/components/ChatWindow";
import PeelsLogo from "@/components/PeelsLogo";

import { styled } from "@pigment-css/react";

const ChatPageLayout = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: theme.spacing.gap.desktop,
  width: "100%",
}));

const ChatWindowWrapper = styled("div")(({ theme }) => ({
  flex: 1,

  '[data-thread-selected="true"] &': {
    height: "100dvh",
    "@media (min-width: 768px)": {
      height: "inherit",
    },
  },

  // Mobile: full width when thread selected, hidden when at root
  '[data-thread-selected="false"] &': {
    display: "none",
  },

  "@media (min-width: 768px)": {
    '[data-thread-selected="false"] &': {
      display: "flex",
    },
  },
}));

const ChatWindowEmptyState = styled("div")(({ theme }) => ({
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.colors.background.pit,

  // Match styles in ChatWindow, MapSidebar
  "@media (min-width: 768px)": {
    borderRadius: theme.corners.base,
    border: `2px dashed ${theme.colors.border.base}`,
  },

  // Match styles in MapSidebar and ThreadsEmptyState
  "& p": {
    color: theme.colors.text.ui.emptyState,
    fontSize: "1.2rem",
    fontWeight: "500",
    lineHeight: "120%",
    textWrap: "balance",
  },
}));

export default function ChatPageClient({
  user,
  initialThreads,
  initialThreadId,
}) {
  // console.log("ChatPageClient rendered");
  const router = useRouter();
  const pathname = usePathname();
  const { setTabBarProps } = useTabBar();

  const threads = useMemo(() => initialThreads, [initialThreads]);
  const currentThreadId = useMemo(() => initialThreadId, [initialThreadId]);

  const selectedThread = useMemo(
    () =>
      currentThreadId ? threads?.find((t) => t.id === currentThreadId) : null,
    [currentThreadId, threads]
  );

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
