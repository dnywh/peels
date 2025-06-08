import { createClient } from "@/utils/supabase/server";

export async function useNewsletterStatus() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                isNewsletterSubscribed: false,
                isAuthenticated: false,
                error: null
            };
        }

        if (userError) {
            console.error("Auth error:", userError);
            return {
                isNewsletterSubscribed: false,
                isAuthenticated: false,
                error: userError
            };
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select()
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Profile error:", profileError);
            return {
                isNewsletterSubscribed: false,
                isAuthenticated: true,
                error: profileError
            };
        }

        return {
            isNewsletterSubscribed: profile?.is_newsletter_subscribed || false,
            isAuthenticated: true,
            error: null
        };
    } catch (error) {
        console.error("Unexpected error in useNewsletterStatus:", error);
        return {
            isNewsletterSubscribed: false,
            isAuthenticated: false,
            error
        };
    }
}
