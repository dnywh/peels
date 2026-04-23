"use client";
import { theme } from "@/styles/theme.yak";
import Link from "next/link";

import AvatarPair from "@/components/AvatarPair";

import { css, styled } from "next-yak";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useTranslations } from "next-intl";

type ThreadUser = {
  id: string;
};

type ThreadRecord = {
  id: string;
  initiator_id?: string;
  initiator_first_name?: string;
  initiator_avatar?: string | null;
  owner_id?: string;
  owner_first_name?: string;
  listing?: {
    id?: string;
    type?: string;
    name?: string;
    avatar?: string | null;
    owner_avatar?: string | null;
  };
  chat_messages_with_senders?: Array<{
    content?: string;
    read_at?: string | null;
    sender_id?: string;
  }>;
};

type ThreadsListProps = {
  user: ThreadUser;
  threads?: ThreadRecord[] | null;
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
              thread.chat_messages_with_senders?.some(
                (msg) => !msg.read_at && msg.sender_id !== user.id
              ) && !isThreadRead(thread.id);

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
                    listing={role === "initiator" ? thread.listing : undefined}
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
                    {thread.chat_messages_with_senders &&
                      thread.chat_messages_with_senders.length > 0 && (
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
          <p>{t("noChats")}</p>
        </ThreadsEmptyState>
      )}
    </ThreadsSidebar>
  );
}

export default ThreadsList;
