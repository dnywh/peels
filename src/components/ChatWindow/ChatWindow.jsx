"use client";

import { useState, useEffect, memo, useMemo } from "react";

import { createClient } from "@/utils/supabase/client";

import ChatMessage from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import ChatHeader from "@/components/ChatHeader";

import { formatWeekday } from "@/utils/dateUtils";

import { styled } from "@pigment-css/react";

const StyledChatWindow = styled("div")(({ theme }) => ({
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: theme.colors.background.top,

  "@media (min-width: 768px)": {
    borderRadius: theme.corners.base,
    border: `1px solid ${theme.colors.border.base}`,
  },
}));

const StyledMessagesContainer = styled("div")({
  flex: 1,
  padding: "1.5rem 1rem 1rem",
  overflowY: "scroll",

  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const EmptyState = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",

  "& p": {
    color: theme.colors.text.ui.emptyState,
    fontSize: "1.2rem",
    fontWeight: "500",
    lineHeight: "120%",
    textWrap: "balance",
  },
}));

const Day = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
}));

const DayHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
  alignItems: "stretch",

  "& h3, & p": {
    textAlign: "center",
    lineHeight: "100%",
    fontSize: "0.75rem", // Match timestamp font size
  },

  "& h3": {
    fontWeight: "600",
    color: theme.colors.text.ui.primary,
  },

  "& p": {
    color: theme.colors.text.ui.quaternary,
  },
}));

// Memoize the ChatWindow component
const ChatWindow = memo(function ChatWindow({
  isDrawer = false,
  user,
  listing,
  existingThread = null,
  isDemo = false,
}) {
  // const router = useRouter();
  // Move Supabase client creation outside of render
  const supabase = isDemo ? null : useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(existingThread?.id || null);
  const [messages, setMessages] = useState([]);
  const [messageSendError, setMessageSendError] = useState(null);

  function handleChatSendError(error) {
    // Turn the rate limiting message into something more friendly (original: new row violates row-level security policy for table "chat_messages")
    if (error.message.includes("violates row-level security policy")) {
      setMessageSendError(
        "You’ve sent too many messages. Please try again later."
      );
    } else {
      setMessageSendError(error.message);
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

  async function initializeChat() {
    if (isDemo) return;

    try {
      console.log("Initializing chat:", {
        listing_id: listing?.id,
        initiator_id: user?.id,
      });

      const { data: thread, error } = await supabase
        .from("chat_threads")
        .select("id")
        .match({
          listing_id: listing.id,
          initiator_id: user.id,
          owner_id: listing.owner_id,
        })
        .maybeSingle();

      if (error) {
        handleChatSendError(error);
        return;
      }

      if (thread) {
        setThreadId(thread.id);
        loadMessages(thread.id);
        console.log("Thread found:", thread);
        return thread;
      }

      const { data: newThread, error: createError } = await supabase
        .from("chat_threads")
        .upsert(
          {
            listing_id: listing.id,
            initiator_id: user.id,
            owner_id: listing.owner_id,
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

      setThreadId(newThread.id);
      return newThread;
    } catch (error) {
      handleChatSendError(error);
      return null;
    }
  }

  async function loadMessages(threadId) {
    if (isDemo) return;

    const { data: messages, error } = await supabase
      // TODO: Check, is there a mismatch or duplication of efforts/data between the  `listing:listings_with_owner_data` join in [[...threadId]] page.js and the data retrieved here?
      .from("chat_messages_with_senders")
      .select()
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      handleChatSendError(error);
      return;
    }

    console.log("Messages loaded:", messages);
    setMessages(messages || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessageSendError(null);

    if (!message.trim()) return;

    try {
      if (threadId) {
        await sendMessage(threadId);
        return;
      }

      const thread = await initializeChat();
      if (thread) {
        await sendMessage(thread.id);
      }
    } catch (error) {
      handleChatSendError(error);
      return;
    }
  }

  async function sendMessage(threadId) {
    if (isDemo) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: message.trim(),
      })
      .select();

    if (error) {
      handleChatSendError(error);
    }

    // Message sent, clear message and reload messages
    console.log("Message sent:", message);
    setMessage("");
    loadMessages(threadId);
  }

  // Optimize the textarea onChange handler
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const directionsForDemo = ["sent", "received"];

  const role = isDemo
    ? "initiator"
    : existingThread
      ? existingThread.initiator_id === user.id
        ? "initiator"
        : "owner"
      : "initiator";

  const otherPersonName =
    role === "initiator"
      ? listing.owner_first_name
      : existingThread.initiator_first_name;

  return (
    <StyledChatWindow>
      <ChatHeader
        thread={existingThread ? existingThread : undefined}
        listing={listing}
        user={user}
        isDemo={isDemo}
        isDrawer={isDrawer}
      />

      <StyledMessagesContainer>
        {messages.length === 0 && (
          <EmptyState>
            <p>No messages yet</p>
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
                          ? `You reached out to ${otherPersonName}`
                          : `${otherPersonName} reached out to you`}
                      </p>
                    )}
                  </DayHeader>
                ) : null}
                <ChatMessage
                  direction={
                    isDemo
                      ? directionsForDemo[index % 2]
                      : message.sender_id === user.id
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
      />
    </StyledChatWindow>
  );
});

export default ChatWindow;
