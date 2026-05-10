"use server";

import { isDisposableSignupEmail } from "@/lib/emailValidation";
import {
  validateFirstName,
  validateName,
  type FirstNameErrorCode,
} from "@/lib/formValidation";
import { getSafeHttpReferrer } from "@/utils/referrer";
import { createClient } from "@/utils/supabase/server";
import { getBaseUrl } from "@/utils/url";
import {
  encodedRedirect,
  isTurnstileEnabled,
  validateTurnstileToken,
} from "@/utils/utils";
import { getUserLocale, setUserLocale } from "@/i18n/services/locale";
import { normaliseNextPath, resolveAuthLocale } from "@/utils/authRedirects";
import { isMissingPreferredLocaleColumn } from "@/utils/postgrest";
import { normaliseLocale, type Locale } from "@/i18n/config";
import type { InlineActionResult } from "@/types/actionResult";
import type {
  DeleteListingResult,
  ListingDraftInput,
  ListingSubmitResult,
  ListingType,
} from "@/types/listing";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

function translateFirstNameFieldError(
  t: Awaited<ReturnType<typeof getTranslations>>,
  code?: FirstNameErrorCode
): string {
  switch (code) {
    case "empty":
      return t("emptyName");
    case "tooShort":
      return t("firstNameTooShort");
    case "tooLong":
      return t("firstNameTooLong");
    case "forbiddenContent":
    case "reserved":
      return t("firstNameNotAllowed");
    case "invalidChars":
      return t("firstNameInvalidChars");
    default:
      return t("generic");
  }
}

type UpdateFirstNameActionData = {
  firstName: string;
};

type SendEmailChangeActionData = {
  email: string;
};

type UpdateNewsletterPreferenceActionData = {
  newsletterPreference: boolean;
};

type UpdatePreferredLocaleActionData = {
  preferredLocale: Locale;
};

type SetDisplayLocaleActionData = {
  locale: Locale;
};

function getActionFormData<T>(
  previousStateOrFormData: FormData | InlineActionResult<T>,
  maybeFormData?: FormData
) {
  return previousStateOrFormData instanceof FormData
    ? previousStateOrFormData
    : (maybeFormData as FormData);
}

function actionError<T>(error: string): InlineActionResult<T> {
  return { success: false, error };
}

function actionSuccess<T>(data?: T): InlineActionResult<T> {
  if (data === undefined) {
    return { success: true, error: null };
  }

  return { success: true, error: null, data };
}

