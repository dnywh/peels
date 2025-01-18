import AvatarUploadManager from "@/components/AvatarUploadManager";

export default async function ProfileHeader({ profile, user }) {
  return (
    <>
      <AvatarUploadManager
        initialAvatar={profile?.avatar || ""}
        bucket="avatars"
        entityId={user.id}
      />
      {profile?.first_name && <h1>{profile?.first_name}</h1>}
    </>
  );
}
