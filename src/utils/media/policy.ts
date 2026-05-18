export type MediaUploadKind =
  | "profile_avatar"
  | "listing_avatar"
  | "listing_photo";

export type CanonicalMediaFormat = "jpeg" | "png";

export type MediaUploadConfig = {
  bucket: "avatars" | "listing_avatars" | "listing_photos";
  maxBytes: number;
  maxDimension: number;
  outputFormats: CanonicalMediaFormat[];
};

export type MediaInputFormat =
  | "avif"
  | "heic"
  | "heif"
  | "jpeg"
  | "png"
  | "webp";

export const MEDIA_UPLOAD_CONFIGS: Record<MediaUploadKind, MediaUploadConfig> =
  {
    profile_avatar: {
      bucket: "avatars",
      maxBytes: 10 * 1024 * 1024,
      maxDimension: 1024,
      outputFormats: ["jpeg", "png"],
    },
    listing_avatar: {
      bucket: "listing_avatars",
      maxBytes: 10 * 1024 * 1024,
      maxDimension: 1024,
      outputFormats: ["jpeg", "png"],
    },
    listing_photo: {
      bucket: "listing_photos",
      maxBytes: 25 * 1024 * 1024,
      maxDimension: 2048,
      outputFormats: ["jpeg"],
    },
  };

export const MAX_MEDIA_UPLOAD_REQUEST_BYTES =
  Math.max(
    ...Object.values(MEDIA_UPLOAD_CONFIGS).map((config) => config.maxBytes)
  ) +
  1024 * 1024;

export const MEDIA_INPUT_MIME_TYPES: Record<MediaInputFormat, string> = {
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const MEDIA_INPUT_EXTENSIONS: Record<string, MediaInputFormat> = {
  avif: "avif",
  heic: "heic",
  heif: "heif",
  jpeg: "jpeg",
  jpg: "jpeg",
  png: "png",
  webp: "webp",
};

const MIME_TYPE_INPUT_FORMATS = Object.fromEntries(
  Object.entries(MEDIA_INPUT_MIME_TYPES).map(([format, mimeType]) => [
    mimeType,
    format,
  ])
) as Record<string, MediaInputFormat>;

export function getMediaUploadConfig(kind: MediaUploadKind) {
  return MEDIA_UPLOAD_CONFIGS[kind];
}

export function isMediaUploadKind(value: unknown): value is MediaUploadKind {
  return (
    value === "profile_avatar" ||
    value === "listing_avatar" ||
    value === "listing_photo"
  );
}

export function getMediaInputFormat({
  fileName,
  mimeType,
}: {
  fileName?: string | null;
  mimeType?: string | null;
}): MediaInputFormat | null {
  const normalisedMimeType = mimeType?.trim().toLowerCase();

  if (normalisedMimeType && MIME_TYPE_INPUT_FORMATS[normalisedMimeType]) {
    return MIME_TYPE_INPUT_FORMATS[normalisedMimeType];
  }

  const extension = fileName?.split(".").pop()?.trim().toLowerCase();

  if (extension && MEDIA_INPUT_EXTENSIONS[extension]) {
    return MEDIA_INPUT_EXTENSIONS[extension];
  }

  return null;
}

export function isHeicLikeInput(format: MediaInputFormat | null) {
  return format === "heic" || format === "heif";
}

export function getCanonicalContentType(format: CanonicalMediaFormat) {
  return format === "png" ? "image/png" : "image/jpeg";
}

export function getCanonicalExtension(format: CanonicalMediaFormat) {
  return format === "png" ? "png" : "jpg";
}
