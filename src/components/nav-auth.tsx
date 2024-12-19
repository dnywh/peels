'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation';

// Routes where we want to show the auth UI
const AUTH_ROUTES = ['/', '/terms', '/privacy'];

export function NavAuth() {
  const pathname = usePathname();
  const supabase = createClient();
  const [session, setSession] = useState<null | { user: { id: string } }>(null);
  const [profile, setProfile] = useState<{ first_name?: string } | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProfile(null); // Clear profile when auth state changes
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when session changes
  useEffect(() => {
    async function getProfile() {
      if (!session?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
    }

    getProfile();
  }, [session]);

  // Don't render anything on non-auth routes
  if (!AUTH_ROUTES.includes(pathname)) {
    return null;
  }

  if (!session) {
    return (
      <Button variant="ghost" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" asChild>
      <Link href="/profile">
        {profile?.first_name || 'Profile'}
      </Link>
    </Button>
  );
} 