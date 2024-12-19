'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export function HomeActions() {
  const supabase = createClient();
  const [session, setSession] = useState<null | { user: { id: string } }>(null);

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
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-4">
      <Button asChild size="lg" variant="default">
        <Link href="/map">Browse the map</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        {session ? (
          <Link href="/profile#TODO-listing-form-for-signed-in-users">
            Create a listing
          </Link>
        ) : (
          <Link href="/sign-up">Sign up</Link>
        )}
      </Button>
      {!session && (
        <Link href="/profile#TODO-listing-paramters-for-guest-users-to-eventually-come-back-to-via-a-callback-url">
          Create a map listing
        </Link>
      )}
    </div>
  );
} 