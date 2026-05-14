import assert from "node:assert/strict";
import test from "node:test";
import {
  getCanonicalContentType,
  getCanonicalExtension,
  getMediaInputFormat,
  getMediaUploadConfig,
  isHeicLikeInput,
} from "./policy.ts";

test("media upload policy keeps photos as JPEG and avatars as JPEG or PNG", () => {
  assert.deepEqual(getMediaUploadConfig("listing_photo").outputFormats, [
    "jpeg",
  ]);
  assert.deepEqual(getMediaUploadConfig("profile_avatar").outputFormats, [
    "jpeg",
    "png",
  ]);
  assert.deepEqual(getMediaUploadConfig("listing_avatar").outputFormats, [
    "jpeg",
    "png",
  ]);
});

test("media input format detection accepts supported web and iOS formats", () => {
  assert.equal(
    getMediaInputFormat({ fileName: "photo.HEIC", mimeType: "" }),
    "heic"
  );
  assert.equal(
    getMediaInputFormat({ fileName: "avatar", mimeType: "image/avif" }),
    "avif"
  );
  assert.equal(
    getMediaInputFormat({ fileName: "logo.png", mimeType: "image/png" }),
    "png"
  );
  assert.equal(
    getMediaInputFormat({ fileName: "document.pdf", mimeType: "" }),
    null
  );
});

test("HEIC-like format detection covers HEIC and HEIF", () => {
  assert.equal(isHeicLikeInput("heic"), true);
  assert.equal(isHeicLikeInput("heif"), true);
  assert.equal(isHeicLikeInput("jpeg"), false);
});

test("canonical output helpers map storage formats to content types and extensions", () => {
  assert.equal(getCanonicalContentType("jpeg"), "image/jpeg");
  assert.equal(getCanonicalExtension("jpeg"), "jpg");
  assert.equal(getCanonicalContentType("png"), "image/png");
  assert.equal(getCanonicalExtension("png"), "png");
});
