"use client";

import { useState } from "react";
import AvatarUploader from "@/components/AvatarUploader";
import { uploadAvatar, deleteAvatar, getAvatarUrl } from "@/utils/avatarUtils"; // Import the utility functions

function AvatarUploadClient({ initialAvatar, onAvatarChange, bucket }) {
  const [avatar, setAvatar] = useState(initialAvatar || "");

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // If there's an existing avatar, delete it first
        if (avatar) {
          const existingFilePath = avatar.split("/").pop();
          await deleteAvatar(existingFilePath, bucket); // Specify the bucket
        }
        const avatarUrl = await uploadAvatar(file, bucket); // Specify the bucket
        setAvatar(avatarUrl);
        onAvatarChange(avatarUrl); // Notify parent component
      } catch (error) {
        console.error("Error handling avatar:", error);
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (avatar) {
      try {
        const filePath = avatar.split("/").pop();
        await deleteAvatar(filePath, bucket); // Specify the bucket
        setAvatar("");
        onAvatarChange(""); // Notify parent component
      } catch (error) {
        console.error("Error deleting avatar:", error);
      }
    }
  };

  return (
    <AvatarUploader
      avatar={avatar}
      onChange={handleAvatarChange}
      onDelete={handleAvatarDelete}
      getAvatarUrl={(filename) => getAvatarUrl(filename, bucket)} // Specify the bucket
    />
  );
}

export default AvatarUploadClient;
