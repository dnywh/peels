"use client";
import { useState, useEffect, memo, useMemo } from "react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import SubmitButton from "@/components/submit-button";
// Memoize the ChatWindow component
const ChatWindow = memo(function ChatWindow({
  user,
  listing,
  setIsChatOpen,
  existingThread = null,
}) {
  // Move Supabase client creation outside of render
  const supabase = useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(existingThread?.id || null);
  const [messages, setMessages] = useState(existingThread?.chat_messages || []);

  const [listingIsOwnedByUser, setListingIsOwnedByUser] = useState(false);

  console.log("Chat window component rendering");

  // Check if the listing is owned by the user
  useEffect(() => {
    if (existingThread && existingThread.owner_id !== user.id) {
      setListingIsOwnedByUser(false);
      console.log(listing);
    } else {
      console.log("Existing thread is owned by user");
      setListingIsOwnedByUser(true);
    }
  }, []);

  // Only update when existingThread actually changes
  useEffect(() => {
    if (existingThread && existingThread.id !== threadId) {
      setThreadId(existingThread.id);
      setMessages(existingThread.chat_messages || []);
    }
  }, [existingThread, threadId]);

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
    <div>
      {setIsChatOpen && (
        <button onClick={() => setIsChatOpen(false)}>Close chat</button>
      )}

      {!listingIsOwnedByUser && (
        <Link href={`/listings/${listing.slug}`}>View listing</Link>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            direction={message.sender_id === user.id ? "sent" : "received"}
            message={message}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Send a message..."
          value={message}
          onChange={handleMessageChange}
        />
        <SubmitButton>Send</SubmitButton>
      </form>
    </div>
  );
});

// Add display name for dev tools
ChatWindow.displayName = "ChatWindow";

export default ChatWindow;
