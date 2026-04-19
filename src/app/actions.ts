"use server";

import { validateName } from "@/lib/formValidation";
import { normaliseReferrer } from "@/utils/referrer";
import { createClient } from "@/utils/supabase/server";
import { getBaseUrl } from "@/utils/url";
import {
  encodedRedirect,
  isTurnstileEnabled,
  validateTurnstileToken,
} from "@/utils/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const signUpAction = async (formData: FormData, request?: Request) => {
  const t = await getTranslations("Errors");
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstNameValidation = validateName(formData.get("first_name")); // Trim first name
  const first_name = firstNameValidation.isValid
    ? firstNameValidation.value
    : null;
  const newsletterPreference = formData.has("newsletter_preference"); // Will only be passed if input is checked when form submitted

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  // Get attribution data
  const referrer = normaliseReferrer(
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

  // Check if user exists in auth.users
  const { data: existingAuthUser, error: authError } = await supabase.rpc(
    "check_if_email_exists",
    {
      email_to_check: email,
    }
  );

  if (authError) {
    console.error("Error checking email:", authError);
    redirectUrl.searchParams.append("error", t("genericLater"));
    return redirect(redirectUrl.toString());
  }

  if (existingAuthUser) {
    redirectUrl.searchParams.append("error", t("accountExists"));
    return redirect(redirectUrl.toString());
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
      emailRedirectTo: `${origin || getBaseUrl()}/auth/complete?next=/profile`,
      data: {
        first_name,
        is_newsletter_subscribed: newsletterPreference,
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

export const signInAction = async (formData: FormData, request: Request) => {
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

  return redirect(redirectTo || "/map");
};

// Very similar to the sendPasswordResetEmailAction
export const forgotPasswordAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", t("emailRequired"));
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      origin || getBaseUrl()
    }/auth/complete?next=/profile/reset-password`,
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

export const updateFirstNameAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstNameValidation = validateName(formData.get("first_name"));
  if (!firstNameValidation.isValid) {
    return { error: t("emptyName") };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstNameValidation.value,
    })
    .eq("id", user?.id);

  if (error) {
    console.error("Error updating first name:", error);
    return { error: t("updateFirstNameFailed") };
  }

  return { success: true };
};

export const sendEmailChangeEmailAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: formData.get("email") as string,
  });

  if (error) {
    console.error("Error sending email change email:", error);
    return {
      error: t("updateEmailFailed"),
    };
  }

  return { success: true };
};

export const updateNewsletterPreferenceAction = async (formData: FormData) => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const newsletterPreference = formData.get("newsletter_preference") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({
      is_newsletter_subscribed: newsletterPreference,
    })
    .eq("id", user?.id);

  if (error) {
    console.error("Error updating newsletter preference:", error);
    return { error: t("updateNewsletterFailed") };
  }

  return { success: true };
};

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

export const deleteListingAction = async (slug: string) => {
  const t = await getTranslations();
  // Check if user is logged in first
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  // Then continue with the delete listing
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-listing`, // Adjust the endpoint as necessary
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }), // Send the slug in the request body
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const data = await response.json();

    if (!response.ok) {
      console.error("Error deleting listing:", data.message);
      return { success: false, message: t("Errors.failedDeleteListing") };
    } else {
      console.log("Listing successfully deleted:", slug);
      return { success: true, message: t("Listings.delete.success") };
    }
  } catch (error) {
    console.error("Error deleting listing:", error);
    return {
      success: false,
      message: t("Errors.generic"),
    };
  }
};

export const deleteAccountAction = async () => {
  const t = await getTranslations("Errors");
  let redirectPath: string | null = null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    // const data = await response.json();
    // console.log("Response data:", data);

    redirectPath = `/sign-in?success=${encodeURIComponent(t("accountDeleted"))}`;

    // if (!response.ok) {
    //   console.error("Delete account failed:", data);
    //   redirectPath = `/profile?error=Failed to delete account`
    // }
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

    console.log(`Successfully fetched ${data?.length || 0} listings`);
    return data || [];
  } catch (error) {
    console.error("Fatal error in fetchListingsInView:", {
      error,
      bounds: { south, west, north, east },
    });
    return [];
  }
}

export const createOrUpdateListingAction = async (listingData: any) => {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  try {
    console.log("Server action: Creating/updating listing");

    // Check name validation
    if (listingData.type !== "residential" && listingData.name) {
      const nameValidation = validateName(listingData.name);
      if (!nameValidation.isValid) {
        return { error: t("emptyName") };
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
        return {
          error: t("tooManyListings"),
        };
      } else if (error.code === "23505") {
        return { error: t("duplicateListing") };
      }
      return { error: t("genericLater") };
    }

    // If this was a new listing with pending photos, update them
    if (!listingData.id && listingData.photos?.length > 0) {
      const { error: updateError } = await supabase
        .from("listings")
        .update({ photos: listingData.photos })
        .eq("slug", data.slug);

      if (updateError) {
        console.error("Error updating photos:", updateError);
        return { error: t("savePhotosFailed") };
      }
    }

    // Revalidate relevant paths
    revalidatePath("/map");
    revalidatePath("/listings");
    if (data?.slug) {
      revalidatePath(`/listings/${data.slug}`);
    }

    return { data };
  } catch (error) {
    console.error("Unexpected error in createOrUpdateListingAction:", error);
    return { error: t("unexpected") };
  }
};
