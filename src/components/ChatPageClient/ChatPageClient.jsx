"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Chat from "@/components/Chat";
import StorageImage from "@/components/StorageImage";

// import { createClient } from "@/utils/supabase/server";

export default function ChatPageClient({ user, threads }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    const threadId = pathname.split("/").pop();
    if (threadId && threadId !== "chats") {
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [pathname, threads]);

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    router.push(`/chats/${thread.id}`);
  };

  return (
    <div className="chat-page-layout">
      <div className="threads-sidebar">
        {threads.map((thread) => {
          const otherPersonName =
            thread.initiator_id === user.id
              ? thread.owner_first_name
              : thread.initiator_first_name;

          const displayName =
            thread.listing?.type !== "residential" &&
            thread.owner_id ===
              (thread.initiator_id === user.id
                ? thread.owner_id
                : thread.initiator_id)
              ? `${otherPersonName}, ${thread.listing.name}`
              : otherPersonName;

          // console.log(thread.listing_slug);

          return (
            <div
              key={thread.id}
              className={`"thread-preview" ${selectedThread?.id === thread.id ? "selected" : ""}`}
              onClick={() => handleThreadSelect(thread)}
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
          <>
            <p>Listing slug: {selectedThread.listing_slug}</p>
            <p>Listing name: {selectedThread.listing_name}</p>
            <p>Listing image: {selectedThread.listing_avatar}</p>
            <StorageImage
              bucket="listing_avatars"
              filename={selectedThread.listing_avatar}
              alt={selectedThread.listing_name}
              style={{ width: "100px", height: "100px" }}
            />
            <Chat
              user={user}
              listing={selectedThread.listing}
              existingThread={{
                ...selectedThread,
                chat_messages: selectedThread.chat_messages_with_senders,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
