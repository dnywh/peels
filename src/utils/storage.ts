const STORAGE_PUBLIC_PATH = "/storage/v1/object/public";
const PRODUCTION_SUPABASE_ORIGIN = "https://mfnaqdyunuafbwukbbyr.supabase.co";

function normaliseAssetPath(assetPath: string) {
  return assetPath.replace(/^\/+/, "");
}

function isLocalSupabaseHost(hostname: string) {
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function getHostedStaticOrigin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);

      if (!isLocalSupabaseHost(url.hostname)) {
        return supabaseUrl.replace(/\/$/, "");
      }
    } catch {
      // Ignore invalid URLs and fall back to the production static bucket.
    }
  }

  return PRODUCTION_SUPABASE_ORIGIN;
}

function getStaticObjectPath(assetPath: string) {
  return `${STORAGE_PUBLIC_PATH}/static/${normaliseAssetPath(assetPath)}`;
}

export function getStoragePublicUrl(bucket: string, assetPath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  return `${supabaseUrl.replace(/\/$/, "")}${STORAGE_PUBLIC_PATH}/${bucket}/${normaliseAssetPath(assetPath)}`;
}

export function getHostedStaticPublicUrl(assetPath: string) {
  return `${getHostedStaticOrigin()}${getStaticObjectPath(assetPath)}`;
}

export function getStaticAssetUrl(
  assetPath: string,
  _localFallbackPath: string
) {
  return getHostedStaticPublicUrl(assetPath);
}

export function getStaticFontUrl(assetPath: string) {
  return getHostedStaticPublicUrl(`fonts/${assetPath}`);
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
