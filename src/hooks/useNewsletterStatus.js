"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useNewsletterStatus() {
  const [status, setStatus] = useState({
    isAuthenticated: false,
    isNewsletterSubscribed: false,
    error: null,
    isLoading: true,
  });
  const supabase = createClient();

  useEffect(() => {
    async function checkNewsletterStatus() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus({
            isAuthenticated: false,
            isNewsletterSubscribed: false,
            error: null,
            isLoading: false,
          });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .single();

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
          isNewsletterSubscribed: profile?.is_newsletter_subscribed || false,
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Unexpected error in NewsletterCallout:", error);
        setStatus({
          isAuthenticated: false,
          isNewsletterSubscribed: false,
          error,
          isLoading: false,
        });
      }
    }
    checkNewsletterStatus();

    // Optional: Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkNewsletterStatus();
    });

    return () => subscription?.unsubscribe();
  }, []);

  return status;
}
