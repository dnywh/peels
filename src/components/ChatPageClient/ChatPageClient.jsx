"use client";
import { useState } from "react";
import Chat from "@/components/Chat";

// import { createClient } from "@/utils/supabase/server";

export default function ChatPageClient({ user, threads, profilesMap }) {
  const [selectedThread, setSelectedThread] = useState(null);

  return (
    <div className="chat-page-layout">
      <div className="threads-sidebar">
        {threads.map((thread) => {
          const otherPersonId =
            thread.initiator_id === user.id
              ? thread.owner_id
              : thread.initiator_id;
          const otherPerson = profilesMap[otherPersonId];
          const displayName =
            thread.listing?.type !== "residential" &&
            thread.owner_id === otherPersonId
              ? `${otherPerson.first_name}, ${thread.listing.name}`
              : otherPerson.first_name;

          return (
            <div
              key={thread.id}
              className={`thread-preview ${selectedThread?.id === thread.id ? "selected" : ""}`}
              onClick={() => setSelectedThread(thread)}
            >
              <h3>{displayName}</h3>
              {thread.chat_messages_with_senders?.length > 0 && (
                <p className="last-message">
                  {
                    thread.chat_messages_with_senders[
                      thread.chat_messages_with_senders.length - 1
                    ].content
                  }
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-window">
        {selectedThread && (
          <Chat
            user={user}
            listing={selectedThread.listing}
            existingThread={{
              ...selectedThread,
              chat_messages: selectedThread.chat_messages_with_senders,
            }}
          />
        )}
      </div>
    </div>
  );
}
