import AvatarUploadManager from "@/components/AvatarUploadManager";
import { styled } from "@pigment-css/react";

const Heading1 = styled("h1")({
  fontSize: "2.25rem",
  fontWeight: "bold",
  textAlign: "center",
  textWrap: "balance",
});

export default async function ProfileHeader({ profile, user }) {
  return (
    <>
      <AvatarUploadManager
        initialAvatar={profile?.avatar || ""}
        bucket="avatars"
        entityId={user.id}
      />
      {profile?.first_name && <Heading1>{profile?.first_name}</Heading1>}
    </>
  );
}
