import { getStoragePublicUrl } from "@/utils/storage";

export type AvatarBucket = "avatars" | "listing_avatars";

type MediaUploadResponse = {
  filename?: string;
  error?: string;
};

type MediaUploadError = Error & {
  statusCode?: string;
};

async function uploadMedia({
  entityId,
  file,
  kind,
  previousPath,
}: {
  entityId?: string | null;
  file: File;
  kind: "profile_avatar" | "listing_avatar" | "listing_photo";
  previousPath?: string | null;
}) {
  const formData = new FormData();
  formData.append("kind", kind);
  formData.append("file", file);

  if (entityId) {
    formData.append("entityId", entityId);
  }

  if (previousPath) {
    formData.append("previousPath", previousPath);
  }

  const response = await fetch("/api/media/upload", {
    body: formData,
    method: "POST",
  });
  const data = (await response.json().catch(() => ({}))) as MediaUploadResponse;

  if (!response.ok || !data.filename) {
    const error = new Error(
      data.error || "Media upload failed"
    ) as MediaUploadError;
    error.statusCode = String(response.status);
    throw error;
  }

  return data.filename;
}

async function deleteMedia({
  entityId,
  kind,
  path,
}: {
  entityId?: string | null;
  kind: "profile_avatar" | "listing_avatar" | "listing_photo";
  path: string;
}) {
  const response = await fetch("/api/media/upload", {
    body: JSON.stringify({
      entityId,
      kind,
      path,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
  const data = (await response.json().catch(() => ({}))) as MediaUploadResponse;

  if (!response.ok) {
    const error = new Error(
      data.error || "Media deletion failed"
    ) as MediaUploadError;
    error.statusCode = String(response.status);
    throw error;
  }
}

export async function uploadAvatar(
  file: File,
  bucket: AvatarBucket,
  id: string,
  previousPath?: string
) {
  return uploadMedia({
    entityId: id,
    file,
    kind: bucket === "avatars" ? "profile_avatar" : "listing_avatar",
    previousPath,
  });
}

export async function deleteAvatar(
  filePath: string,
  bucket: AvatarBucket,
  id: string
) {
  return deleteMedia({
    entityId: id,
    kind: bucket === "avatars" ? "profile_avatar" : "listing_avatar",
    path: filePath,
  });
}

export function getListingPhotoUrl(filename: string, bucket: string) {
  return getStoragePublicUrl(bucket, filename) ?? "";
}

export function getAvatarUrl(filename: string, bucket: string) {
  return getStoragePublicUrl(bucket, filename) ?? "";
}

export async function uploadListingPhoto(
  file: File,
  listingSlug: string | null = null
) {
  return uploadMedia({
    entityId: listingSlug,
    file,
    kind: "listing_photo",
  });
}

export async function deleteListingPhoto(
  filePath: string,
  listingSlug: string | null = null
) {
  try {
    await deleteMedia({
      entityId: listingSlug,
      kind: "listing_photo",
      path: filePath,
    });
    return null;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
}
