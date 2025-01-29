"use client";
import { useState, useEffect, memo, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Drawer } from "vaul"; // TODO: Import only used subcomponents?

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/

import { createClient } from "@/utils/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import ChatComposer from "@/components/ChatComposer";
import IconButton from "@/components/IconButton";
import Hyperlink from "@/components/Hyperlink";

import { styled } from "@pigment-css/react";

const StyledChatWindow = styled("div")({
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  "@media (min-width: 768px)": {
    // border: "1px solid #e0e0e0",
    borderRadius: "0.5rem",
  },
});

const ChatHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0.5rem",
  borderBottom: `1px solid ${theme.colors.border.base}`,
  backgroundColor: theme.colors.background.top,
  padding: "1rem",
}));

const StyledMessagesContainer = styled("div")({
  flex: 1,
  padding: "1rem",
  overflowY: "scroll",
});

// Memoize the ChatWindow component
const ChatWindow = memo(function ChatWindow({
  isDrawer = false,
  user,
  listing,
  existingThread = null,
  demo = false,
}) {
  const router = useRouter();
  // Move Supabase client creation outside of render
  const supabase = demo ? null : useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(existingThread?.id || null);
  const [messages, setMessages] = useState([]);

  const [listingIsOwnedByUser, setListingIsOwnedByUser] = useState(false);

  const [messageSendError, setMessageSendError] = useState(null);

  const recipientName = useMemo(() => {
    if (!listing || !user) return "";

    // If user is the listing owner, show the initiator's name
    if (listingIsOwnedByUser) {
      return existingThread?.initiator_first_name || "";
    }

    // Otherwise, show the owner's name (and listing name for business/community)
    return listing.owner_first_name || "Private Host";
  }, [listing, user, listingIsOwnedByUser, existingThread]);

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

  // Check if the listing is owned by the user
  useEffect(() => {
    if (demo) return;
    // console.log("Existing thread owned by user?", { existingThread, threadId });
    console.log("existingThread", existingThread);
    if (existingThread && existingThread.owner_id === user.id) {
      console.log("Existing thread is owned by user");
      setListingIsOwnedByUser(true);
    } else {
      setListingIsOwnedByUser(false);
    }
  }, []);

  // Update messages when existingThread changes
  useEffect(() => {
    if (existingThread?.chat_messages_with_senders) {
      console.log(existingThread);
      setMessages(existingThread.chat_messages_with_senders);
    } else if (existingThread?.chat_messages) {
      setMessages(existingThread.chat_messages);
    }
  }, [existingThread]);

  async function initializeChat() {
    if (demo) return;

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
    if (demo) return;

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

  return (
    <StyledChatWindow>
      <ChatHeader>
        {!isDrawer && (
          <IconButton
            breakpoint="sm"
            action="back"
            onClick={() => router.push("/chats")}
          />
        )}
        {isDrawer && (
          <>
            <VisuallyHidden.Root>
              <Drawer.Title>
                Nested chat drawer title visually hidden TODO
              </Drawer.Title>
              <Drawer.Description>
                Test description for aria visually hidden TODO.
              </Drawer.Description>
            </VisuallyHidden.Root>

            <Drawer.Close asChild>
              <IconButton action="close" />
            </Drawer.Close>

            {/* <IconButton onClick={handleChatClose}>Close</IconButton> */}
          </>
        )}

        {/* TODO: the below should  be flexible enough to show 'Mary, Ferndale Community Garden' (community or business listing), 'Mary' (residential listing)  */}
        {/* TODO: Extract and have a 'recipientName' const and a more malleable 'recipient and their listing name' as per above */}
        <p>
          {recipientName}
          {!listingIsOwnedByUser && listing?.type !== "residential" && (
            <>, {listing.name}</>
          )}
        </p>

        {!listingIsOwnedByUser && (
          <Hyperlink href={`/listings/${listing.slug}`}>View listing</Hyperlink>
        )}
        {/* TODO: Overflow menu to block user via Dialog, even if manual for now */}
      </ChatHeader>

      <StyledMessagesContainer>
        {messages.length === 0 && <p>No messages yet</p>}
        {messages.length > 0 &&
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              direction={
                demo
                  ? "received"
                  : message.sender_id === user.id
                    ? "sent"
                    : "received"
              }
              message={message}
            />
          ))}
      </StyledMessagesContainer>

      <ChatComposer
        onSubmit={handleSubmit}
        message={message}
        handleMessageChange={handleMessageChange}
        recipientName={recipientName}
        error={messageSendError}
      />
    </StyledChatWindow>
  );
});

export default ChatWindow;
