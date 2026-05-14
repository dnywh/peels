import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { HOST_EMAIL, signIn } from "./helpers";

const BUSINESS_LISTING_SLUG = "demo-inner-west-cafe";
const BUSINESS_LISTING_EDIT_PATH = `/profile/listings/${BUSINESS_LISTING_SLUG}`;

function parseLocalSupabaseEnv() {
  const output = execFileSync("supabase", ["status", "-o", "env"], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((env, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return env;

      const key = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1).replace(/^"(.*)"$/, "$1");
      env[key] = value;
      return env;
    }, {});
}

function createAdminClient() {
  const env = parseLocalSupabaseEnv();

  return createClient(env.API_URL, env.SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test("public listing media URLs still work without exposing bucket listings", async ({
  page,
}) => {
  const env = parseLocalSupabaseEnv();
  const publicResponse = await page.request.get(
    `${env.API_URL}/storage/v1/object/public/listing_photos/demo/garden.jpg`
  );

  expect(publicResponse.ok()).toBe(true);

  const listResponse = await page.request.post(
    `${env.API_URL}/storage/v1/object/list/listing_photos`,
    {
      data: { limit: 10, prefix: "" },
      headers: {
        apikey: env.ANON_KEY,
        Authorization: `Bearer ${env.ANON_KEY}`,
      },
    }
  );
  const listedObjects = (await listResponse.json()) as Array<{ name: string }>;

  expect(listResponse.ok()).toBe(true);
  expect(listedObjects).toEqual([]);
});

test("listing photo uploads are normalised to JPEG and removable", async ({
  page,
}) => {
  const admin = createAdminClient();
  let uploadedFilename: string | null = null;

  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: BUSINESS_LISTING_EDIT_PATH,
  });

  try {
    const uploadResult = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 20;
      canvas.height = 20;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create canvas context");
      }

      context.fillStyle = "#155b4a";
      context.fillRect(0, 0, 20, 20);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Could not create test image"));
        }, "image/png");
      });
      const formData = new FormData();
      formData.append("kind", "listing_photo");
      formData.append("entityId", "demo-inner-west-cafe");
      formData.append(
        "file",
        new File([blob], "upload-route-test.png", { type: "image/png" })
      );

      const response = await fetch("/api/media/upload", {
        body: formData,
        method: "POST",
      });
      const data = await response.json();

      return {
        data,
        ok: response.ok,
        status: response.status,
      };
    });

    expect(uploadResult.ok).toBe(true);
    expect(uploadResult.data.contentType).toBe("image/jpeg");
    expect(uploadResult.data.filename).toMatch(/\.jpg$/);
    uploadedFilename = uploadResult.data.filename;

    const { data: listing, error } = await admin
      .from("listings")
      .select("photos")
      .eq("slug", BUSINESS_LISTING_SLUG)
      .single();

    expect(error).toBeNull();
    expect(listing?.photos).toContain(uploadedFilename);
  } finally {
    if (uploadedFilename) {
      const { data: listing } = await admin
        .from("listings")
        .select("photos")
        .eq("slug", BUSINESS_LISTING_SLUG)
        .single();
      const photos = (listing?.photos ?? []).filter(
        (photo: string) => photo !== uploadedFilename
      );

      await admin
        .from("listings")
        .update({ photos })
        .eq("slug", BUSINESS_LISTING_SLUG);
      await admin.storage.from("listing_photos").remove([uploadedFilename]);
    }
  }
});
