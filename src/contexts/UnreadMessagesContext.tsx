"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

type ThreadReadStatus = Record<string, boolean>;

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
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();

  useEffect(() => {
    let isActive = true;

    async function loadUserId(nextUserId?: string | null) {
      const resolvedUserId =
        nextUserId ?? (await supabase.auth.getUser()).data.user?.id ?? null;

      if (!isActive) return;

      setUserId((previousUserId) => {
        if (previousUserId !== resolvedUserId) {
          setUnreadCount(0);
          setThreadReadStatus({});
          setHasViewedChats(false);
        }

        return resolvedUserId;
      });
    }

    void loadUserId();

    if (isAuthDebugEnabled) {
      console.log("Setting up auth listener");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isAuthDebugEnabled) {
        console.log("Auth event:", event);
        console.log("Session:", session ? "exists" : "none");
      }

      void loadUserId(session?.user?.id ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let isActive = true;

    async function checkUnreadMessages() {
      try {
        if (!userId) {
          if (isActive) {
            setUnreadCount(0);
          }
          return;
        }

        const { count, error } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .neq("sender_id", userId)
          .is("read_at", null);

        if (error) {
          console.error("Error checking unread messages:", error);
          return;
        }

        if (!isActive) return;
        setUnreadCount(count ?? 0);
      } catch (error) {
        console.error("Error in checkUnreadMessages:", error);
      }
    }

    void checkUnreadMessages();

    return () => {
      isActive = false;
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (pathname === "/chats") {
      setHasViewedChats(true);
    }
  }, [pathname]);

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    async function setupSubscription() {
      if (!userId) return;

      activeChannel = supabase
        .channel(`chat_messages:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          async (payload) => {
            const message = payload.new as ChatMessagePayload;

            if (message.sender_id === userId) return;

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
  }, [supabase, userId]);

  const markThreadAsRead = useCallback((threadId: string) => {
    setThreadReadStatus((previousStatus) => {
      if (previousStatus[threadId] === true) {
        return previousStatus;
      }

      return {
        ...previousStatus,
        [threadId]: true,
      };
    });
  }, []);

  const isThreadRead = useCallback(
    (threadId: string) => {
      return threadReadStatus[threadId] === true;
    },
    [threadReadStatus]
  );

  const shouldShowUnreadIndicator = !hasViewedChats && unreadCount > 0;
  const contextValue = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      markThreadAsRead,
      isThreadRead,
      shouldShowUnreadIndicator,
    }),
    [unreadCount, markThreadAsRead, isThreadRead, shouldShowUnreadIndicator]
  );

  return (
    <UnreadMessagesContext.Provider value={contextValue}>
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
