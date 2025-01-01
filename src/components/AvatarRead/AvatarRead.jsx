import { createClient } from "@/utils/supabase/server";

import { getAvatarUrl } from "@/utils/avatarUtils";

import { styled } from "@pigment-css/react";

const StyledImgContainer = styled("img")({
  position: "relative",
  borderRadius: "50%",
  border: "4px solid #e5e7eb",
  width: "100px",
  height: "100px",
  overflow: "hidden",
  objectFit: "cover",
});

// const StyledImg = styled("img")({
// objectFit: "cover",
// });

export default async function AvatarRead() {
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
    <StyledImgContainer
      src={
        profile?.avatar
          ? getAvatarUrl(profile?.avatar, "avatars")
          : getAvatarUrl("blank1.png", "listing_avatars")
      }
      alt="Your avatar"
    />
  );
}
