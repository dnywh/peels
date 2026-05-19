import sharp from "sharp";
import {
  type CanonicalMediaFormat,
  type MediaUploadKind,
  getCanonicalContentType,
  getCanonicalExtension,
  getMediaUploadConfig,
} from "./policy.ts";

export type ProcessedMedia = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  format: CanonicalMediaFormat;
};

type ProcessMediaOptions = {
  buffer: Buffer;
  kind: MediaUploadKind;
};

function canPreserveAvatarPng(kind: MediaUploadKind) {
  return (
    kind !== "listing_photo" &&
    getMediaUploadConfig(kind).outputFormats.includes("png")
  );
}

function hasTransparentPixels(buffer: Buffer, channels: number) {
  if (channels < 4) return false;

  for (let offset = channels - 1; offset < buffer.length; offset += channels) {
    if (buffer[offset] < 255) {
      return true;
    }
  }

  return false;
}

export async function processMedia({
  buffer,
  kind,
}: ProcessMediaOptions): Promise<ProcessedMedia> {
  const config = getMediaUploadConfig(kind);
  const source = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const resized = source.resize(config.maxDimension, config.maxDimension, {
    fit: kind === "listing_photo" ? "inside" : "cover",
    withoutEnlargement: true,
  });

  let format: CanonicalMediaFormat = "jpeg";
  let output: Buffer;

  if (metadata.hasAlpha && canPreserveAvatarPng(kind)) {
    const transformed = await resized
      .clone()
      .raw()
      .toBuffer({ resolveWithObject: true });
    format = hasTransparentPixels(transformed.data, transformed.info.channels)
      ? "png"
      : "jpeg";

    const transformedImage = sharp(transformed.data, {
      raw: {
        channels: transformed.info.channels,
        height: transformed.info.height,
        width: transformed.info.width,
      },
    });

    output =
      format === "png"
        ? await transformedImage
            .png({
              adaptiveFiltering: true,
              compressionLevel: 9,
              effort: 10,
            })
            .toBuffer()
        : await transformedImage
            .flatten({ background: "#fff" })
            .jpeg({
              mozjpeg: true,
              quality: 82,
            })
            .toBuffer();
  } else {
    output = await resized
      .flatten({ background: "#fff" })
      .jpeg({
        mozjpeg: true,
        quality: 82,
      })
      .toBuffer();
  }

  return {
    buffer: output,
    contentType: getCanonicalContentType(format),
    extension: getCanonicalExtension(format),
    format,
  };
}
