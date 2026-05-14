import sharp from "sharp";
import {
  type CanonicalMediaFormat,
  type MediaInputFormat,
  type MediaUploadKind,
  getCanonicalContentType,
  getCanonicalExtension,
  getMediaUploadConfig,
} from "@/utils/media/policy";

export type ProcessedMedia = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  format: CanonicalMediaFormat;
};

type ProcessMediaOptions = {
  buffer: Buffer;
  inputFormat: MediaInputFormat;
  kind: MediaUploadKind;
};

function shouldPreserveAvatarPng({
  hasAlpha,
  inputFormat,
  kind,
}: {
  hasAlpha: boolean;
  inputFormat: MediaInputFormat;
  kind: MediaUploadKind;
}) {
  return (
    kind !== "listing_photo" &&
    (hasAlpha || inputFormat === "png") &&
    getMediaUploadConfig(kind).outputFormats.includes("png")
  );
}

export async function processMedia({
  buffer,
  inputFormat,
  kind,
}: ProcessMediaOptions): Promise<ProcessedMedia> {
  const config = getMediaUploadConfig(kind);
  const source = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const hasAlpha = Boolean(metadata.hasAlpha);
  const format = shouldPreserveAvatarPng({ hasAlpha, inputFormat, kind })
    ? "png"
    : "jpeg";

  const resized = source.resize(config.maxDimension, config.maxDimension, {
    fit: kind === "listing_photo" ? "inside" : "cover",
    withoutEnlargement: true,
  });

  const output =
    format === "png"
      ? await resized
          .png({
            adaptiveFiltering: true,
            compressionLevel: 9,
            effort: 10,
          })
          .toBuffer()
      : await resized
          .flatten({ background: "#fff" })
          .jpeg({
            mozjpeg: true,
            quality: 82,
          })
          .toBuffer();

  return {
    buffer: output,
    contentType: getCanonicalContentType(format),
    extension: getCanonicalExtension(format),
    format,
  };
}
