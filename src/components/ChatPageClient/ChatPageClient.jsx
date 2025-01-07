"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatPageLayout = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: "2rem",
  height: "calc(100% - 80px)", // Tab Bar height
  width: "100%",

  "@media (min-width: 768px)": {
    height: "100%",
  },
});

const ThreadsSidebar = styled("div")({
  // Mobile: full width when no thread selected
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "2rem",

  "@media (min-width: 768px)": {
    // Desktop: always 20rem
    width: "20rem",
    display: "flex",
    border: "1px solid grey",
  },
});

const ChatWindowEmptyState = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const ThreadPreview = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0.5rem",
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

export default function ChatPageClient({
  user,
  initialThreads,
  initialThreadId,
}) {
  console.log("ChatPageClient rendered");
  const router = useRouter();
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

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

  // Check if the viewport is desktop or mobile
  // TODO make reusable for map, profile-redirect.js, chat page, etc.
  useEffect(() => {
    // Use matchMedia instead of resize event
    const mediaQuery = window.matchMedia("(min-width: 768px)"); // TODO: make this a shared variable also used in the media queries, match with other media queries in general (e.g. tab bar)

    function handleViewportChange(e) {
      if (e.matches) {
        // is desktop
        console.log("Viewport is desktop");
        setIsDesktop(true);
      } else {
        console.log("Viewport is mobile");
        setIsDesktop(false);
        console.log("isDesktop", isDesktop);
      }
    }

    // Check initial viewport size
    handleViewportChange(mediaQuery);

    // Listen for viewport changes
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  if (!isDesktop && !selectedThread) {
    return (
      <ThreadsSidebar>
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
    );
  }

  if (!isDesktop && selectedThread) {
    return (
      <ChatWindow
        showBackButton={true}
        user={user}
        listing={selectedThread.listing}
        existingThread={{
          ...selectedThread,
          chat_messages: selectedThread.chat_messages_with_senders,
        }}
      />
    );
  }

  return (
    <ChatPageLayout>
      <ThreadsSidebar>
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

      {selectedThread ? (
        <ChatWindow
          user={user}
          listing={selectedThread.listing}
          existingThread={{
            ...selectedThread,
            chat_messages: selectedThread.chat_messages_with_senders,
          }}
        />
      ) : (
        <ChatWindowEmptyState>No thread selected</ChatWindowEmptyState>
      )}
    </ChatPageLayout>
  );
}
