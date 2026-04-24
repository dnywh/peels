"use client";
import { theme } from "@/styles/theme.yak";
import Link from "next/link";

import AvatarPair from "@/components/AvatarPair";

import { css, styled } from "next-yak";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useTranslations } from "next-intl";
import type { ChatThreadListItem, ChatUser } from "@/types/chat";

type ThreadsListProps = {
  user: ChatUser;
  threads?: ChatThreadListItem[] | null;
  currentThreadId?: string | null;
};

const threadsContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};

  @media (min-width: 768px) {
    padding: unset;
    background-color: transparent;
    border: none;
    border-radius: unset;
  }
`;

const ThreadsSidebar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  & h1 {
    padding: 0.75rem 1.25rem 0;
  }

  padding: 0.5rem 0.5rem ${theme.spacing.tabBar.spaceFor};

  [data-thread-selected="true"] & {
    display: none;
  }

  @media (min-width: 768px) {
    [data-thread-selected="true"] & {
      display: inherit;
    }

    width: 20rem;
    padding: 0.75rem;
    background-color: ${theme.colors.background.top};
    border: 1px solid ${theme.colors.border.base};
    border-radius: ${theme.corners.base};

    & h1 {
      padding: 0 0.5rem;
    }
  }
`;

const ThreadsEmptyState = styled.div`
  ${threadsContainerStyles}
  align-items: center;
  justify-content: center;
  min-height: 30rem;
  height: 100%;

  & p {
    color: ${theme.colors.text.ui.emptyState};
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 120%;
    text-wrap: balance;
  }
`;

const ThreadsUnorderedList = styled.ul`
  ${threadsContainerStyles}
`;

const ThreadPreview = styled(Link)`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.5rem;
  border-radius: calc(${theme.corners.base} * 0.625);
  transition: background-color 150ms ease-in-out;

  &:hover {
    background-color: color-mix(
      in srgb,
      ${theme.colors.background.sunk} 80%,
      transparent
    );
  }

  &[data-selected="true"] {
    background-color: ${theme.colors.background.sunk};
  }

  &[data-unread="true"] {
    position: relative;

    &::after {
      content: "";
      width: 10px;
      height: 10px;
      background-color: ${theme.colors.tab.unread};
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
`;

const ThreadPreviewText = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0;
  gap: 0.25rem;
  overflow: hidden;
  flex: 1;

  & h3,
  & p {
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-block: 0.04rem;
  }

  & h3 {
    color: ${theme.colors.text.ui.primary};
    font-size: 1rem;
  }

  & p {
    font-size: 0.875rem;
    color: ${theme.colors.text.ui.quaternary};
  }
`;

function ThreadsList({ user, threads, currentThreadId }: ThreadsListProps) {
  const t = useTranslations("Chat");
  const { isThreadRead } = useUnreadMessages();

  return (
    <ThreadsSidebar>
      <h1>{t("threadsTitle")}</h1>
      {threads && threads.length > 0 ? (
        <ThreadsUnorderedList data-testid="thread-list">
          {threads.map((thread) => {
            const role =
              thread.initiator_id === user.id ? "initiator" : "owner";

            const otherPersonName =
              role === "initiator"
                ? thread.owner_first_name
                : thread.initiator_first_name;

            const displayNameVerbose =
              thread.listing?.type !== "residential" &&
              thread.owner_id ===
                (thread.initiator_id === user.id
                  ? thread.owner_id
                  : thread.initiator_id)
                ? `${otherPersonName}, ${thread.listing?.name}`
                : otherPersonName;

            const hasUnreadMessages =
              thread.has_unread_messages && !isThreadRead(thread.id);

            return (
              <li key={thread.id}>
                <ThreadPreview
                  href={`/chats/${thread.id}`}
                  data-selected={
                    thread.id === currentThreadId ? "true" : undefined
                  }
                  data-unread={hasUnreadMessages ? "true" : undefined}
                  aria-current={
                    thread.id === currentThreadId ? "page" : undefined
                  }
                  data-testid={`thread-preview-${thread.id}`}
                  onClick={(event) => {
                    if (thread.id === currentThreadId) {
                      event.preventDefault();
                    }
                  }}
                >
                  <AvatarPair
                    listing={
                      role === "initiator" && thread.listing
                        ? {
                            type: thread.listing.type ?? undefined,
                            avatar: thread.listing.avatar,
                            owner_avatar: thread.listing.owner_avatar,
                          }
                        : undefined
                    }
                    profile={
                      role === "owner"
                        ? { avatar: thread.initiator_avatar }
                        : undefined
                    }
                    user={user}
                    role={role}
                    smallest="tiny"
                    width="fixed"
                  />
                  <ThreadPreviewText>
                    <h3>{displayNameVerbose}</h3>
                    {thread.last_message && (
                      <p>{thread.last_message.content}</p>
                    )}
                  </ThreadPreviewText>
                </ThreadPreview>
              </li>
            );
          })}
        </ThreadsUnorderedList>
      ) : (
        <ThreadsEmptyState>
          <p>{t("noChats")}</p>
        </ThreadsEmptyState>
      )}
    </ThreadsSidebar>
  );
}

export default ThreadsList;
