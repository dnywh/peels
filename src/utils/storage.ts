const PRODUCTION_SUPABASE_HOST = "mfnaqdyunuafbwukbbyr.supabase.co";
const STORAGE_PUBLIC_PATH = "/storage/v1/object/public";

function normalizeAssetPath(assetPath: string) {
  return assetPath.replace(/^\/+/, "");
}

function getSupabaseHost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

export function getStoragePublicUrl(bucket: string, assetPath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  return `${supabaseUrl.replace(/\/$/, "")}${STORAGE_PUBLIC_PATH}/${bucket}/${normalizeAssetPath(assetPath)}`;
}

export function usesHostedStaticAssets() {
  return getSupabaseHost() === PRODUCTION_SUPABASE_HOST;
}

export function getStaticAssetUrl(
  assetPath: string,
  localFallbackPath: string
) {
  if (!usesHostedStaticAssets()) {
    return localFallbackPath;
  }

  return getStoragePublicUrl("static", assetPath) ?? localFallbackPath;
}

export function getStaticFontUrl(assetPath: string) {
  return getStoragePublicUrl(
    "static",
    `fonts/${normalizeAssetPath(assetPath)}`
  );
}

export function getPromoKitUrl() {
  return getStaticAssetUrl("promo-kit.zip", "/fallbacks/promo-kit.txt");
}

export function getNewsletterIssueImageUrl(
  issueNumber: number | string,
  assetFile: string
) {
  return getStaticAssetUrl(
    `newsletter/${issueNumber}/${assetFile}`,
    "/map-tiles/hero.jpg"
  );
}
