import GuestActions from "@/components/GuestActions";
import { createClient } from "@/utils/supabase/server";
import ListingsPageClient from "@/components/ListingsPageClient";

export default async function ChatsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <GuestActions />;
    }

    const { data: listings } = await supabase
        .from("listings")
        .select(
            `
          *,
          profiles (
            first_name,
            avatar
          )
        `
        )


    return <ListingsPageClient user={user} initialListings={listings} />;
}
