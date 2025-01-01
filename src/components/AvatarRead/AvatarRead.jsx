import { createClient } from "@/utils/supabase/server";

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

  const { data: user } = await supabase.auth.getUser();
  console.log(user);
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("avatar")
  //   .eq("id", user.id)
  //   .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select()
    .eq("owner_id", user.id);

  console.log(profile);

  return (
    <StyledImgContainer
      src={
        profile?.avatar
          ? `https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/avatars/${profile?.avatar}.png`
          : "https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/listing_avatars/blank1.png"
      }
      alt="Your avatar"
    />
  );
}
