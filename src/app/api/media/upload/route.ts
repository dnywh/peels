import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { processMedia } from "@/utils/media/processor";
import {
  getMediaInputFormat,
  getMediaUploadConfig,
  isHeicLikeInput,
  isMediaUploadKind,
} from "@/utils/media/policy";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type ListingPhotoRecord = {
  id: number;
  photos: string[] | null;
};

type ListingAvatarRecord = {
  id: number;
  avatar: string | null;
};

type ProfileAvatarRecord = {
  avatar: string | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getStringField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

async function removeStorageObject({
  bucket,
  path,
  supabase,
}: {
  bucket: string;
  path: string | null | undefined;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  if (!path) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error(`Failed to remove ${bucket}/${path}:`, error);
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Unauthorised", 401);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", 400);
  }

  const kind = getStringField(formData, "kind");

  if (!isMediaUploadKind(kind)) {
    return jsonError("Invalid media kind", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Missing media file", 400);
  }

  const inputFormat = getMediaInputFormat({
    fileName: file.name,
    mimeType: file.type,
  });

  if (!inputFormat) {
    return jsonError("Unsupported image type", 400);
  }

  if (isHeicLikeInput(inputFormat)) {
    console.warn(
      "Received HEIC/HEIF directly; browser conversion should normally run before upload."
    );
  }

  const entityId = getStringField(formData, "entityId");
  const previousPath = getStringField(formData, "previousPath");
  const config = getMediaUploadConfig(kind);
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processedMedia;

  try {
    processedMedia = await processMedia({
      buffer: inputBuffer,
      inputFormat,
      kind,
    });
  } catch (error) {
    console.error("Media processing failed:", error);
    return jsonError("Image could not be processed", 422);
  }

  const fileName = `${randomUUID()}.${processedMedia.extension}`;
  let uploaded = false;

  const { error: uploadError } = await supabase.storage
    .from(config.bucket)
    .upload(fileName, processedMedia.buffer, {
      cacheControl: "31536000",
      contentType: processedMedia.contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error("Media upload failed:", uploadError);
    return jsonError("Image could not be uploaded", 500);
  }

  uploaded = true;

  try {
    if (kind === "profile_avatar") {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("avatar")
        .eq("id", user.id)
        .maybeSingle<ProfileAvatarRecord>();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar: fileName })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await removeStorageObject({
        bucket: config.bucket,
        path: previousPath || profile?.avatar,
        supabase,
      });
    }

    if (kind === "listing_avatar") {
      if (entityId) {
        const { data: listing, error: fetchError } = await supabase
          .from("listings")
          .select("id, avatar")
          .eq("slug", entityId)
          .maybeSingle<ListingAvatarRecord>();

        if (fetchError) throw fetchError;

        if (!listing) {
          await removeStorageObject({
            bucket: config.bucket,
            path: fileName,
            supabase,
          });
          return jsonError("Listing not found", 404);
        }

        const { error: updateError } = await supabase
          .from("listings")
          .update({ avatar: fileName })
          .eq("id", listing.id);

        if (updateError) throw updateError;

        await removeStorageObject({
          bucket: config.bucket,
          path: previousPath || listing.avatar,
          supabase,
        });
      } else if (previousPath) {
        await removeStorageObject({
          bucket: config.bucket,
          path: previousPath,
          supabase,
        });
      }
    }

    if (kind === "listing_photo" && entityId) {
      const { data: listing, error: fetchError } = await supabase
        .from("listings")
        .select("id, photos")
        .eq("slug", entityId)
        .maybeSingle<ListingPhotoRecord>();

      if (fetchError) throw fetchError;

      if (!listing) {
        await removeStorageObject({
          bucket: config.bucket,
          path: fileName,
          supabase,
        });
        return jsonError("Listing not found", 404);
      }

      const photos = listing.photos ?? [];
      const { error: updateError } = await supabase
        .from("listings")
        .update({ photos: [...photos, fileName] })
        .eq("id", listing.id);

      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Media record update failed:", error);

    if (uploaded) {
      await removeStorageObject({
        bucket: config.bucket,
        path: fileName,
        supabase,
      });
    }

    return jsonError("Image record could not be updated", 500);
  }

  return NextResponse.json({
    bucket: config.bucket,
    contentType: processedMedia.contentType,
    filename: fileName,
    format: processedMedia.format,
  });
}
