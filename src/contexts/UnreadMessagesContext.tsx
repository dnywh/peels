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
import { getChatThreadIdFromPathname } from "@/features/chat/chatRoutes";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

type ThreadReadStatus = Record<string, boolean>;

type ChatMessagePayload = {
  id: string;
  sender_id: string | null;
  thread_id: string | null;
};

type ChatThreadRow = {
  id: string;
};

type UnreadThreadRow = {
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

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function scheduleIdleTask(callback: () => void) {
  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleCallbackId = idleWindow.requestIdleCallback(callback, {
      timeout: 2_000,
    });

    return () => idleWindow.cancelIdleCallback?.(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 250);
  return () => globalThis.clearTimeout(timeoutId);
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

    const cancelInitialLoad = scheduleIdleTask(() => {
      void loadUserId();
    });

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
      cancelInitialLoad();
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

        const { data: threads, error: threadsError } = await supabase
          .from("chat_threads")
          .select("id")
          .or(`initiator_id.eq.${userId},owner_id.eq.${userId}`);

        if (threadsError) {
          console.error("Error checking chat threads:", threadsError);
          return;
        }

        const threadIds = ((threads as ChatThreadRow[] | null) ?? []).map(
          (thread) => thread.id
        );
        const { data: unreadThreads, error: unreadThreadsError } =
          threadIds.length > 0
            ? await supabase.rpc("unread_chat_thread_ids", {
                thread_ids: threadIds,
              })
            : { data: [], error: null };

        if (unreadThreadsError) {
          console.error("Error checking unread messages:", unreadThreadsError);
          return;
        }

        const unreadThreadIds = new Set(
          ((unreadThreads as UnreadThreadRow[] | null) ?? [])
            .map((thread) => thread.thread_id)
            .filter((threadId): threadId is string => Boolean(threadId))
        );

        if (!isActive) return;
        setUnreadCount(unreadThreadIds.size);
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
    if (pathname.startsWith("/chats")) {
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

            setHasViewedChats(true);

            if (currentPath === "/chats") {
              return;
            }

            const threadIdInPath = getChatThreadIdFromPathname(currentPath);

            if (threadIdInPath !== message.thread_id) {
              setUnreadCount((previousCount) => previousCount + 1);
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
