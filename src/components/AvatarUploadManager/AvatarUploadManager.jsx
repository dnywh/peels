"use client";

import { useState } from "react";
import AvatarUploadView from "@/components/AvatarUploadView";
import { uploadAvatar, deleteAvatar, getAvatarUrl } from "@/utils/avatarUtils"; // Import the utility functions

function AvatarUploadManager({
  initialAvatar,
  onAvatarChange,
  bucket,
  entityId,
}) {
  const [avatar, setAvatar] = useState(initialAvatar || "");

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // If there's an existing avatar, delete it first
        if (avatar) {
          const existingFilePath = avatar.split("/").pop();
          await deleteAvatar(existingFilePath, bucket, entityId);
        }
        const avatarUrl = await uploadAvatar(file, bucket, entityId);
        setAvatar(avatarUrl);
        onAvatarChange(avatarUrl);
      } catch (error) {
        console.error("Error handling avatar:", error);
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (avatar) {
      try {
        const filePath = avatar.split("/").pop();
        await deleteAvatar(filePath, bucket, entityId);
        setAvatar("");
        onAvatarChange(""); // Notify parent component
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
      getAvatarUrl={(filename) => getAvatarUrl(filename, bucket)} // Specify the bucket
    />
  );
}

export default AvatarUploadManager;
