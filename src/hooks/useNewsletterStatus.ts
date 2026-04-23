"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type NewsletterStatus = {
  isAuthenticated: boolean;
  isNewsletterSubscribed: boolean;
  error: Error | null;
  isLoading: boolean;
};

const initialStatus: NewsletterStatus = {
  isAuthenticated: false,
  isNewsletterSubscribed: false,
  error: null,
  isLoading: true,
};

export function useNewsletterStatus() {
  const [status, setStatus] = useState<NewsletterStatus>(initialStatus);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isActive = true;

    async function checkNewsletterStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isActive) {
            setStatus({
              isAuthenticated: false,
              isNewsletterSubscribed: false,
              error: null,
              isLoading: false,
            });
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_newsletter_subscribed")
          .eq("id", user.id)
          .single();

        if (!isActive) return;

        if (profileError) {
          console.error("Profile error:", profileError);
          setStatus({
            isAuthenticated: true,
            isNewsletterSubscribed: false,
            error: profileError,
            isLoading: false,
          });
          return;
        }

        setStatus({
          isAuthenticated: true,
          isNewsletterSubscribed: profile?.is_newsletter_subscribed ?? false,
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Unexpected error in newsletter status hook:", error);

        if (!isActive) return;

        setStatus({
          isAuthenticated: false,
          isNewsletterSubscribed: false,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        });
      }
    }

    void checkNewsletterStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkNewsletterStatus();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return status;
}
