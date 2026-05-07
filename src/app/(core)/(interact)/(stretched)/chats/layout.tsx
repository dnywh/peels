import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";
import { getChatThreads } from "@/features/chat/chatData";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ChatsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect_to=/chats");
  }

  const threads = await getChatThreads(supabase, user.id);

  return (
    <ChatPageClient user={user} initialThreads={threads}>
      {children}
    </ChatPageClient>
  );
}
