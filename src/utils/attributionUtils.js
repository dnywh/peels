"use client";

const UTM_STORAGE_KEY = "attribution_params";
const INITIAL_REFERRER_KEY = "initial_referrer";

export function captureAttributionParams() {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Get UTM params from URL
  const params = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };

  // Debug info
  console.log("Attribution Debug:", {
    currentUrl: window.location.href,
    referrer: document.referrer,
    hasUtmParams: Object.values(utmParams).some((value) => value),
  });

  // Capture initial referrer if we don't have one yet
  const hasStoredReferrer = localStorage.getItem(INITIAL_REFERRER_KEY);
  if (
    !hasStoredReferrer &&
    document.referrer &&
    !document.referrer.includes(window.location.host)
  ) {
    console.log("Storing referrer:", document.referrer);
    localStorage.setItem(INITIAL_REFERRER_KEY, document.referrer);
  }

  // Only store UTM params if we have at least one AND we don't have any stored yet
  const hasStoredUtm = localStorage.getItem(UTM_STORAGE_KEY);
  if (!hasStoredUtm && Object.values(utmParams).some((value) => value)) {
    console.log("Storing UTM params:", utmParams);
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
  }
}

export function getStoredAttributionParams() {
  // Only run in browser
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    const initialReferrer = localStorage.getItem(INITIAL_REFERRER_KEY);

    return {
      ...(stored ? JSON.parse(stored) : {}),
      initial_referrer: initialReferrer || null,
    };
  } catch (e) {
    console.error("Error reading attribution params:", e);
    return {};
  }
}

// Unused in production, as we want to keep first-touch attribution data
export function clearAttributionParams() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UTM_STORAGE_KEY);
  localStorage.removeItem(INITIAL_REFERRER_KEY);
}
