import AvatarUploadManager from "@/components/AvatarUploadManager";
import { styled } from "next-yak";
import { getTranslations } from "next-intl/server";

const Heading1 = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  text-align: center;
  text-wrap: balance;
`;

const Heading2 = styled.h2`
  font-size: 0.875rem;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export default async function ProfileHeader({
  profile,
  user,
}: {
  profile?: {
    avatar?: string | null;
    first_name?: string | null;
    is_admin?: boolean | null;
  } | null;
  user: { id: string };
}) {
  const t = await getTranslations("Common");

  return (
    <>
      <AvatarUploadManager
        initialAvatar={profile?.avatar || ""}
        bucket="avatars"
        entityId={user.id}
      />
      {profile?.first_name && (
        <Heading1 data-testid="profile-first-name">
          {profile?.first_name}
        </Heading1>
      )}
      {profile?.is_admin && <Heading2>{t("admin")}</Heading2>}
    </>
  );
}
