"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/utils/url";

export const signUpAction = async (formData: FormData, request: Request) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const first_name = formData.get("first_name")?.toString();
  const inviteCode = formData.get("invite_code");
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

  if (inviteCode !== process.env.INVITE_CODE) {
    redirectUrl.searchParams.append(
      "error",
      "Sorry, that invite code is invalid.",
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
  const next = formData.get("next") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect(next || "/map");
};

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
    }/auth/callback?redirect_to=/reset-password-two`,
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
    "Check your inbox for a password reset link, assuming that email is linked to a Peels account.",
  );
};

// This action triggers the password reset email to be sent to the user
export const sendPasswordResetEmailAction = async (formData: FormData) => {
  // console.log("Sending password reset email");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "We couldn’t find an account for that email address.",
    );
  }

  const { data, error } = await supabase.auth
    .resetPasswordForEmail(user?.email || "", {
      redirectTo: `${
        origin || getBaseUrl()
      }/auth/callback?redirect_to=/reset-password-two`,
    });
};

// Whereas this action actually updates the user's password
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const newPassword = formData.get("password") as string;
  const confirmNewPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmNewPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required.",
    );
  }

  if (newPassword !== confirmNewPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Hmm. Something’s not right. Mind trying again?",
    );
  }

  encodedRedirect(
    "success",
    "/reset-password",
    "Your password has been updated.",
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
