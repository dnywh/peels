"use client";
import { theme } from "@/styles/theme.yak";

import { useState, useEffect, memo, useMemo } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";

import ChatMessage from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatHeader from "@/components/ChatHeader";

import { formatWeekday } from "@/utils/dateUtils";

import { styled } from "next-yak";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useTranslations } from "next-intl";
import type {
  ChatListing,
  ChatMessageRecord,
  ChatThreadRecord,
} from "@/types/chat";
import type { DemoListing } from "@/types/listing";

type ChatWindowProps = {
  isDrawer?: boolean;
  user: User | null;
  listing: ChatListing | DemoListing;
  existingThread?: ChatThreadRecord | null;
  isDemo?: boolean;
};

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

// Memoize the ChatWindow component
const ChatWindow = memo(function ChatWindow({
  isDrawer = false,
  user,
  listing,
  existingThread = null,
  isDemo = false,
}: ChatWindowProps) {
  const t = useTranslations();
  // const router = useRouter();
  // Move Supabase client creation outside of render
  const supabase = useMemo(() => (isDemo ? null : createClient()), [isDemo]);
  const { setUnreadCount, markThreadAsRead } = useUnreadMessages();
  const realListing = isDemo ? null : (listing as ChatListing);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(
    existingThread?.id || null
  );
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [messageSendError, setMessageSendError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  function handleChatSendError(error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong.";

    // Turn the rate limiting message into something more friendly (original: new row violates row-level security policy for table "chat_messages")
    if (errorMessage.includes("violates row-level security policy")) {
      if (
        errorMessage.includes("chat_threads") ||
        errorMessage.includes('"chat_threads"')
      ) {
        setMessageSendError(t("Errors.tooManyThreads"));
      } else {
        setMessageSendError(t("Errors.tooManyMessages"));
      }
    } else {
      setMessageSendError(errorMessage);
    }
  }

  // Update messages when existingThread changes
  // TODO: The if statement seems repetitive, what's the difference between the two?
  useEffect(() => {
    if (existingThread?.chat_messages_with_senders) {
      setMessages(existingThread.chat_messages_with_senders);
    } else if (existingThread?.chat_messages) {
      setMessages(existingThread.chat_messages);
    }
  }, [existingThread]);

  // Mark messages as read when thread is viewed
  useEffect(() => {
    if (isDemo || !supabase || !existingThread?.id || !user) return;

    const markMessagesAsRead = async () => {
      try {
        console.log(
          "Checking for unread messages in thread:",
          existingThread.id
        );

        const { data: unreadMessages, error: countError } = await supabase
          .from("chat_messages")
          .select("id")
          .eq("thread_id", existingThread.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        if (countError) {
          console.error("Error getting unread count:", countError);
          return;
        }

        const unreadCount = unreadMessages?.length || 0;
        console.log("Unread messages found:", unreadCount);
        if (unreadCount === 0) return;

        // Mark messages as read in database
        const { error } = await supabase
          .from("chat_messages")
          .update({ read_at: new Date().toISOString() })
          .eq("thread_id", existingThread.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        if (error) {
          console.error("Error marking messages as read:", error);
          return;
        }

        // Update the messages state
        setMessages((prevMessages: ChatMessageRecord[]) =>
          prevMessages.map((msg) =>
            msg.sender_id !== user.id
              ? { ...msg, read_at: new Date().toISOString() }
              : msg
          )
        );

        // Update global unread count AND mark thread as read
        setUnreadCount((prevCount: number) =>
          Math.max(0, prevCount - unreadCount)
        );
        markThreadAsRead(existingThread.id);

        console.log("Messages marked as read, new unread count:", unreadCount);
      } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
      }
    };

    markMessagesAsRead();
  }, [
    existingThread?.id,
    user,
    supabase,
    setUnreadCount,
    isDemo,
    markThreadAsRead,
  ]);

  async function initializeChat() {
    if (isDemo || !supabase || !user?.id) return null;

    if (!realListing?.id || !realListing.owner_id) {
      return null;
    }

    try {
      const { data: thread, error } = await supabase
        .from("chat_threads")
        .select("id")
        .match({
          listing_id: realListing.id,
          initiator_id: user.id,
          owner_id: realListing.owner_id,
        })
        .maybeSingle();

      if (error) {
        handleChatSendError(error);
        return;
      }

      if (thread) {
        setThreadId(thread.id);
        await loadMessages(thread.id);
        return thread;
      }

      const { data: newThread, error: createError } = await supabase
        .from("chat_threads")
        .upsert(
          {
            listing_id: realListing.id,
            initiator_id: user.id,
            owner_id: realListing.owner_id,
          },
          {
            onConflict: "listing_id,initiator_id,owner_id",
            ignoreDuplicates: true,
          }
        )
        .select()
        .maybeSingle();

      if (createError) {
        handleChatSendError(createError);
        return;
      }

      if (!newThread?.id) return null;

      setThreadId(newThread.id);
      return newThread;
    } catch (error) {
      handleChatSendError(error);
      return null;
    }
  }

  async function loadMessages(threadId: string) {
    if (isDemo || !supabase) return;

    const { data: messages, error } = await supabase
      .from("chat_messages_with_senders")
      .select()
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      handleChatSendError(error);
      return;
    }
    setMessages(messages || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessageSendError(null);

    const messageToSend = message.trim();
    if (!messageToSend || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      if (threadId) {
        await sendMessage(threadId, messageToSend);
        return;
      }

      const thread = await initializeChat();
      if (thread?.id) {
        await sendMessage(thread.id, messageToSend);
      }
    } catch (error) {
      handleChatSendError(error);
      return;
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function sendMessage(threadId: string, content: string) {
    if (isDemo || !supabase || !user?.id) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content,
      })
      .select();

    if (error) {
      handleChatSendError(error);
      return;
    }

    // Message sent, clear message and reload messages
    setMessage("");
    await loadMessages(threadId);
  }

  // Optimize the textarea onChange handler
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const directionsForDemo = ["sent", "received"] as const;

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
        {messages.length > 0 &&
          messages.map((message, index) => {
            // Check if this message is the first of its day
            const showDateHeader =
              index === 0 ||
              new Date(message.created_at).toDateString() !==
                new Date(messages[index - 1].created_at).toDateString();

            // Check if this is the first message at all
            const showInitiationHeader = index === 0;

            return (
              <Day key={isDemo ? index : message.id}>
                {showDateHeader || showInitiationHeader ? (
                  <DayHeader>
                    {showDateHeader && (
                      <h3>{formatWeekday(message.created_at)}</h3>
                    )}
                    {showInitiationHeader && (
                      <p>
                        {isDemo || message.sender_id === user?.id
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
                      ? directionsForDemo[index % 2]
                      : message.sender_id === user?.id
                        ? "sent"
                        : "received"
                  }
                  message={message}
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
        error={messageSendError}
        isDemo={isDemo}
        isSending={isSendingMessage}
      />
    </StyledChatWindow>
  );
});

export default ChatWindow;
