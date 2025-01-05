import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";

export default async function ChatsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: threads } = await supabase
        .from("chat_threads_with_participants")
        .select(`
            *,
            chat_messages_with_senders (*),
            listing:listings (
                name,
                type,
                slug,
                visibility
            )
        `)
        .or(`initiator_id.eq.${user?.id},owner_id.eq.${user?.id}`);

    return (
        <div className="scrollable">
            <ChatPageClient user={user} initialThreads={threads} />
        </div>
    );
}

