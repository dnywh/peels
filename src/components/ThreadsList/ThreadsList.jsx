"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";

import AvatarPair from "@/components/AvatarPair";

import { styled } from "@pigment-css/react";

const ThreadsSidebar = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  "& h1": {
    padding: "0.75rem 1.25rem 0", // Match inset of ThreadsSidebar/ThreadsUnorderedList/ThreadPreview, with a bit of space above
  },

  // Mobile: full width when at root, hidden when thread selected

  padding: `0.5rem 0.5rem ${theme.spacing.tabBar.spaceFor}`, // Match padding in CenteredPage layout, but just for chat threads in this context, and accommodate TabBar when thread not selected

  // Hide the threads list when a thread is selected
  '[data-thread-selected="true"] &': {
    display: "none",
  },

  "@media (min-width: 768px)": {
    // Continue showing the threads list when a thread is selected (override mobile styles above)
    '[data-thread-selected="true"] &': {
      display: "inherit",
    },
    width: "20rem",
    padding: "0.75rem",
    backgroundColor: theme.colors.background.top,
    border: `1px solid ${theme.colors.border.base}`,
    borderRadius: theme.corners.base,

    "& h1": {
      padding: "0 0.5rem", // Remove space above, still match inset of ThreadPreview
    },
  },
}));

const sharedThreadsContainerStyles = ({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  padding: "0.75rem", // Match inset of ThreadsSidebar on larger breakpoint

  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,

  "@media (min-width: 768px)": {
    padding: "unset",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "unset",
  },
});

const ThreadsEmptyState = styled("div")(({ theme }) => ({
  ...sharedThreadsContainerStyles({ theme }),
  alignItems: "center",
  justifyContent: "center",
  minHeight: "30rem",
  height: "100%",

  "& p": {
    color: theme.colors.text.ui.emptyState,
    fontSize: "1.2rem",
    fontWeight: "500",
    lineHeight: "120%",
    textWrap: "balance",
  },
}));

const ThreadsUnorderedList = styled("ul")(({ theme }) => ({
  ...sharedThreadsContainerStyles({ theme }),
}));

const ThreadPreview = styled("a")(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.45rem", // Optically match padding around rotated avatar (left-edge)
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
        <ThreadsEmptyState>
          <p>No chats yet</p>
        </ThreadsEmptyState>
      )}
    </ThreadsSidebar>
  );
}

export default ThreadsList;
