"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";

import AvatarPair from "@/components/AvatarPair";

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
  flexDirection: "row",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.25rem 0.5rem",

  // Match styles in ProfileListings
  borderRadius: `calc(${theme.corners.base} * 0.625)`,

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

const ThreadPreviewText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "0.625rem 0",
  gap: "0.25rem",
  overflow: "hidden",

  "& h3, & p": {
    lineHeight: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },

  "& h3": {
    color: theme.colors.text.ui.primary,
    fontSize: "1rem",
  },

  "& p": {
    fontSize: "0.875rem",
    color: theme.colors.text.ui.quaternary,
    paddingBottom: "0.05rem", // Stop visual clipping on overflowY
  },
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
      {threads?.length > 0 ? (
        <ThreadsUnorderedList>
          {threads.map((thread) => {
            // TODO: Consolidate with other role and otherPersonName and displayNameVerbose logic elsewhere
            const role =
              thread.initiator_id === user.id ? "initiator" : "owner";

            const otherPersonName =
              role === "initiator"
                ? thread.owner_first_name
                : thread.initiator_first_name;

            // Verbose because it has a comma and then the listing name
            const displayNameVerbose =
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
                  {/* Handle either listing avatar and owner avatar combo OR initiator's avatar */}
                  <AvatarPair
                    listing={role === "initiator" ? thread.listing : undefined}
                    profile={
                      role === "owner"
                        ? { avatar: thread.initiator_avatar }
                        : undefined
                    }
                    user={user}
                    role={role}
                    smallest="tiny"
                    width="fixed" // So text is aligned on every row
                  />
                  <ThreadPreviewText>
                    <h3>{displayNameVerbose}</h3>
                    {thread.chat_messages_with_senders?.length > 0 && (
                      <p>
                        {
                          thread.chat_messages_with_senders[
                            thread.chat_messages_with_senders.length - 1
                          ].content
                        }
                      </p>
                    )}
                  </ThreadPreviewText>
                </ThreadPreview>
              </li>
            );
          })}
        </ThreadsUnorderedList>
      ) : (
        // TODO: Center and visually match empty chat window state
        <p>No chats yet</p>
      )}
    </ThreadsSidebar>
  );
}

export default ThreadsList;
