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
  user,
  listing,
  listingName,
  setIsChatDrawerOpen,
  existingThread = null,
  isDrawer = false,
}) {
  console.log({ listing });
  const router = useRouter();
  // Move Supabase client creation outside of render
  const supabase = useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(existingThread?.id || null);
  const [messages, setMessages] = useState([]);

  const [listingIsOwnedByUser, setListingIsOwnedByUser] = useState(false);

  // console.log("Chat window component rendering");

  // Check if the listing is owned by the user
  useEffect(() => {
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
      setMessages(existingThread.chat_messages_with_senders);
    } else if (existingThread?.chat_messages) {
      setMessages(existingThread.chat_messages);
    }
  }, [existingThread]);

  async function initializeChat() {
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

      if (error) throw error;

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

      if (createError) throw createError;

      setThreadId(newThread.id);
      return newThread;
    } catch (error) {
      console.error("Error in initializeChat:", error);
      return null;
    }
  }

  async function loadMessages(threadId) {
    const { data: messages, error } = await supabase
      .from("chat_messages_with_senders")
      .select()
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(messages || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
      console.error("Error in handleSubmit:", error);
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
      console.error("Error sending message:", error);
      return;
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
        <p>
          {!listingIsOwnedByUser
            ? listing?.profiles?.first_name || existingThread?.owner_first_name
            : existingThread?.initiator_first_name}

          {!listingIsOwnedByUser &&
            listing?.type !== "residential" &&
            `, ${listing?.name}`}
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
              direction={message.sender_id === user.id ? "sent" : "received"}
              message={message}
            />
          ))}
      </StyledMessagesContainer>

      <ChatComposer
        onSubmit={handleSubmit}
        message={message}
        handleMessageChange={handleMessageChange}
      />
    </StyledChatWindow>
  );
});

export default ChatWindow;
