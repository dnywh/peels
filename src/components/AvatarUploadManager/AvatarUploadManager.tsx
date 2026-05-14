"use client";

import { useState } from "react";
import AvatarUploadView from "@/components/AvatarUploadView";
import { uploadAvatar, deleteAvatar, getAvatarUrl } from "@/utils/mediaUtils";
import { normaliseImageFileForUpload } from "@/utils/media/client";
import { useTranslations } from "next-intl";
import type { AvatarBucket } from "@/utils/mediaUtils";

const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes

type AvatarUploadManagerProps = {
  initialAvatar?: string;
  bucket: AvatarBucket;
  entityId: string;
  onAvatarChange?: (filename: string) => void;
  inputHintShown?: boolean;
  listingType?: string;
};

function AvatarUploadManager({
  initialAvatar,
  bucket,
  entityId,
  onAvatarChange,
  inputHintShown,
  listingType,
}: AvatarUploadManagerProps) {
  const t = useTranslations();
  const [avatar, setAvatar] = useState(initialAvatar || "");
  const overSizedFileAlertSingular = t("Listings.photos.tooLargeOne", {
    max: MAX_MB,
  });

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check total file size
      if (file.size > MAX_FILE_SIZE) {
        alert(overSizedFileAlertSingular);
        return;
      }

      try {
        const processedFile = await normaliseImageFileForUpload(file);
        const filename = await uploadAvatar(
          processedFile,
          bucket,
          entityId,
          avatar
        );
        setAvatar(filename);
        onAvatarChange?.(filename);
      } catch (error: any) {
        // console.error("Error handling avatar:", error);
        if (error?.statusCode === "413" || error?.error?.statusCode === "413") {
          alert(overSizedFileAlertSingular);
        } else {
          alert(t("Errors.avatarUploadFailed"));
        }
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (avatar) {
      try {
        await deleteAvatar(avatar, bucket, entityId);
        setAvatar("");
        onAvatarChange?.("");
      } catch (error) {
        console.error("Error deleting avatar:", error);
      }
    }
  };

  return (
    <AvatarUploadView
      avatar={avatar}
      onChange={handleAvatarChange}
      onDelete={handleAvatarDelete}
      getAvatarUrl={(filename) => getAvatarUrl(filename, bucket)}
      bucket={bucket}
      inputHintShown={inputHintShown}
      listingType={listingType}
    />
  );
}

export default AvatarUploadManager;
