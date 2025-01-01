"use client";

import { useState } from "react";
import AvatarUploadManager from "@/components/AvatarUploadManager";

function AvatarUploadWrapper({
  initialAvatar,
  onAvatarChange,
  bucket,
  entityId,
}) {
  const [avatar, setAvatar] = useState(initialAvatar || "");

  const handleAvatarChange = (nextAvatar) => {
    setAvatar(nextAvatar);
    // onAvatarChange(nextAvatar); // Notify parent component
  };

  return (
    <AvatarUploadManager
      initialAvatar={avatar}
      onAvatarChange={handleAvatarChange}
      bucket={bucket}
      entityId={entityId}
    />
  );
}

export default AvatarUploadWrapper;
