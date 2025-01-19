"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import ThreadsList from "@/components/ThreadsList";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";
import { useTabBar } from "@/contexts/TabBarContext";

const ChatPageLayout = styled("main")({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: "2rem",
  width: "100%",
  // height: "calc(100% - 80px)",

  // "@media (min-width: 768px)": {
  //   height: "100%",
  // },
});

const ChatWindowWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,

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
  alignItems: "center",
  justifyContent: "center",
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
      currentThreadId ? threads.find((t) => t.id === currentThreadId) : null,
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
          <ChatWindowEmptyState>No thread selected</ChatWindowEmptyState>
        )}
      </ChatWindowWrapper>
    </ChatPageLayout>
  );
}
