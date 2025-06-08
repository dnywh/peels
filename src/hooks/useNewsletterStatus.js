import { createClient } from "@/utils/supabase/server";

export async function useNewsletterStatus() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
        return {
            isNewsletterSubscribed: false,
            isAuthenticated: false,
            error: userError,
        };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

    return {
        isNewsletterSubscribed: profile?.is_newsletter_subscribed || false,
        isAuthenticated: true,
        error: profileError,
    };
}
