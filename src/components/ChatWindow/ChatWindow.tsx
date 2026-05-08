"use client";

import { theme } from "@/styles/theme.yak";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatHeader from "@/components/ChatHeader";
import {
  ensureChatThread,
  getThreadMessages,
  markChatThreadRead,
  sendChatMessage,
} from "@/components/ChatWindow/chatWindowController";
import { DEMO_CHAT_REFERENCE_TIME } from "@/data/demo/threads";
import {
  CHAT_RENDER_TIME_ZONE,
  formatWeekday,
  getChatDateKey,
} from "@/utils/dateUtils";

import { styled } from "next-yak";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useBeforeUnloadWarning } from "@/hooks/useBeforeUnloadWarning";
import { useInlineMutation } from "@/hooks/useInlineMutation";
import { useLocale, useTranslations } from "next-intl";
import type {
  ChatListing,
  ChatMessageRecord,
  ChatSendResult,
  ChatThreadRecord,
  ChatThreadView,
} from "@/types/chat";
import type { DemoListing } from "@/types/listing";
import type { FormSubmitEvent } from "@/types/events";

type SharedChatWindowProps = {
  isDrawer?: boolean;
  user: User | null;
  listing: ChatListing | DemoListing;
  existingThread?: ChatThreadRecord | ChatThreadView | null;
};

type DemoChatWindowProps = SharedChatWindowProps & {
  isDemo: true;
  referenceNow?: never;
};

type NonDemoChatWindowProps = SharedChatWindowProps & {
  isDemo?: false;
  referenceNow: string;
};

type ChatWindowProps = DemoChatWindowProps | NonDemoChatWindowProps;

const DIRECTIONS_FOR_DEMO = ["sent", "received"] as const;
type ChatRenderOptions = {
  locale: string;
  now?: string;
  timeZone: string;
  useRelativeDayLabels: boolean;
};

const defaultChatRenderOptions: ChatRenderOptions = {
  locale: "en",
  now: undefined,
  timeZone: CHAT_RENDER_TIME_ZONE,
  useRelativeDayLabels: false,
};
const CHAT_DRAFT_WRITE_DELAY_MS = 150;

function getChatDraftStorageKey({
  threadId,
  userId,
}: {
  threadId: string | null | undefined;
  userId: string | null | undefined;
}) {
  if (!threadId || !userId) {
    return null;
  }

  return `peels:chat-draft:${userId}:${threadId}`;
}

function readChatDraft(key: string) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeChatDraft(key: string, message: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, message);
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

function removeChatDraft(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

function getClientTimeZone() {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? CHAT_RENDER_TIME_ZONE
  );
}

const StyledChatWindow = styled.div`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: ${theme.colors.background.top};

  @media (min-width: 768px) {
    border-radius: ${theme.corners.base};
    border: 1px solid ${theme.colors.border.base};
  }
`;

const StyledMessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem 1rem 1rem;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  height: 100%;

  & p {
    color: ${theme.colors.text.ui.emptyState};
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 120%;
    text-wrap: balance;
  }
`;

const Day = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DayHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  align-items: stretch;

  & h3,
  & p {
    text-align: center;
    line-height: 100%;
    font-size: 0.75rem;
  }

  & h3 {
    font-weight: 500;
    color: ${theme.colors.text.ui.primary};
  }

  & p {
    color: ${theme.colors.text.ui.quaternary};
  }
`;

