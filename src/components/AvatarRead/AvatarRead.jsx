import Image from "next/image";
import defaultAvatar from "../public/default-avatar.png";

import { createClient } from "@/utils/supabase/server";

import { getAvatarUrl } from "@/utils/avatarUtils";

import { styled } from "@pigment-css/react";

const StyledImgContainer = styled(Image)({
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

  return <StyledImgContainer src={defaultAvatar} alt="Your avatar" />;
}
