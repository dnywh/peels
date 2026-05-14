import { getMediaInputFormat, isHeicLikeInput } from "@/utils/media/policy";

function replaceFileExtension(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "image"}.${extension}`;
}

export async function normaliseImageFileForUpload(file: File) {
  const inputFormat = getMediaInputFormat({
    fileName: file.name,
    mimeType: file.type,
  });

  if (!isHeicLikeInput(inputFormat)) {
    return file;
  }

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    quality: 0.86,
    toType: "image/jpeg",
  });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  return new File([convertedBlob], replaceFileExtension(file.name, "jpg"), {
    lastModified: file.lastModified,
    type: "image/jpeg",
  });
}
