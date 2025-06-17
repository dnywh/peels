"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/Button";

export default function AccountButton({ children, ...props }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
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
