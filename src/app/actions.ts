"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/utils/url";
import { revalidatePath } from "next/cache";

export const signUpAction = async (formData: FormData, request: Request) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const first_name = formData.get("first_name")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Only preserve non-sensitive fields
  const preservedData = new URLSearchParams();
  if (email) preservedData.set("email", email);
  if (first_name) preservedData.set("first_name", first_name);

  // Add error/success to the same URLSearchParams object
  const redirectUrl = new URL("/sign-up", origin || getBaseUrl());
  preservedData.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  if (!email || !password || !first_name) {
    redirectUrl.searchParams.append(
      "error",
      "A first name, email, and password are required.",
    );
    return redirect(redirectUrl.toString());
  }

  // Check if user exists in auth.users
  const { data: existingAuthUser, error: authError } = await supabase
    .rpc("check_if_email_exists", {
      email_to_check: email,
    });

  if (authError) {
    console.error("Error checking email:", authError);
    redirectUrl.searchParams.append(
      "error",
      "Sorry, we couldn't process your request.",
    );
    return redirect(redirectUrl.toString());
  }

  if (existingAuthUser) {
    redirectUrl.searchParams.append(
      "error",
      "An account with this email already exists. Please sign in instead.",
    );
    return redirect(redirectUrl.toString());
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin || getBaseUrl()}/auth/callback?type=signup`,
      data: {
        first_name: first_name,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    redirectUrl.searchParams.append("error", error.message);
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
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      origin || getBaseUrl()
    }/auth/callback?redirect_to=/profile/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Hmm. Something’s not right. Mind trying again?",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your inbox for a password reset link, assuming that email address is linked to a Peels account.",
  );
};

export const updateFirstNameAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.get("first_name")?.toString(),
    })
    .eq("id", user?.id);

  if (error) {
    console.error("Error updating first name:", error);
    return { error: "Sorry, we couldn’t update your first name." };
  }

  return { success: true };
};

export const sendEmailChangeEmailAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: formData.get("email") as string,
  });

  if (error) {
    console.error("Error sending email change email:", error);
    return { error: "Sorry, we couldn’t send an email change link." };
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
//         "Sorry, we’re having trouble sending a password reset link to your email address. Please reach out to support.",
//     };
//   }

//   const { error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: `${
//       origin || getBaseUrl()
//     }/auth/callback?redirect_to=/profile/reset-password`,
//   });

//   if (error) {
//     console.error("Error sending password reset email:", error);
//     return { error: "Sorry, we couldn’t send a password reset link." };
//   }

//   return { success: true };
// };

// Whereas this action actually updates the user's password
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const newPassword = formData.get("password") as string;
  const confirmNewPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmNewPassword) {
    encodedRedirect(
      "error",
      "/profile/reset-password",
      "Both those fields are required.",
    );
  }

  if (newPassword !== confirmNewPassword) {
    encodedRedirect(
      "error",
      "/profile/reset-password",
      "Those passwords don’t match.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/profile/reset-password",
      "Hmm. Something’s not right. You might not have permission to reset this password, or you tried reusing a recent password.",
    );
  }

  encodedRedirect(
    "success",
    "/profile/reset-password",
    "Got it! Your password has been updated.",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const deleteListingAction = async (slug: string) => {
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
          "Authorization":
            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }), // Send the slug in the request body
      },
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const data = await response.json();

    if (!response.ok) {
      console.error("Error deleting listing:", data.message);
      return { success: false, message: "Failed to delete listing." };
    } else {
      console.log("Listing successfully deleted:", slug);
      return { success: true, message: "Your listing has been deleted." };
    }
  } catch (error) {
    console.error("Error deleting listing:", error);
    return {
      success: false,
      message: "Hmm. Something’s not right. Mind trying again?",
    };
  }
};

export const deleteAccountAction = async () => {
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
          "Authorization":
            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      },
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    // const data = await response.json();
    // console.log("Response data:", data);

    redirectPath =
      `/sign-in?success=Your account has been deleted. Sorry to see you go.`;

    // if (!response.ok) {
    //   console.error("Delete account failed:", data);
    //   redirectPath = `/profile?error=Failed to delete account`
    // }
  } catch (error) {
    console.error("Delete account error:", error);
    redirectPath = `/profile?error=Error whilst deleting account`;
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
  backoff = 300,
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
  east: number,
) {
  const supabase = await createClient();

  try {
    const { data, error } = await withRetry(async () => {
      // console.log("Fetching listings with bounds:", {
      //   south,
      //   west,
      //   north,
      //   east,
      // });

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
  const supabase = await createClient();

  try {
    console.log("Server action: Creating/updating listing");

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
          error:
            "You’ve reached the maximum number of listings allowed. Delete one of your current three to create a new one.",
        };
      } else if (error.code === "23505") {
        return { error: "An identical listing already exists." };
      }
      return { error: "Something went wrong. Please try again later." };
    }

    // If this was a new listing with pending photos, update them
    if (!listingData.id && listingData.photos?.length > 0) {
      const { error: updateError } = await supabase
        .from("listings")
        .update({ photos: listingData.photos })
        .eq("slug", data.slug);

      if (updateError) {
        console.error("Error updating photos:", updateError);
        return { error: "Created listing but couldn’t save photos." };
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
    return { error: "An unexpected error occurred. Please try again later." };
  }
};