const ChatWindow = memo(function ChatWindow({
  isDrawer = false,
  user,
  listing,
  existingThread = null,
  isDemo = false,
  referenceNow,
}: ChatWindowProps) {
  const t = useTranslations();
  const locale = useLocale();
  const supabase = useMemo(() => (isDemo ? null : createClient()), [isDemo]);
  const { setUnreadCount, markThreadAsRead } = useUnreadMessages();
  const realListing = isDemo ? null : (listing as ChatListing);
  const sendMutation = useInlineMutation<ChatSendResult>();
  const lastReadSignatureRef = useRef<string | null>(null);
  const draftWriteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingDraftWriteRef = useRef<{
    key: string;
    message: string;
  } | null>(null);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(
    existingThread?.id ?? null
  );
  const [messages, setMessages] = useState<ChatMessageRecord[]>(
    getThreadMessages(existingThread)
  );
  const [clientTimeZone, setClientTimeZone] = useState<string | null>(null);
  const chatRenderOptions = useMemo<ChatRenderOptions>(
    () =>
      isDemo
        ? {
            locale,
            now: DEMO_CHAT_REFERENCE_TIME,
            timeZone: CHAT_RENDER_TIME_ZONE,
            useRelativeDayLabels: clientTimeZone !== null,
          }
        : {
            ...defaultChatRenderOptions,
            locale,
            now: referenceNow,
            timeZone: clientTimeZone ?? CHAT_RENDER_TIME_ZONE,
            useRelativeDayLabels: clientTimeZone !== null,
          },
    [clientTimeZone, isDemo, locale, referenceNow]
  );
  const messageDateKeys = useMemo(
    () =>
      messages.map((chatMessage) =>
        getChatDateKey(chatMessage.created_at, {
          timeZone: chatRenderOptions.timeZone,
        })
      ),
    [messages, chatRenderOptions.timeZone]
  );
  const draftStorageKey = isDemo
    ? null
    : getChatDraftStorageKey({
        threadId: existingThread?.id ?? threadId,
        userId: user?.id,
      });
  const hasUnsentMessage = !isDemo && message.trim().length > 0;
  const hasLocalThread = !existingThread && Boolean(threadId);

  useBeforeUnloadWarning(hasUnsentMessage && !sendMutation.isPending);

  function resolveChatErrorMessage(errorMessage: string | null) {
    if (!errorMessage) {
      return null;
    }

    if (errorMessage.includes("violates row-level security policy")) {
      if (
        errorMessage.includes("chat_threads") ||
        errorMessage.includes('"chat_threads"')
      ) {
        return t("Errors.tooManyThreads");
      }

      return t("Errors.tooManyMessages");
    }

    return errorMessage;
  }

  const clearPendingDraftWrite = useCallback(() => {
    if (draftWriteTimeoutRef.current) {
      clearTimeout(draftWriteTimeoutRef.current);
      draftWriteTimeoutRef.current = null;
    }
  }, []);

  const flushPendingDraftWrite = useCallback(() => {
    clearPendingDraftWrite();

    if (!pendingDraftWriteRef.current) {
      return;
    }

    const { key, message } = pendingDraftWriteRef.current;
    pendingDraftWriteRef.current = null;
    writeChatDraft(key, message);
  }, [clearPendingDraftWrite]);

  const scheduleDraftWrite = useCallback(
    (key: string, nextMessage: string) => {
      clearPendingDraftWrite();
      pendingDraftWriteRef.current = {
        key,
        message: nextMessage,
      };
      draftWriteTimeoutRef.current = setTimeout(() => {
        flushPendingDraftWrite();
      }, CHAT_DRAFT_WRITE_DELAY_MS);
    },
    [clearPendingDraftWrite, flushPendingDraftWrite]
  );

  const removeDraftWrite = useCallback(
    (key: string) => {
      if (pendingDraftWriteRef.current?.key === key) {
        clearPendingDraftWrite();
        pendingDraftWriteRef.current = null;
      }

      removeChatDraft(key);
    },
    [clearPendingDraftWrite]
  );

  useEffect(() => {
    const handlePageHide = () => {
      flushPendingDraftWrite();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingDraftWrite();
      }
    };

    window.addEventListener("beforeunload", handlePageHide);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handlePageHide);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushPendingDraftWrite]);

  useEffect(() => {
    setClientTimeZone(getClientTimeZone());
  }, []);

  useEffect(() => {
    flushPendingDraftWrite();
    setThreadId(existingThread?.id ?? null);
    setMessages(getThreadMessages(existingThread));
    lastReadSignatureRef.current = null;
  }, [existingThread, flushPendingDraftWrite]);

  useEffect(() => {
    flushPendingDraftWrite();

    if (hasLocalThread) {
      return;
    }

    setMessage(draftStorageKey ? readChatDraft(draftStorageKey) : "");
  }, [draftStorageKey, flushPendingDraftWrite, hasLocalThread]);

  useEffect(
    () => () => {
      flushPendingDraftWrite();
    },
    [flushPendingDraftWrite]
  );

  useEffect(() => {
    if (isDemo || !supabase || !threadId || !user?.id) {
      return;
    }

    const unreadMessageIds = messages
      .filter(
        (chatMessage) =>
          chatMessage.sender_id !== user.id && !chatMessage.read_at
      )
      .map((chatMessage) => chatMessage.id);

    if (unreadMessageIds.length === 0) {
      markThreadAsRead(threadId);
      lastReadSignatureRef.current = null;
      return;
    }

    const nextSignature = `${threadId}:${unreadMessageIds.join(",")}`;
    if (lastReadSignatureRef.current === nextSignature) {
      return;
    }

    lastReadSignatureRef.current = nextSignature;
    let isActive = true;

    void (async () => {
      const result = await markChatThreadRead({
        messages,
        supabase,
        threadId,
        userId: user.id,
      });

      if (!isActive) {
        return;
      }

      if (!result.success || !result.data) {
        lastReadSignatureRef.current = null;
        return;
      }

      const { readAt, readMessageIds } = result.data;

      const readMessageIdsSet = new Set(readMessageIds);
      setMessages((previousMessages) =>
        previousMessages.map((chatMessage) =>
          readMessageIdsSet.has(chatMessage.id)
            ? { ...chatMessage, read_at: readAt }
            : chatMessage
        )
      );
      setUnreadCount((previousCount: number) =>
        Math.max(0, previousCount - readMessageIds.length)
      );
      markThreadAsRead(threadId);
    })();

    return () => {
      isActive = false;
    };
  }, [
    isDemo,
    markThreadAsRead,
    messages,
    setUnreadCount,
    supabase,
    threadId,
    user?.id,
  ]);

  async function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    const messageToSend = message.trim();
    if (!messageToSend || sendMutation.isPending) {
      return;
    }

    const result = await sendMutation.run(
      async () => {
        if (isDemo || !supabase || !user?.id) {
          return {
            success: false,
            error: t("Errors.genericLater"),
          };
        }

        let nextThreadId = threadId;

        if (!nextThreadId) {
          if (!realListing) {
            return {
              success: false,
              error: t("Errors.genericLater"),
            };
          }

          const threadResult = await ensureChatThread({
            listing: realListing,
            supabase,
            userId: user.id,
          });

          if (!threadResult.success || !threadResult.data) {
            return {
              success: false,
              error: threadResult.error,
            };
          }

          nextThreadId = threadResult.data.threadId;
          setThreadId(nextThreadId);
          setMessages(threadResult.data.messages);
        }

        return sendChatMessage({
          content: messageToSend,
          supabase,
          threadId: nextThreadId,
          userId: user.id,
        });
      },
      {
        fallbackError: t("Errors.genericLater"),
      }
    );

    if (result?.success && result.data) {
      const { message: sentMessage, threadId: sentThreadId } = result.data;
      const sentDraftStorageKey = getChatDraftStorageKey({
        threadId: sentThreadId,
        userId: user?.id,
      });

      setThreadId(sentThreadId);
      setMessages((previousMessages) => [...previousMessages, sentMessage]);
      if (sentDraftStorageKey) {
        removeDraftWrite(sentDraftStorageKey);
      }
      setMessage("");
    }
  }

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (sendMutation.result.error) {
      sendMutation.reset();
    }

    const nextMessage = event.target.value;

    setMessage(nextMessage);

    if (!draftStorageKey) {
      return;
    }

    if (nextMessage.trim().length > 0) {
      scheduleDraftWrite(draftStorageKey, nextMessage);
    } else {
      removeDraftWrite(draftStorageKey);
    }
  };

  const role = isDemo
    ? "initiator"
    : existingThread
      ? existingThread.initiator_id === user?.id
        ? "initiator"
        : "owner"
      : "initiator";
  const otherPersonName =
    role === "initiator"
      ? (listing.owner_first_name ?? "")
      : (existingThread?.initiator_first_name ?? "");

  return (
    <StyledChatWindow data-testid="chat-window">
      <ChatHeader
        thread={existingThread ?? undefined}
        listing={listing}
        user={user}
        isDemo={isDemo}
        isDrawer={isDrawer}
      />

      <StyledMessagesContainer data-testid="chat-message-list">
        {messages.length === 0 && (
          <EmptyState data-testid="chat-empty-state">
            <p>{t("Chat.empty")}</p>
          </EmptyState>
        )}

        {messages.map((chatMessage, index) => {
          const currentDateKey = messageDateKeys[index];
          const previousDateKey = messageDateKeys[index - 1];
          const showDateHeader =
            index === 0 || currentDateKey !== previousDateKey;
          const showInitiationHeader = index === 0;

          return (
            <Day key={isDemo ? index : chatMessage.id}>
              {showDateHeader || showInitiationHeader ? (
                <DayHeader>
                  {showDateHeader && (
                    <h3 data-testid="chat-day-label">
                      {formatWeekday(chatMessage.created_at, {
                        locale: chatRenderOptions.locale,
                        now: chatRenderOptions.now,
                        timeZone: chatRenderOptions.timeZone,
                        useRelativeDayLabels:
                          chatRenderOptions.useRelativeDayLabels,
                      })}
                    </h3>
                  )}
                  {showInitiationHeader && (
                    <p>
                      {isDemo || chatMessage.sender_id === user?.id
                        ? t("Chat.youReachedOut", { name: otherPersonName })
                        : realListing?.owner_has_multiple_non_residential_listings &&
                            realListing.name
                          ? t("Chat.personReachedOutAbout", {
                              name: otherPersonName,
                              listing: realListing.name,
                            })
                          : t("Chat.personReachedOut", {
                              name: otherPersonName,
                            })}
                    </p>
                  )}
                </DayHeader>
              ) : null}

              <ChatMessage
                direction={
                  isDemo
                    ? DIRECTIONS_FOR_DEMO[index % 2]
                    : chatMessage.sender_id === user?.id
                      ? "sent"
                      : "received"
                }
                message={chatMessage}
                locale={chatRenderOptions.locale}
                timeZone={chatRenderOptions.timeZone}
              />
            </Day>
          );
        })}
      </StyledMessagesContainer>

      <ChatComposer
        onSubmit={handleSubmit}
        message={message}
        handleMessageChange={handleMessageChange}
        recipientName={otherPersonName}
        error={resolveChatErrorMessage(sendMutation.result.error)}
        isDemo={isDemo}
        isSending={sendMutation.isPending}
      />
    </StyledChatWindow>
  );
});

export default ChatWindow;
