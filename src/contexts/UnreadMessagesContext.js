"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const UnreadMessagesContext = createContext();

export function UnreadMessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [threadReadStatus, setThreadReadStatus] = useState({});
  const [hasViewedChats, setHasViewedChats] = useState(false);
  const supabase = createClient();

  // Check for unread messages on mount
  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Query for all unread messages where the user is the recipient
        const { data: unreadMessages, error } = await supabase
          .from("chat_messages")
          .select("id")
          .neq("sender_id", user.id)
          .is("read_at", null);

        if (error) {
          console.error("Error checking unread messages:", error);
          return;
        }

        const count = unreadMessages?.length || 0;
        setUnreadCount(count);
      } catch (error) {
        console.error("Error in checkUnreadMessages:", error);
      }
    };

    checkUnreadMessages();
  }, [supabase]);

  // Track when user visits the chats page
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === "/chats") {
        setHasViewedChats(true);
      }
    };

    // Check initial route
    handleRouteChange();

    // Listen for pathname changes
    const observer = new MutationObserver(() => {
      handleRouteChange();
    });

    observer.observe(document.querySelector("body"), {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Simplified auth listener for debugging
  useEffect(() => {
    console.log("🔐 Setting up auth listener");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth event:", event);
      console.log("🔐 Session:", session ? "exists" : "none");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("chat_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          async (payload) => {
            if (payload.new.sender_id !== user.id) {
              const currentPath = window.location.pathname;

              if (!currentPath.startsWith("/chats")) {
                setHasViewedChats(false);
                setUnreadCount((prev) => prev + 1);
              } else if (currentPath === "/chats") {
                setHasViewedChats(true);
              } else {
                const threadIdInPath =
                  currentPath.match(/\/chats\/([^\/]+)/)?.[1];
                if (threadIdInPath !== payload.new.thread_id) {
                  setUnreadCount((prev) => prev + 1);
                  setHasViewedChats(false);
                } else {
                  await supabase
                    .from("chat_messages")
                    .update({ read_at: new Date().toISOString() })
                    .eq("id", payload.new.id);
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, [supabase]);

  const markThreadAsRead = (threadId) => {
    setThreadReadStatus((prev) => ({
      ...prev,
      [threadId]: true,
    }));
  };

  const isThreadRead = (threadId) => {
    return threadReadStatus[threadId] === true;
  };

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
