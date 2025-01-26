import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatPageClient from "@/components/ChatPageClient";

export const metadata = {
    title: 'Chats',
}

export default async function ChatsPage(props) {
    const params = await props.params;
    // Prepare active thread if provided
    // params itself is a promise in Next.js 13+.
    // The error message is a bit misleading - you don't need to await params itself, but rather any async operations that use those params. In your case, just accessing the array value is synchronous.
    const threadId = params?.threadId?.[0];

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
            listing:listings_with_owner_data (
                name,
                owner_first_name,
                type,
                slug,
                visibility
            )
        `)
        .or(`initiator_id.eq.${user?.id},owner_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

    // Validate thread access if threadId exists
    if (threadId && !threads?.some(t => t.id === threadId)) {
        console.log("Thread not found or access denied, redirecting...");
        redirect('/chats');
    }

    return (
        <ChatPageClient
            user={user}
            initialThreads={threads}
            initialThreadId={threadId}
        />
    );
}

