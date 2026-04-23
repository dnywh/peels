"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthUserState = {
  user: User | null;
  profileFirstName: string | null;
  isLoading: boolean;
};

export function useAuthUser({
  includeProfile = false,
}: {
  includeProfile?: boolean;
} = {}): AuthUserState {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<AuthUserState>({
    user: null,
    profileFirstName: null,
    isLoading: true,
  });

  useEffect(() => {
    let isActive = true;

    async function loadUser(nextUser?: User | null) {
      const user =
        nextUser ?? (await supabase.auth.getUser()).data.user ?? null;

      if (!isActive) return;

      if (!user) {
        setState({
          user: null,
          profileFirstName: null,
          isLoading: false,
        });
        return;
      }

      if (!includeProfile) {
        setState({
          user,
          profileFirstName: null,
          isLoading: false,
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (!isActive) return;

      setState({
        user,
        profileFirstName: profile?.first_name ?? null,
        isLoading: false,
      });
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUser(session?.user ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [includeProfile, supabase]);

  return state;
}
