"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const first_name = formData.get("first_name")?.toString();
  const inviteCode = formData.get("invite_code");
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !first_name) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "A first name, email, and password are required."
    );
  }

  if (inviteCode !== process.env.INVITE_CODE) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Sorry, that invite code is invalid."
    );
  }

  // Check if user exists in auth.users
  const { data: existingAuthUser, error: authError } = await supabase
    .rpc('check_if_email_exists', {
      email_to_check: email
    });

  if (authError) {
    console.error('Error checking email:', authError);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Sorry, we couldn't process your request."
    );
  }

  if (existingAuthUser) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "An account with this email already exists. Please sign in instead."
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: first_name,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link."
  );
};

export const signInAction = async (formData: FormData) => {
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
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export const deleteAccountAction = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify user session is still valid before proceeding with account deletion
  if (!user) {
    return redirect("/sign-in");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      }
    );

    if (!response.ok) {
      return encodedRedirect("error", "/profile", "Failed to delete account");
    }

    await supabase.auth.signOut();
    return encodedRedirect("success", "/sign-in", "Account successfully deleted");
  } catch (error) {
    console.error('Delete account error:', error);
    return encodedRedirect("error", "/profile", "Failed to delete account");
  }
};
