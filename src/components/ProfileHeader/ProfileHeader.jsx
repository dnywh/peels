import { createClient } from "@/utils/supabase/server";
import AvatarRead from "@/components/AvatarRead";

export default async function ProfileHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // You might want to fetch additional user data from your profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <AvatarRead />
      {profile?.first_name && <h1>{profile?.first_name}</h1>}
    </>
  );
}
