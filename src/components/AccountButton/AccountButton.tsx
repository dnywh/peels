"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/Button";
import type { User } from "@supabase/supabase-js";
import type { LinkButtonProps } from "@/components/Button";

type AccountButtonProps = Omit<
  LinkButtonProps,
  "href" | "variant" | "children"
>;

export default function AccountButton({ ...props }: AccountButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string } | null>(null);
  const t = useTranslations("Actions");
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }

    loadUser();

    // Optional: Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return user ? (
    <Button href="/profile" variant="secondary" {...props}>
      {profile?.first_name}
    </Button>
  ) : (
    <Button href="/sign-in" variant="secondary" {...props}>
      {t("signIn")}
    </Button>
  );
}
