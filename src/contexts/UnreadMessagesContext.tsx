"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

type ThreadReadStatus = Record<string, boolean>;

type UnreadMessageRow = {
  id: string;
};

type ChatMessagePayload = {
  id: string;
  sender_id: string | null;
  thread_id: string | null;
};

type UnreadMessagesContextValue = {
  unreadCount: number;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  markThreadAsRead: (threadId: string) => void;
  isThreadRead: (threadId: string) => boolean;
  shouldShowUnreadIndicator: boolean;
};

const UnreadMessagesContext = createContext<
  UnreadMessagesContextValue | undefined
>(undefined);
const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

function getThreadIdFromPathname(pathname: string) {
  return pathname.match(/\/chats\/([^/]+)/)?.[1] ?? null;
}

export function UnreadMessagesProvider({ children }: PropsWithChildren) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [threadReadStatus, setThreadReadStatus] = useState<ThreadReadStatus>(
    {}
  );
  const [hasViewedChats, setHasViewedChats] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();

  useEffect(() => {
    let isActive = true;

    async function checkUnreadMessages() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isActive) return;

        const { data: unreadMessages, error } = await supabase
          .from("chat_messages")
          .select("id")
          .neq("sender_id", user.id)
          .is("read_at", null);

        if (error) {
          console.error("Error checking unread messages:", error);
          return;
        }

        if (!isActive) return;
        setUnreadCount(
          (unreadMessages as UnreadMessageRow[] | null)?.length ?? 0
        );
      } catch (error) {
        console.error("Error in checkUnreadMessages:", error);
      }
    }

    void checkUnreadMessages();

    return () => {
      isActive = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (pathname === "/chats") {
      setHasViewedChats(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isAuthDebugEnabled) {
      console.log("Setting up auth listener");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isAuthDebugEnabled) return;

      console.log("Auth event:", event);
      console.log("Session:", session ? "exists" : "none");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    async function setupSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      activeChannel = supabase
        .channel("chat_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          async (payload) => {
            const message = payload.new as ChatMessagePayload;

            if (message.sender_id === user.id) return;

            const currentPath = window.location.pathname;

            if (!currentPath.startsWith("/chats")) {
              setHasViewedChats(false);
              setUnreadCount((previousCount) => previousCount + 1);
              return;
            }

            if (currentPath === "/chats") {
              setHasViewedChats(true);
              return;
            }

            const threadIdInPath = getThreadIdFromPathname(currentPath);

            if (threadIdInPath !== message.thread_id) {
              setUnreadCount((previousCount) => previousCount + 1);
              setHasViewedChats(false);
              return;
            }

            await supabase
              .from("chat_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", message.id);
          }
        )
        .subscribe();
    }

    void setupSubscription();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [supabase]);

  function markThreadAsRead(threadId: string) {
    setThreadReadStatus((previousStatus) => ({
      ...previousStatus,
      [threadId]: true,
    }));
  }

  function isThreadRead(threadId: string) {
    return threadReadStatus[threadId] === true;
  }

  const shouldShowUnreadIndicator = !hasViewedChats && unreadCount > 0;

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        markThreadAsRead,
        isThreadRead,
        shouldShowUnreadIndicator,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);

  if (!context) {
    throw new Error(
      "useUnreadMessages must be used within an UnreadMessagesProvider"
    );
  }

  return context;
}
