// Custom Auth Emails with React Email and Resend
// https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend
// https://www.youtube.com/watch?v=tlA7BomSCgU

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import React from "npm:react@18.3.1";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend";
import { ResetPasswordEmail } from "../_templates/reset-password-email.tsx";
import { SignUpEmail } from "../_templates/sign-up-email.tsx";
import { EmailChangeEmail } from "../_templates/email-change-email.tsx";
import { MagicLinkEmail } from "../_templates/magic-link-email.tsx";
import { InviteEmail } from "../_templates/invite-email.tsx";
import { ReauthenticationEmail } from "../_templates/reauthentication-email.tsx";
import { renderAsync } from "npm:@react-email/components@0.0.22";
// Temporarily required, see below PR comment
// import { render } from "npm:@react-email/render";

// Look up required API keys from Supabase secrets
const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  try {
    const {
      user,
      email_data: {
        token,
        token_hash,
        redirect_to,
        email_action_type,
        new_email,
      },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        email_change: string;
        user_metadata: {
          username: string; // Only reliable upon signup, as user can later outdate this value (via editing their name on profiles table)
          first_name: string;
          lang: string;
        };
      };
      email_data: {
        email: string; // Testing (what's the difference with user.email above?)
        new_email: string; // Testing (desctructured above?)
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new: string;
        token_hash_new: string;
      };
    };

    // Prepare empty variables to be filled based on email_action_type
    let subject: string;
    let html: string;

    console.log({ email_action_type });
    // All email action types must be included here, as this hook completely replaces the default auth emails on Supabase
    // "enum": ["signup", "invite", "magiclink", "recovery", "email_change", "email"]
    // https://github.com/supabase/auth/blob/master/internal/mailer/template.go#L56-L66
    // https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-hooks/send-email-hook.mdx

    // Prepare React Email template based on email_action_type
    if (email_action_type === "recovery") {
      // AKA 'reset password' or 'forgot password'
      // Sent to (signed out) visitors who go through the 'forgot password' flow
      // Only triggers an email if the visitor enters an email address that matches that of a Peels account
      subject = "Reset your password on Peels";
      html = await renderAsync(
        React.createElement(ResetPasswordEmail, {
          // username: user["user_metadata"].username,
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        }),
        // { plainText: true },
      );
    } else if (email_action_type === "signup") {
      // Sent to new users after sign up, before they can do anything else
      // They have one hour to verify their account
      subject = "Verify your Peels account";
      html = await renderAsync(
        React.createElement(SignUpEmail, {
          email: user.email,
          firstName: user["user_metadata"].first_name, // Tried .username, no luck
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        }),
        // { plainText: true },
      );
    } else if (email_action_type === "email_change") {
      // Sent to existing users who change their email address
      // When these (signed in) submit a new email address, this email is sent (to the old/current address only)
      // They must confirm this new email address via a link in that email (again, to the old/current address)
      subject = "Confirm your email change on Peels";
      html = await renderAsync(
        React.createElement(EmailChangeEmail, {
          email: user.email,
          newEmail: user.email_change, // TODO: newEmail: new_email Not working
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        // { plainText: true },
      );
      // TODO: (email_action_type === "email") and/or (email_action_type === "email_change_new")
      // Poor/lack of documentation makes me unsure which of those to add, or if they are the same
      // My guess: "email_change_new" is the currently-disabled requirement to have the *new* email addresses confirmed (in addition to confirming via the old one in "email_change")
      // My guess: "email" is EmailOTPVerification, perhaps used when 2FA is enabled, as an additional OTP step to signing in
    } else if (email_action_type === "magiclink") {
      // Passwordless login via email for the user
      // Sent manually via Supabase dashboard
      subject = "Your magic link for Peels";
      html = await renderAsync(
        React.createElement(MagicLinkEmail, {
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        }),
        // { plainText: true },
      );
    } else if (email_action_type === "invite") {
      // Invite a new user
      // Sent manually via Supabase dashboard
      subject = "You’ve been invited to Peels";
      html = await renderAsync(
        React.createElement(InviteEmail, {
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        }),
        // { plainText: true },
      );
    } else if (email_action_type === "reauthentication") {
      // OTP code
      // Sent manually via Supabase dashboard
      subject = "Confirm reauthentication on Peels";
      html = await renderAsync(
        React.createElement(ReauthenticationEmail, {
          // lang: user["user_metadata"].lang,
          // supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token,
          // token_hash,
          // redirect_to,
          // email_action_type,
        }),
        // { plainText: true },
      );
    } else {
      // Error likely reached if an email_action_type has not been defined above
      // Every single one must be defined, as Supabase does not fall back to default auth emails
      throw new Error(
        `Email action type "${email_action_type}" has not yet been implemented`,
      );
    }

    // Send the email
    console.log(
      `Sending the email: ${subject}`,
    );
    const { error } = await resend.emails.send({
      from: "Peels <team@peels.app>",
      to: [user.email],
      subject,
      html,
      // plainText: true,
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
