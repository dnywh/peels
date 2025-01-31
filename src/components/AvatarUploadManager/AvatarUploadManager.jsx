"use client";

import { useState } from "react";
import AvatarUploadView from "@/components/AvatarUploadView";
import { uploadAvatar, deleteAvatar, getAvatarUrl } from "@/utils/mediaUtils";
import Compressor from "compressorjs";

const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes
const MAX_DIMENSION = 1024; // Consider going down to 512 for avatars
const overSizedFileAlertSingular = `Your photo is too large. The maximum file size is ${MAX_MB}MB.`;

function AvatarUploadManager({
  initialAvatar,
  bucket,
  entityId,
  onAvatarChange,
  inputHintShown,
  listingType,
  ...props
}) {
  const [avatar, setAvatar] = useState(initialAvatar || "");

  const processAvatar = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: MAX_DIMENSION,
        maxHeight: MAX_DIMENSION,
        convertSize: 500000, // Convert PNGs to JPEGs if over ~500KB
        // Force square crop from center
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        resize: "cover", // This ensures the image fills the square
        success: (result) => {
          console.log("Avatar compression results:", {
            original: Math.round(file.size / 1024) + "KB",
            compressed: Math.round(result.size / 1024) + "KB",
          });
          resolve(result);
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check total file size
      if (file.size > MAX_FILE_SIZE) {
        alert(overSizedFileAlertSingular);
        return;
      }

      try {
        const processedFile = await processAvatar(file);

        if (avatar) {
          await deleteAvatar(avatar, bucket, entityId);
        }
        const filename = await uploadAvatar(processedFile, bucket, entityId);
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
      listingType={listingType}
    />
  );
}

export default AvatarUploadManager;
