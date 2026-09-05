"use client";

import { useState } from "react";
import AvatarUploadView from "@/components/AvatarUploadView";
import {
  uploadAvatar,
  deleteAvatar,
  getAvatarUrl,
  type MediaUploadError,
} from "@/utils/mediaUtils";
import { normaliseImageFileForUpload } from "@/utils/media/client";
import { useTranslations } from "next-intl";
import type { AvatarBucket } from "@/utils/mediaUtils";
import FormMessage from "@/components/FormMessage";
import SupportErrorMessage from "@/components/SupportErrorMessage";

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
  const [feedback, setFeedback] = useState<{
    message: string;
    supportReference?: string;
  } | null>(null);
  const overSizedFileAlertSingular = t("Listings.photos.tooLargeOne", {
    max: MAX_MB,
  });

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeedback(null);
      // Check total file size
      if (file.size > MAX_FILE_SIZE) {
        setFeedback({ message: overSizedFileAlertSingular });
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
      } catch (error) {
        const mediaError = error as MediaUploadError;
        if (mediaError.statusCode === "413") {
          setFeedback({ message: overSizedFileAlertSingular });
        } else {
          setFeedback({
            message: t("Errors.avatarUploadFailed"),
            supportReference: mediaError.supportReference,
          });
        }
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (avatar) {
      setFeedback(null);
      try {
        await deleteAvatar(avatar, bucket, entityId);
        setAvatar("");
        onAvatarChange?.("");
      } catch (error) {
        const mediaError = error as MediaUploadError;
        setFeedback({
          message: t("Errors.failedDeletePhoto"),
          supportReference: mediaError.supportReference,
        });
      }
    }
  };

  return (
    <>
      {feedback && (
        <FormMessage
          message={{
            error: feedback.supportReference ? (
              <SupportErrorMessage
                message={feedback.message}
                pageUrl={
                  typeof window === "undefined" ? "" : window.location.href
                }
                scope="media"
                supportReference={feedback.supportReference}
              />
            ) : (
              feedback.message
            ),
          }}
        />
      )}
      <AvatarUploadView
        avatar={avatar}
        onChange={handleAvatarChange}
        onDelete={handleAvatarDelete}
        getAvatarUrl={(filename) => getAvatarUrl(filename, bucket)}
        bucket={bucket}
        inputHintShown={inputHintShown}
        listingType={listingType}
      />
    </>
  );
}

export default AvatarUploadManager;
