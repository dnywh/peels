"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { styled } from "@pigment-css/react";

const ThreadsSidebar = styled("div")(({ theme }) => ({
  width: "20rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "1rem",

  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,

  // Mobile: full width when at root, hidden when thread selected
  "@media (max-width: 767px)": {
    width: "100%",
    '[data-thread-selected="true"] &': {
      display: "none",
    },
  },

  // "@media (min-width: 768px)": {
  //   border: "1px solid #e0e0e0",
  //   borderRadius: "0.5rem",
  // },
}));

const ThreadPreview = styled("div")(({ theme }) => ({
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
}));

const LastMessage = styled("p")(({ theme }) => ({
  fontSize: "0.8rem",
  color: "#808080",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
}));

function ThreadsList({ user, threads, currentThreadId }) {
  const router = useRouter();

  const handleThreadSelect = useCallback(
    (thread) => {
      if (thread.id !== currentThreadId) {
        router.push(`/chats/${thread.id}`);
      }
    },
    [currentThreadId, router]
  );

  return (
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
  );
}

export default ThreadsList;
