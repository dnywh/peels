"use client";

import { normaliseReferrer } from "@/utils/referrer";

const UTM_STORAGE_KEY = "attribution_params";
const INITIAL_REFERRER_KEY = "initial_referrer";
const INITIAL_REFERRER_COOKIE = "initial_referrer";
const isAttributionDebugEnabled =
  process.env.NEXT_PUBLIC_ATTRIBUTION_DEBUG === "true";

type AttributionParams = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export type StoredAttributionParams = Partial<AttributionParams> & {
  initial_referrer: string | null;
};

const getSafeCurrentUrl = (): string => {
  try {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.hash) {
      const hashParams = new URLSearchParams(currentUrl.hash.slice(1));
      if (
        hashParams.get("access_token") ||
        hashParams.get("refresh_token") ||
        hashParams.get("token")
      ) {
        currentUrl.hash = "#[redacted]";
      }
    }
    return currentUrl.toString();
  } catch (_error) {
    return window.location.origin + window.location.pathname;
  }
};

const getCookie = (name: string): string | null => {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return null;

  const value = cookie.split("=").slice(1).join("=");

  if (!value) return null;

  return normaliseReferrer(value) ?? null;
};

const getExternalDocumentReferrer = (): string | null => {
  const referrer = document.referrer;

  if (!referrer) return null;

  try {
    const referrerUrl = new URL(referrer);

    if (referrerUrl.host === window.location.host) {
      return null;
    }

    return referrer;
  } catch {
    return null;
  }
};

const storeInitialReferrer = (referrer: string) => {
  localStorage.setItem(INITIAL_REFERRER_KEY, normaliseReferrer(referrer));
};

export function captureAttributionParams() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utmParams: AttributionParams = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  const cookieReferrer = getCookie(INITIAL_REFERRER_COOKIE);

  if (isAttributionDebugEnabled) {
    console.log("Attribution Debug:", {
      currentUrl: getSafeCurrentUrl(),
      referrer: document.referrer,
      cookieReferrer,
      hasUtmParams: Object.values(utmParams).some((value) => value),
    });
  }

  const hasStoredReferrer = localStorage.getItem(INITIAL_REFERRER_KEY);
  const initialReferrer = cookieReferrer ?? getExternalDocumentReferrer();

  if (!hasStoredReferrer && initialReferrer) {
    if (isAttributionDebugEnabled) {
      console.log("Storing referrer:", initialReferrer);
    }
    storeInitialReferrer(initialReferrer);
  }

  const hasStoredUtm = localStorage.getItem(UTM_STORAGE_KEY);
  if (!hasStoredUtm && Object.values(utmParams).some((value) => value)) {
    if (isAttributionDebugEnabled) {
      console.log("Storing UTM params:", utmParams);
    }
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
  }
}

export function getStoredAttributionParams(): StoredAttributionParams {
  if (typeof window === "undefined") {
    return {
      initial_referrer: null,
    };
  }

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    const storedInitialReferrer = localStorage.getItem(INITIAL_REFERRER_KEY);
    const cookieReferrer = getCookie(INITIAL_REFERRER_COOKIE);
    const initialReferrer = storedInitialReferrer
      ? normaliseReferrer(storedInitialReferrer)
      : cookieReferrer;

    if (!storedInitialReferrer && initialReferrer) {
      storeInitialReferrer(initialReferrer);
    } else if (
      storedInitialReferrer &&
      initialReferrer &&
      initialReferrer !== storedInitialReferrer
    ) {
      storeInitialReferrer(initialReferrer);
    }

    return {
      ...(stored ? JSON.parse(stored) : {}),
      initial_referrer: initialReferrer || null,
    };
  } catch (e) {
    console.error("Error reading attribution params:", e);
    return {
      initial_referrer: null,
    };
  }
}

export function clearAttributionParams() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UTM_STORAGE_KEY);
  localStorage.removeItem(INITIAL_REFERRER_KEY);
}
