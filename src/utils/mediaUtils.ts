import { createClient } from "@/utils/supabase/client";
import { getStoragePublicUrl } from "@/utils/storage";

export type AvatarBucket = "avatars" | "listing_avatars";

type ListingPhotoRecord = {
  photos: string[] | null;
};

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
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) throw error;

  if (bucket === "avatars") {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar: null })
      .eq("id", id);

    if (updateError) throw updateError;
  }

  if (bucket === "listing_avatars" && id) {
    const { error: updateError } = await supabase
      .from("listings")
      .update({ avatar: null })
      .eq("slug", id);

    if (updateError) throw updateError;
  }
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
  const supabase = createClient();

  try {
    const { error: storageError } = await supabase.storage
      .from("listing_photos")
      .remove([filePath]);

    if (storageError) throw storageError;

    if (listingSlug) {
      const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("photos")
        .eq("slug", listingSlug)
        .single();

      if (fetchError) throw fetchError;

      const updatedPhotos = (
        (listing as ListingPhotoRecord | null)?.photos ?? []
      ).filter((photo) => photo !== filePath);

      const { error: updateError } = await supabase
        .from("listings")
        .update({ photos: updatedPhotos })
        .eq("slug", listingSlug);

      if (updateError) throw updateError;

      console.log("Photo deleted and database updated:", filePath);
      return updatedPhotos;
    }

    console.log("Photo deleted from storage:", filePath);
    return null;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
}
