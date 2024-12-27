"use client";
import { useState, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";

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

  async function initializeChat() {
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

    if (thread) {
      console.log("Thread exists, loading it");
      setThreadId(thread.id);
      loadMessages(thread.id);
    }

    return thread;
  }

  async function loadMessages(threadId) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    setMessages(messages || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!message.trim()) {
      console.log("Message is empty");
      return;
    }

    // If we have an existing thread, use it directly
    if (threadId) {
      await sendMessage(threadId);
      return;
    }

    // Only try to initialize/create thread if we don't have one
    const existingOrNewThread = await initializeChat();
    if (existingOrNewThread) {
      await sendMessage(existingOrNewThread.id);
    }
  }

  async function sendMessage(threadId) {
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
            <p>{message.content}</p>
            <small>{new Date(message.created_at).toLocaleString()}</small>
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
