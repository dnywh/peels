import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";
import { getChatThreads } from "@/features/chat/chatData";
import { currentPathHeaderName } from "@/utils/supabase/authState";
import { normaliseNextPath } from "@/utils/authRedirects";
import { headers } from "next/headers";
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
    const currentPath = (await headers()).get(currentPathHeaderName);
    const redirectTo = normaliseNextPath(currentPath, "/chats");
    redirect(`/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`);
  }

  const threads = await getChatThreads(supabase, user.id);

  return (
    <ChatPageClient user={user} initialThreads={threads}>
      {children}
    </ChatPageClient>
  );
}
