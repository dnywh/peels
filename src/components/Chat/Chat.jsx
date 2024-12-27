"use client";
import { useState, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";
import { testEmailAction } from "@/app/actions";

export default function Chat({ user, listing, setIsChatOpen }) {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);

  const supabase = createClient();

  useEffect(() => {
    initializeChat();
  }, [listing.id, user.id]);

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

    // First check if thread exists
    const existingThread = await initializeChat();

    if (existingThread) {
      // Use existing thread
      await sendMessage(existingThread.id);
    } else {
      // Create new thread if none exists
      const { data: nextThread, error } = await supabase
        .from("chat_threads")
        .insert({
          listing_id: listing.id,
          initiator_id: user.id,
          owner_id: listing.owner_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating thread:", error);
        return;
      }

      setThreadId(nextThread.id);
      console.log("New thread created:", nextThread);
      await sendMessage(nextThread.id);
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
      <button onClick={() => setIsChatOpen(false)}>Close chat</button>
      <p>User viewing is {user.id}</p>
      <p>
        About to message {listing.name}, owned by {listing.owner_id}
      </p>

      <div>
        <h3>Messages container</h3>

        {messages.map((message) => (
          <div key={message.id}>
            <p>{message.content}</p>
            <small>{new Date(message.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`Send a message to ${listing.name}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
