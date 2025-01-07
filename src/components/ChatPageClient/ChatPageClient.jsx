"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatPageLayout = styled("main")({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: "2rem",
  width: "100%",
  height: "calc(100% - 80px)",

  "@media (min-width: 768px)": {
    height: "100%",
  },
});

const ThreadsSidebar = styled("div")({
  width: "20rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "1rem",

  // Mobile: full width when at root, hidden when thread selected
  "@media (max-width: 767px)": {
    width: "100%",
    '[data-thread-selected="true"] &': {
      display: "none",
    },
  },

  "@media (min-width: 768px)": {
    border: "1px solid #e0e0e0",
    borderRadius: "0.5rem",
  },
});

const ThreadPreview = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0.5rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.25rem",
  "&:hover": {
    backgroundColor: "#f2f2f2",
  },
  variants: [
    {
      props: { selected: true },
      style: {
        backgroundColor: "#f0f0f0",
      },
    },
  ],
});

const LastMessage = styled("p")({
  fontSize: "0.8rem",
  color: "#808080",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

const ChatWindowWrapper = styled("div")({
  flex: 1,

  // Mobile: full width when thread selected, hidden when at root
  '[data-thread-selected="false"] &': {
    display: "none",
  },

  "@media (min-width: 768px)": {
    '[data-thread-selected="false"] &': {
      display: "flex",
    },
  },
});

const ChatWindowEmptyState = styled("div")({
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export default function ChatPageClient({
  user,
  initialThreads,
  initialThreadId,
}) {
  console.log("ChatPageClient rendered");
  const router = useRouter();
  const pathname = usePathname();

  const threads = useMemo(() => initialThreads, [initialThreads]);
  const currentThreadId = useMemo(() => initialThreadId, [initialThreadId]);

  const selectedThread = useMemo(
    () =>
      currentThreadId ? threads.find((t) => t.id === currentThreadId) : null,
    [currentThreadId, threads]
  );

  const handleThreadSelect = useCallback(
    (thread) => {
      if (thread.id !== currentThreadId) {
        router.push(`/chats/${thread.id}`);
      }
    },
    [currentThreadId, router]
  );

  return (
    <ChatPageLayout data-thread-selected={!!initialThreadId}>
      <ThreadsSidebar>
        <h1>Chats</h1>
        {threads.map((thread) => {
          const otherPersonName =
            thread.initiator_id === user.id
              ? thread.owner_first_name
              : thread.initiator_first_name;

          const displayName =
            thread.listing?.type !== "residential" &&
            thread.owner_id ===
              (thread.initiator_id === user.id
                ? thread.owner_id
                : thread.initiator_id)
              ? `${otherPersonName}, ${thread.listing.name}`
              : otherPersonName;

          return (
            <ThreadPreview
              key={thread.id}
              selected={thread.id === currentThreadId}
              onClick={() => handleThreadSelect(thread)}
            >
              <h3>{displayName}</h3>
              {thread.chat_messages_with_senders?.length > 0 && (
                <LastMessage>
                  {
                    thread.chat_messages_with_senders[
                      thread.chat_messages_with_senders.length - 1
                    ].content
                  }
                </LastMessage>
              )}
            </ThreadPreview>
          );
        })}
      </ThreadsSidebar>

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
