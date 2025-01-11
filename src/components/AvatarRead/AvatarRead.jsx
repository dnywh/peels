import Avatar from "@/components/Avatar";
import { createClient } from "@/utils/supabase/server";

export default async function AvatarRead({ ...props }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  return (
    <Avatar
      bucket="avatars"
      filename={profile?.avatar}
      alt="Avatar"
      size={100}
      {...props}
    />
  );
}
