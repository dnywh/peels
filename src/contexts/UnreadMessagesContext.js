'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const UnreadMessagesContext = createContext();

export function UnreadMessagesProvider({ children, initialUnreadCount = 0 }) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [threadReadStatus, setThreadReadStatus] = useState({});
    const supabase = createClient();

    useEffect(() => {
        // Get current user
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            return user;
        };

        const setupSubscription = async () => {
            const user = await getCurrentUser();
            if (!user) return;

            const channel = supabase
                .channel('chat_messages')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'chat_messages',
                    },
                    async (payload) => {
                        console.log("payload", payload);
                        // Only increment if message is not from current user
                        if (payload.new.sender_id !== user.id) {
                            // Check if user is currently viewing this thread
                            const currentPath = window.location.pathname;
                            const threadIdInPath = currentPath.match(/\/chats\/([^\/]+)/)?.[1];

                            // Only increment if user is not viewing the thread
                            if (threadIdInPath !== payload.new.thread_id) {
                                setUnreadCount(prev => prev + 1);
                            } else {
                                // If viewing the thread, mark as read immediately
                                await supabase
                                    .from('chat_messages')
                                    .update({ read_at: new Date().toISOString() })
                                    .eq('id', payload.new.id);
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
            cleanup.then(cleanupFn => cleanupFn?.());
        };
    }, [supabase]);

    const markThreadAsRead = (threadId) => {
        setThreadReadStatus(prev => ({
            ...prev,
            [threadId]: true
        }));
    };

    const isThreadRead = (threadId) => {
        return threadReadStatus[threadId] === true;
    };

    return (
        <UnreadMessagesContext.Provider value={{
            unreadCount,
            setUnreadCount,
            markThreadAsRead,
            isThreadRead
        }}>
            {children}
        </UnreadMessagesContext.Provider>
    );
}

export function useUnreadMessages() {
    const context = useContext(UnreadMessagesContext);
    if (!context) {
        throw new Error('useUnreadMessages must be used within an UnreadMessagesProvider');
    }
    return context;
} 
