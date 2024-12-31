"use client";
import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatPageLayout = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: "2rem",
  // backgroundColor: "blue",
  height: "100vh",
});

const ThreadsSidebar = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "2rem",
  // backgroundColor: "tomato",
  minWidth: "16rem",
  border: "1px solid grey",
});

const ChatWindowContainer = styled("div")({
  // backgroundColor: "green",
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

const ChatWindowEmptyState = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export default function ChatPageClient({ user, initialThreads }) {
  console.log("ChatPageClient rendered");

  const router = useRouter();
  const pathname = usePathname();

  // Memoize threads to prevent unnecessary re-renders
  const threads = useMemo(() => initialThreads, [initialThreads]);

  // Memoize current thread ID from pathname
  const currentThreadId = useMemo(() => {
    const id = pathname.split("/").pop();
    return id === "chats" ? null : id;
  }, [pathname]);

  // Memoize selected thread based on current ID
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
            <div
              key={thread.id}
              className={`thread-preview ${thread.id === currentThreadId ? "selected" : ""}`}
              onClick={() => handleThreadSelect(thread)}
            >
              <h3>{displayName}</h3>
              {thread.chat_messages_with_senders?.length > 0 && (
                <p className="last-message">
                  {
                    thread.chat_messages_with_senders[
                      thread.chat_messages_with_senders.length - 1
                    ].content
                  }
                </p>
              )}
            </div>
          );
        })}
      </ThreadsSidebar>

      <ChatWindowContainer>
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
      </ChatWindowContainer>
    </ChatPageLayout>
  );
}
