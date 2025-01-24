import AvatarUploadManager from "@/components/AvatarUploadManager";
import { styled } from "@pigment-css/react";

const Heading1 = styled("h1")({
  fontSize: "2.25rem",
  fontWeight: "bold",
  textAlign: "center",
  textWrap: "balance",
});

const Heading2 = styled("h2")({
  fontSize: "0.875rem",
  fontWeight: "bold",
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
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
      {profile?.is_admin && <Heading2>Admin</Heading2>}
    </>
  );
}