export const signUpAction = async (formData: FormData, request?: Request) => {
  const t = await getTranslations("Errors");
  const email = (formData.get("email")?.toString() ?? "").trim();
  const password = formData.get("password")?.toString();
  const rawFirstName = formData.get("first_name")?.toString();
  const locale = resolveAuthLocale(
    formData.get("locale")?.toString() ?? (await getUserLocale())
  );
  const firstNameValidation = validateFirstName(formData.get("first_name"));
  if (!firstNameValidation.isValid) {
    const preservedData = new URLSearchParams();
    if (email) preservedData.set("email", email);
    if (rawFirstName?.trim())
      preservedData.set("first_name", rawFirstName.trim());
    const redirectUrl = new URL(
      "/sign-up",
      (await headers()).get("origin") || getBaseUrl()
    );
    preservedData.forEach((value, key) => {
      redirectUrl.searchParams.append(key, value);
    });
    redirectUrl.searchParams.append(
      "error",
      translateFirstNameFieldError(t, firstNameValidation.error)
    );
    return redirect(redirectUrl.toString());
  }
  const first_name = firstNameValidation.value;
  const newsletterPreference = formData.has("newsletter_preference"); // Will only be passed if input is checked when form submitted

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  // Get attribution data
  const referrer = getSafeHttpReferrer(
    formData.get("initial_referrer")?.toString()
  );
  const utmSource = formData.get("utm_source")?.toString();
  const utmMedium = formData.get("utm_medium")?.toString();
  const utmCampaign = formData.get("utm_campaign")?.toString();

  // Debug attribution data
  console.log("Sign up data:", {
    newsletterPreference,
    attribution: {
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    },
    // Log the full request URL if available
    url: request?.url,
  });

  // Only preserve non-sensitive fields
  const preservedData = new URLSearchParams();
  if (email) preservedData.set("email", email);
  if (first_name) preservedData.set("first_name", first_name);

  // Add error/success to the same URLSearchParams object
  const redirectUrl = new URL("/sign-up", origin || getBaseUrl());
  preservedData.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  const captchaToken = formData.get("captcha_token")?.toString();
  const turnstileEnabled = isTurnstileEnabled();

  if (!email || !password || !first_name) {
    redirectUrl.searchParams.append("error", t("missingSignUpFields"));
    return redirect(redirectUrl.toString());
  }

  if (isDisposableSignupEmail(email)) {
    redirectUrl.searchParams.append("error", t("disposableEmailNotAllowed"));
    return redirect(redirectUrl.toString());
  }

  if (turnstileEnabled && !captchaToken) {
    redirectUrl.searchParams.append("error", t("verificationChallenge"));
    return redirect(redirectUrl.toString());
  }

  // Validate Turnstile token server-side if enabled with environment variable
  if (turnstileEnabled && captchaToken) {
    const validationResult = await validateTurnstileToken(captchaToken);
    if (!validationResult.success) {
      redirectUrl.searchParams.append(
        "error",
        validationResult.error || t("verificationFailed")
      );
      return redirect(redirectUrl.toString());
    }
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Note: We validate Turnstile server-side above, so we don't pass captchaToken to Supabase
      // This allows us to have granular control (only on sign-up, not sign-in/password reset)
      emailRedirectTo: `${origin || getBaseUrl()}/auth/complete?next=/profile&locale=${locale}`,
      data: {
        first_name,
        is_newsletter_subscribed: newsletterPreference,
        preferred_locale: locale,
        http_referrer: referrer,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
      },
    },
  });

  if (error || !user) {
    // Temporary check and special handling for Supabase hook timeout errors
    // See https://github.com/dnywh/peels/issues/3
    const hookTimeoutPatterns = [
      "Error running hook URI",
      "Failed to reach hook within maximum time",
    ];
    const isHookTimeout = hookTimeoutPatterns.some((pattern) =>
      error?.message?.includes(pattern)
    );
    if (isHookTimeout) {
      redirectUrl.searchParams.append("error", t("generic"));
      return redirect(redirectUrl.toString());
    }

    const accountExistsPatterns = [
      "already registered",
      "already exists",
      "User already registered",
    ];
    const accountExists = accountExistsPatterns.some((pattern) =>
      error?.message?.toLowerCase().includes(pattern.toLowerCase())
    );
    if (accountExists) {
      redirectUrl.searchParams.append("error", t("accountExists"));
      return redirect(redirectUrl.toString());
    }

    // Back to general error catching
    console.error(
      error?.code + " " + error?.message || "No user returned from sign up"
    );
    redirectUrl.searchParams.append(
      "error",
      error?.message || t("signUpFailed")
    );
    return redirect(redirectUrl.toString());
  }

  // Success state
  redirectUrl.searchParams.append("success", "true");
  return redirect(redirectUrl.toString());
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect_to") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect(normaliseNextPath(redirectTo, "/map"));
};

