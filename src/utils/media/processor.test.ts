import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { processMedia } from "./processor.ts";

test("opaque PNG avatars are canonicalised to JPEG", async () => {
  const input = await sharp({
    create: {
      background: "#155b4a",
      channels: 3,
      height: 16,
      width: 16,
    },
  })
    .png()
    .toBuffer();

  const result = await processMedia({
    buffer: input,
    kind: "profile_avatar",
  });

  assert.equal(result.format, "jpeg");
  assert.equal(result.contentType, "image/jpeg");
  assert.equal(result.extension, "jpg");
});

test("opaque RGBA PNG avatars are canonicalised to JPEG", async () => {
  const input = await sharp({
    create: {
      background: { alpha: 1, b: 74, g: 91, r: 21 },
      channels: 4,
      height: 16,
      width: 16,
    },
  })
    .png()
    .toBuffer();

  const result = await processMedia({
    buffer: input,
    kind: "profile_avatar",
  });

  assert.equal(result.format, "jpeg");
  assert.equal(result.contentType, "image/jpeg");
  assert.equal(result.extension, "jpg");
});

test("transparent PNG avatars preserve PNG output", async () => {
  const input = await sharp({
    create: {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      channels: 4,
      height: 16,
      width: 16,
    },
  })
    .png()
    .toBuffer();

  const result = await processMedia({
    buffer: input,
    kind: "listing_avatar",
  });

  assert.equal(result.format, "png");
  assert.equal(result.contentType, "image/png");
  assert.equal(result.extension, "png");
});

test("avatars with cropped-out transparency are canonicalised to JPEG", async () => {
  const width = 2048;
  const height = 1024;
  const pixels = Buffer.alloc(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const x = index % width;
    pixels[offset] = 21;
    pixels[offset + 1] = 91;
    pixels[offset + 2] = 74;
    pixels[offset + 3] = x < 128 ? 0 : 255;
  }

  const input = await sharp(pixels, {
    raw: {
      channels: 4,
      height,
      width,
    },
  })
    .png()
    .toBuffer();

  const result = await processMedia({
    buffer: input,
    kind: "profile_avatar",
  });

  assert.equal(result.format, "jpeg");
  assert.equal(result.contentType, "image/jpeg");
  assert.equal(result.extension, "jpg");
});
