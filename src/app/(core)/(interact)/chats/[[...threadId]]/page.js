import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";

export default async function ChatsPage(props) {
    const params = await props.params;
    // Prepare active thread if provided
    // params itself is a promise in Next.js 13+.
    // The error message is a bit misleading - you don't need to await params itself, but rather any async operations that use those params. In your case, just accessing the array value is synchronous.
    const threadId = params?.threadId?.[0] ?? null;

    // Get user data
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get threads belonging to user
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
        <ChatPageClient
            user={user}
            initialThreads={threads}
            initialThreadId={threadId}
        />
    );
}

