"use client";
import { useState, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";
import StorageImage from "@/components/StorageImage";

export default function Chat({
  user,
  listing,
  setIsChatOpen,
  existingThread = null,
}) {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(existingThread?.id || null);
  const [messages, setMessages] = useState(existingThread?.chat_messages || []);

  const supabase = createClient();

  useEffect(() => {
    if (!threadId && !existingThread) {
      initializeChat();
    }
  }, [listing?.id, user.id]);

  // Update contents if existingThread changes (i.e. if I select a different thread)
  useEffect(() => {
    if (existingThread) {
      setThreadId(existingThread.id);
      setMessages(existingThread.chat_messages || []);
    }
  }, [existingThread]);

  async function initializeChat() {
    try {
      console.log("Initializing chat with:", {
        listing_id: listing?.id,
        initiator_id: user?.id,
        owner_id: listing?.owner_id,
      });

      // Get existing thread only (don't create new one)
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
        console.error("Error initializing chat:", error);
        return null;
      }

      if (thread) {
        console.log("Thread exists, loading it");
        setThreadId(thread.id);
        loadMessages(thread.id);
        return thread;
      }

      // Create new thread if one doesn't exist
      console.log("Creating new thread...");
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
        .single();

      if (createError) {
        console.error("Error creating new thread:", createError);
        return null;
      }

      console.log("New thread created:", newThread);
      setThreadId(newThread.id);
      return newThread;
    } catch (error) {
      console.error("Error in initializeChat:", error);
      return null;
    }
  }

  async function loadMessages(threadId) {
    const { data: messages } = await supabase
      .from("chat_messages_with_senders")
      .select()
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    setMessages(messages || []);
  }

  // console.log("Messages:", messages);

  async function handleSubmit(e) {
    console.log("handleSubmit called...");

    e.preventDefault();

    try {
      if (!message.trim()) {
        console.log("Message is empty");
        return;
      }

      // If we have an existing thread, use it directly
      if (threadId) {
        console.log("Sending message to existing thread...");
        await sendMessage(threadId);
        return;
      }

      console.log("No existing thread, attempting to initialize...");
      // Only try to initialize/create thread if we don't have one
      const existingOrNewThread = await initializeChat();
      console.log("Initialize chat result:", existingOrNewThread);

      if (existingOrNewThread) {
        console.log("Sending message to new thread...");
        await sendMessage(existingOrNewThread.id);
      } else {
        console.log("No thread was created or found");
        // You might want to handle this case - perhaps create a new thread here
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  }

  async function sendMessage(threadId) {
    console.log("sendMessage called...");
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: message.trim(),
      })
      .select();

    console.log("Send message response:", { data, error });

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    // Was successful
    // Email triggered by Supabase webhook, which in turn triggers the resend edge function
    // If successful, clear message and reload messages
    console.log("Message sent:", message);
    setMessage("");
    loadMessages(threadId);
  }

  return (
    <div>
      {setIsChatOpen && (
        <button onClick={() => setIsChatOpen(false)}>Close chat</button>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.sender_id === user.id ? "sent" : "received"}
          >
            {message.sender_avatar && (
              <StorageImage
                bucket="avatars"
                filename={message.sender_avatar}
                alt={`Avatar for ${message.sender_first_name}`}
                style={{ width: "64px", height: "64px" }}
              />
            )}
            <p>{message.content}</p>
            <p>
              <small>Sent by {message.sender_first_name}</small>
            </p>
            <p>
              <small>{new Date(message.created_at).toLocaleString()}</small>
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`Send a message...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
