// "use client";
import Chat from "@/components/Chat";

import { createClient } from "@/utils/supabase/server";

export default async function ChatPageClient({ user }) {
  const supabase = await createClient();

  // First, get the threads with messages and listing info
  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select(
      `
      *,
      chat_messages (*),
      listing:listings (
        name,
        type
      )
    `
    )
    .or(`initiator_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("created_at", { foreignTable: "chat_messages", ascending: true });

  if (error) {
    console.error("Error fetching chat threads:", error);
    return null;
  }

  // Then, get all the profiles we need
  const userIds = threads.reduce((acc, thread) => {
    acc.add(thread.initiator_id);
    acc.add(thread.owner_id);
    return acc;
  }, new Set());

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name")
    .in("id", Array.from(userIds));

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return null;
  }

  // Create a map for easy profile lookup
  const profilesMap = Object.fromEntries(
    profiles.map((profile) => [profile.id, profile])
  );

  return (
    <div>
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
          <div key={thread.id}>
            <h3>Chat with {displayName}</h3>
            {thread.chat_messages.map((message) => (
              <div key={message.id}>
                <p>{message.content}</p>
                <p>
                  <small>
                    {message.sender_id === user.id ? "You" : displayName}
                  </small>
                </p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

{
  /* 1. Get all chat threads for user */
}
{
  /* Do this by getting all threads where the user is either the initiator or the owner */
}
{
  /* 2. For each thread, get the messages */
}
{
  /* 3. Render the messages */
}
