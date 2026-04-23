import { createClient } from "@/utils/supabase/client";
import { getStoragePublicUrl } from "@/utils/storage";

type AvatarBucket = string;

type ListingPhotoRecord = {
  photos: string[] | null;
};

export async function uploadAvatar(
  file: File,
  bucket: AvatarBucket,
  id: string
) {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  await supabase.storage
    .from(bucket)
    .remove([fileName])
    .catch(() => {});

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) throw error;
  console.log("Avatar uploaded:", data);

  if (bucket === "avatars") {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar: fileName })
      .eq("id", id);

    if (updateError) throw updateError;
  } else {
    const { error: updateError } = await supabase
      .from("listings")
      .update({ avatar: fileName })
      .eq("slug", id);

    if (updateError) throw updateError;
  }

  return fileName;
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
  } else {
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
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("listing_photos")
    .upload(fileName, file);

  if (error) throw error;
  console.log("Photo uploaded:", data);

  if (listingSlug) {
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("photos")
      .eq("slug", listingSlug)
      .single();

    if (fetchError) throw fetchError;

    const photos = (listing as ListingPhotoRecord | null)?.photos ?? [];
    const { error: updateError } = await supabase
      .from("listings")
      .update({ photos: [...photos, fileName] })
      .eq("slug", listingSlug);

    if (updateError) throw updateError;
  }

  return fileName;
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
      const { data: listing } = await supabase
        .from("listings")
        .select("photos")
        .eq("slug", listingSlug)
        .single();

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
