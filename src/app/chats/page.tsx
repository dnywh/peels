import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";

export default async function ChatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  console.log("Threads from server:", threads);

  const userIds = threads.reduce((acc, thread) => {
    acc.add(thread.initiator_id);
    acc.add(thread.owner_id);
    return acc;
  }, new Set());

  console.log("User IDs from server:", userIds);

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

  console.log("Profiles from server:", profiles, profilesMap);

  if (!user) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p>Contact folks on Peels.</p>
          <GuestActions />
        </div>
      </div>
    );
  }

  return (
    <ChatPageClient user={user} threads={threads} profilesMap={profilesMap} />
  );
}
