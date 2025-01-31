"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";

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

  "& h1": {
    padding: "0 0.5rem", // Match inset of ThreadPreview
  },

  // Mobile: full width when at root, hidden when thread selected
  "@media (max-width: 767px)": {
    width: "100%",
    '[data-thread-selected="true"] &': {
      display: "none",
    },
  },
}));

const ThreadsUnorderedList = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
}));

const ThreadPreview = styled("a")(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0rem",
  padding: "0.25rem 0.5rem",

  // Match styles in ProfileListings
  borderRadius: `calc(${theme.corners.base} * 0.625)`,

  "& h3": {
    color: theme.colors.text.ui.primary,
    fontSize: "1rem",
  },

  "& p": {
    fontSize: "0.875rem",
    color: theme.colors.text.ui.quaternary,

    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },

  transition: "background-color 150ms ease-in-out",
  "&:hover": {
    backgroundColor: `color-mix(in srgb, ${theme.colors.background.sunk} 80%, transparent)`,
  },
  variants: [
    {
      props: { selected: true },
      style: {
        // cursor: "auto",
        backgroundColor: theme.colors.background.sunk,
      },
    },
  ],
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
      <ThreadsUnorderedList>
        {threads.length > 0 ? (
          threads.map((thread) => {
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
              <li key={thread.id}>
                <ThreadPreview
                  selected={thread.id === currentThreadId}
                  onClick={() => handleThreadSelect(thread)}
                >
                  <h3>{displayName}</h3>
                  {thread.chat_messages_with_senders?.length > 0 && (
                    <p>
                      {
                        thread.chat_messages_with_senders[
                          thread.chat_messages_with_senders.length - 1
                        ].content
                      }
                    </p>
                  )}
                </ThreadPreview>
              </li>
            );
          })
        ) : (
          <p>No chats yet</p>
        )}
      </ThreadsUnorderedList>
    </ThreadsSidebar>
  );
}

export default ThreadsList;
