"use client";

import { useState } from "react";
import AvatarUploadView from "@/components/AvatarUploadView";
import { uploadAvatar, deleteAvatar, getAvatarUrl } from "@/utils/mediaUtils";

const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes
const overSizedFileAlertSingular = `Your photo is too large. The maximum file size is ${MAX_MB}MB.`;

function AvatarUploadManager({
  initialAvatar,
  bucket,
  entityId,
  onAvatarChange,
  inputHintShown,
  ...props
}) {
  const [avatar, setAvatar] = useState(initialAvatar || "");

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check total file size
      if (file.size > MAX_FILE_SIZE) {
        alert(overSizedFileAlertSingular);
        return;
      }

      try {
        if (avatar) {
          await deleteAvatar(avatar, bucket, entityId);
        }
        const filename = await uploadAvatar(file, bucket, entityId);
        setAvatar(filename);
        onAvatarChange?.(filename);
      } catch (error) {
        // console.error("Error handling avatar:", error);
        if (error?.statusCode === "413" || error?.error?.statusCode === "413") {
          alert(overSizedFileAlertSingular);
        } else {
          alert("There was an error uploading your photo. Please try again.");
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
    />
  );
}

export default AvatarUploadManager;