// Very similar to the sendPasswordResetEmailAction
export const forgotPasswordAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();
  const locale = resolveAuthLocale(
    formData.get("locale")?.toString() ?? (await getUserLocale())
  );

  if (!email) {
    return encodedRedirect("error", "/forgot-password", t("emailRequired"));
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin || getBaseUrl()}/auth/complete?next=/profile/reset-password&locale=${locale}`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/forgot-password", t("generic"));
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    t("forgotPasswordSuccess")
  );
};

export async function updateFirstNameAction(
  previousState: InlineActionResult<UpdateFirstNameActionData>,
  formData: FormData
): Promise<InlineActionResult<UpdateFirstNameActionData>>;
export async function updateFirstNameAction(
  formData: FormData
): Promise<InlineActionResult<UpdateFirstNameActionData>>;
export async function updateFirstNameAction(
  previousStateOrFormData:
    | FormData
    | InlineActionResult<UpdateFirstNameActionData>,
  maybeFormData?: FormData
) {
  const formData = getActionFormData(previousStateOrFormData, maybeFormData);
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return actionError<UpdateFirstNameActionData>(t("generic"));
  }

  const firstNameValidation = validateFirstName(formData.get("first_name"));
  if (!firstNameValidation.isValid) {
    return actionError<UpdateFirstNameActionData>(
      translateFirstNameFieldError(t, firstNameValidation.error)
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstNameValidation.value,
    })
    .eq("id", user?.id);

  if (error) {
    console.error("Error updating first name:", error);
    if (error.code === "23514" || /first name/i.test(error.message ?? "")) {
      return actionError<UpdateFirstNameActionData>(t("firstNameNotAllowed"));
    }
    return actionError<UpdateFirstNameActionData>(t("updateFirstNameFailed"));
  }

  revalidatePath("/profile");

  return actionSuccess<UpdateFirstNameActionData>({
    firstName: firstNameValidation.value ?? "",
  });
}

export async function sendEmailChangeEmailAction(
  previousState: InlineActionResult<SendEmailChangeActionData>,
  formData: FormData
): Promise<InlineActionResult<SendEmailChangeActionData>>;
export async function sendEmailChangeEmailAction(
  formData: FormData
): Promise<InlineActionResult<SendEmailChangeActionData>>;
export async function sendEmailChangeEmailAction(
  previousStateOrFormData:
    | FormData
    | InlineActionResult<SendEmailChangeActionData>,
  maybeFormData?: FormData
) {
  const formData = getActionFormData(previousStateOrFormData, maybeFormData);
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nextEmail = formData.get("email")?.toString()?.trim();
  const locale = resolveAuthLocale(
    formData.get("locale")?.toString() ?? (await getUserLocale())
  );

  if (!nextEmail) {
    return actionError<SendEmailChangeActionData>(t("emailRequired"));
  }

  if (nextEmail === user?.email) {
    return actionError<SendEmailChangeActionData>(t("alreadyYourEmail"));
  }

  const { error } = await supabase.auth.updateUser(
    {
      email: nextEmail,
    },
    {
      emailRedirectTo: `${origin || getBaseUrl()}/auth/complete?next=/profile&locale=${locale}`,
    }
  );

  if (error) {
    console.error("Error sending email change email:", error);
    return actionError<SendEmailChangeActionData>(t("updateEmailFailed"));
  }

  return actionSuccess<SendEmailChangeActionData>({ email: nextEmail });
}

export async function updateNewsletterPreferenceAction(
  previousState: InlineActionResult<UpdateNewsletterPreferenceActionData>,
  formData: FormData
): Promise<InlineActionResult<UpdateNewsletterPreferenceActionData>>;
export async function updateNewsletterPreferenceAction(
  formData: FormData
): Promise<InlineActionResult<UpdateNewsletterPreferenceActionData>>;
export async function updateNewsletterPreferenceAction(
  previousStateOrFormData:
    | FormData
    | InlineActionResult<UpdateNewsletterPreferenceActionData>,
  maybeFormData?: FormData
) {
  const formData = getActionFormData(previousStateOrFormData, maybeFormData);
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return actionError<UpdateNewsletterPreferenceActionData>(t("generic"));
  }

  const newsletterPreference = formData.get("newsletter_preference") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({
      is_newsletter_subscribed: newsletterPreference,
    })
    .eq("id", user?.id);

  if (error) {
    console.error("Error updating newsletter preference:", error);
    return actionError<UpdateNewsletterPreferenceActionData>(
      t("updateNewsletterFailed")
    );
  }

  revalidatePath("/profile");

  return actionSuccess<UpdateNewsletterPreferenceActionData>({
    newsletterPreference,
  });
}

export const setDisplayLocaleAction = async (
  formData: FormData
): Promise<InlineActionResult<SetDisplayLocaleActionData>> => {
  const t = await getTranslations("Errors");
  const nextLocale = normaliseLocale(formData.get("locale")?.toString());

  if (!nextLocale) {
    return actionError<SetDisplayLocaleActionData>(t("generic"));
  }

  await setUserLocale(nextLocale);
  revalidatePath("/", "layout");

  return actionSuccess<SetDisplayLocaleActionData>({
    locale: nextLocale,
  });
};

export async function updatePreferredLocaleAction(
  previousState: InlineActionResult<UpdatePreferredLocaleActionData>,
  formData: FormData
): Promise<InlineActionResult<UpdatePreferredLocaleActionData>>;
export async function updatePreferredLocaleAction(
  formData: FormData
): Promise<InlineActionResult<UpdatePreferredLocaleActionData>>;
export async function updatePreferredLocaleAction(
  previousStateOrFormData:
    | FormData
    | InlineActionResult<UpdatePreferredLocaleActionData>,
  maybeFormData?: FormData
) {
  const formData = getActionFormData(previousStateOrFormData, maybeFormData);
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const nextLocale = normaliseLocale(
    formData.get("preferred_locale")?.toString()
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !nextLocale) {
    return actionError<UpdatePreferredLocaleActionData>(t("generic"));
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      preferred_locale: nextLocale,
    })
    .eq("id", user.id);

  const profileUpdated =
    !profileError || isMissingPreferredLocaleColumn(profileError);

  if (profileError && !isMissingPreferredLocaleColumn(profileError)) {
    console.error("Error updating preferred locale profile:", profileError);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      preferred_locale: nextLocale,
    },
  });

  const authUpdated = !authError;

  if (authError) {
    console.error("Error updating preferred locale auth metadata:", authError);
  }

  if (!profileUpdated && !authUpdated) {
    return actionError<UpdatePreferredLocaleActionData>(t("genericLater"));
  }

  await setUserLocale(nextLocale);
  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return actionSuccess<UpdatePreferredLocaleActionData>({
    preferredLocale: nextLocale,
  });
}

// This action triggers the password reset email to be sent to the user, called from the ProfileAccountSettings component
// See also the very similar forgotPasswordAction which this is based on
// export const sendPasswordResetEmailAction = async (formData: FormData) => {
//   const supabase = await createClient();
//   const origin = (await headers()).get("origin");

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const email = user?.email;

//   if (!email) {
//     return {
//       error:
//         "Sorry, we're having trouble sending a password reset link to your email address. Please reach out to support.",
//     };
//   }

//   const { error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: `${
//       origin || getBaseUrl()
//     }/auth/complete?next=/profile/reset-password`,
//   });

//   if (error) {
//     console.error("Error sending password reset email:", error);
//     return { error: "Sorry, we couldn’t send a password reset link." };
//   }

//   return { success: true };
// };

// Whereas this action actually updates the user's password
export const resetPasswordAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  const newPassword = formData.get("password") as string;
  const confirmNewPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmNewPassword) {
    encodedRedirect(
      "error",
      "/profile/reset-password",
      t("requiredPasswordFields")
    );
  }

  if (newPassword !== confirmNewPassword) {
    encodedRedirect("error", "/profile/reset-password", t("passwordMismatch"));
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/profile/reset-password",
      t("resetPasswordDenied")
    );
  }

  encodedRedirect(
    "success",
    "/profile/reset-password",
    t("resetPasswordSuccess")
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const deleteListingAction = async (
  slug: string
): Promise<InlineActionResult<DeleteListingResult>> => {
  const t = await getTranslations();
  // Check if user is logged in first
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session?.access_token) {
    return redirect("/sign-in");
  }
  // Then continue with the delete listing
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-listing`, // Adjust the endpoint as necessary
      {
        method: "POST",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const data = await response.json();

    if (!response.ok) {
      console.error("Error deleting listing:", data.message);
      return actionError(t("Errors.failedDeleteListing"));
    }

    console.log("Listing successfully deleted:", slug);
    const message = t("Listings.delete.success");

    revalidatePath("/map");
    revalidatePath("/listings");
    revalidatePath("/profile");
    revalidatePath("/profile/listings");
    revalidatePath(`/listings/${slug}`);

    return actionSuccess({
      slug,
      message,
      redirectTo: `/profile/?message=${encodeURIComponent(message)}`,
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return actionError(t("Errors.generic"));
  }
};

export const deleteAccountAction = async () => {
  const t = await getTranslations("Errors");
  let redirectPath: string | null = null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session?.access_token) {
    return redirect("/sign-in");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: "POST",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const data = await response.json();

    if (!response.ok) {
      console.error("Delete account failed:", data);
      redirectPath = `/profile?error=${encodeURIComponent(t("deleteAccountFailed"))}`;
    } else {
      redirectPath = `/sign-in?success=${encodeURIComponent(t("accountDeleted"))}`;
    }
  } catch (error) {
    console.error("Delete account error:", error);
    redirectPath = `/profile?error=${encodeURIComponent(t("deleteAccountFailed"))}`;
  } finally {
    await supabase.auth.signOut();
    if (redirectPath) {
      return redirect(redirectPath);
    }
  }
};

// Helper function to wait
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  backoff = 300
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await delay(backoff);
    return withRetry(fn, retries - 1, backoff * 2);
  }
}

export async function fetchListingsInView(
  south: number,
  west: number,
  north: number,
  east: number
) {
  const supabase = await createClient();

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.rpc("listings_in_view", {
        min_lat: south,
        min_long: west,
        max_lat: north,
        max_long: east,
      });
    });

    if (error) {
      console.error("Supabase RPC Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Fatal error in fetchListingsInView:", {
      error,
      bounds: { south, west, north, east },
    });
    return [];
  }
}

export const createOrUpdateListingAction = async (
  listingData: ListingDraftInput
): Promise<InlineActionResult<ListingSubmitResult>> => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  try {
    console.log("Server action: Creating/updating listing");

    if (
      listingData.type !== "business" &&
      listingData.type !== "community" &&
      listingData.type !== "residential"
    ) {
      return actionError(t("unexpected"));
    }

    // Check name validation
    if (listingData.type !== "residential" && listingData.name) {
      const nameValidation = validateName(listingData.name);
      if (!nameValidation.isValid) {
        return actionError(t("emptyName"));
      }
      // Use the validated value
      listingData.name = nameValidation.value;
    }

    // Insert/update the listing
    const { data, error } = await supabase
      .from("listings")
      .upsert(listingData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      // Return specific error messages based on error codes
      if (error.code === "42501") {
        return actionError(t("tooManyListings"));
      }

      if (error.code === "23505") {
        return actionError(t("duplicateListing"));
      }

      return actionError(t("genericLater"));
    }

    // If this was a new listing with pending photos, update them
    if (!listingData.id && listingData.photos?.length > 0) {
      const { error: updateError } = await supabase
        .from("listings")
        .update({ photos: listingData.photos })
        .eq("slug", data.slug);

      if (updateError) {
        console.error("Error updating photos:", updateError);
        return actionError(t("savePhotosFailed"));
      }
    }

    // Revalidate relevant paths
    revalidatePath("/map");
    revalidatePath("/listings");
    if (data?.slug) {
      revalidatePath(`/listings/${data.slug}`);
    }
    revalidatePath("/profile");
    revalidatePath("/profile/listings");

    if (!data?.slug || !data?.id) {
      return actionError(t("genericLater"));
    }

    return actionSuccess({
      created: !listingData.id,
      id: data.id,
      redirectTo: `/listings/${data.slug}?status=${listingData.id ? "updated" : "created"}`,
      slug: data.slug,
      type: listingData.type as ListingType,
    });
  } catch (error) {
    console.error("Unexpected error in createOrUpdateListingAction:", error);
    return actionError(t("unexpected"));
  }
};
