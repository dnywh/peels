import "server-only";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  getChatThreads,
  getSelectedChatThread,
} from "@/features/chat/chatData";

export const getAuthenticatedChatUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});

export const getCurrentChatThreads = cache(async () => {
  const { supabase, user } = await getAuthenticatedChatUser();

  if (!user) {
    return {
      user: null,
      threads: [],
    };
  }

  const threads = await getChatThreads(supabase, user.id);

  return {
    user,
    threads,
  };
});

export const getCurrentSelectedChatThread = cache(async (threadId: string) => {
  const { supabase, user } = await getAuthenticatedChatUser();

  if (!user) {
    return {
      user: null,
      selectedThread: null,
    };
  }

  const selectedThread = await getSelectedChatThread(
    supabase,
    user.id,
    threadId
  );

  return {
    user,
    selectedThread,
  };
});
