import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";

export default async function ChatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return <ChatPageClient user={user} />;
}
