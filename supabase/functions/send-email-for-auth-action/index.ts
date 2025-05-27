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

  const timingStart = Date.now(); // Begin timer for timeout debugging

  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        new_email: string;
        user_metadata: {
          first_name: string; // Only reliable upon signup, as user can later outdate this value (via editing their name on profiles table)
          // lang: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new: string;
        token_hash_new: string;
        // Tests
      };
    };

    // Prepare empty variables to be filled based on email_action_type
    let emailAddress: string;
    let subject: string;
    let html: string;
    let text: string;

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
      emailAddress = user.email;
      subject = "Reset your password on Peels";
      html = await renderAsync(
        React.createElement(ResetPasswordEmail, {
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      );
      text = await renderAsync(
        React.createElement(ResetPasswordEmail, {
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        { plainText: true }
      );
    } else if (email_action_type === "signup") {
      // Sent to new users after sign up, before they can do anything else
      // They have one hour to verify their account
      emailAddress = user.email;
      subject = "Verify your Peels account";

      // Timeout debugging
      console.log("[signup] Start renderAsync", timingStart);

      html = await renderAsync(
        React.createElement(SignUpEmail, {
          email: user.email,
          firstName: user["user_metadata"].first_name, // Replaced .username. Only reliable for signup purposes, see above
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      );
      // Timeout debugging
      console.log(
        "[signup] After renderAsync HTML",
        Date.now() - timingStart,
        "ms"
      );

      text = await renderAsync(
        React.createElement(SignUpEmail, {
          email: user.email,
          firstName: user["user_metadata"].first_name,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        { plainText: true }
      );
      // Timeout debugging
      console.log(
        "[signup] After renderAsync TEXT",
        Date.now() - timingStart,
        "ms"
      );

      // Timeout debugging
      const resendStart = Date.now();
      console.log(
        "[signup] Before Resend send",
        resendStart - timingStart,
        "ms since start"
      );
    } else if (email_action_type === "email_change") {
      // Sent to existing users who change their email address
      // When these (signed in) submit a new email address, this email is sent to the *new* address only
      // They must confirm this new email address via a link in that email (again, sent only to the new address)
      emailAddress = user.new_email; // Since we want to send to the *new* email address
      subject = "Confirm your email change on Peels";
      html = await renderAsync(
        React.createElement(EmailChangeEmail, {
          email: user.email, // Existing email
          newEmail: user.new_email, // New email
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        })
      );
      text = await renderAsync(
        React.createElement(EmailChangeEmail, {
          email: user.email,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        { plainText: true }
      );
    } else if (email_action_type === "magiclink") {
      // Passwordless login via email for the user
      // Sent manually via Supabase dashboard
      emailAddress = user.email;
      subject = "Your magic link for Peels";
      html = await renderAsync(
        React.createElement(MagicLinkEmail, {
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      );
      text = await renderAsync(
        React.createElement(MagicLinkEmail, {
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        { plainText: true }
      );
    } else if (email_action_type === "invite") {
      // Invite a new user
      // Sent manually via Supabase dashboard
      emailAddress = user.email;
      subject = "You’ve been invited to Peels";
      html = await renderAsync(
        React.createElement(InviteEmail, {
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      );
      text = await renderAsync(
        React.createElement(InviteEmail, {
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
        { plainText: true }
      );
    } else if (email_action_type === "reauthentication") {
      // OTP code
      // Sent manually via Supabase dashboard
      emailAddress = user.email;
      subject = "Confirm reauthentication on Peels";
      html = await renderAsync(
        React.createElement(ReauthenticationEmail, {
          token,
        })
      );
      text = await renderAsync(
        React.createElement(ReauthenticationEmail, {
          token,
        }),
        { plainText: true }
      );
    } else {
      // This error likely reached if an email_action_type has not been defined above
      // Every single one must be defined, as Supabase does not fall back to default auth emails
      // Still TODO: (email_action_type === "email") and/or (email_action_type === "email_change_new")
      // Poor/lack of documentation makes me unsure which of those to add, or if they are the same
      // My guess: "email_change_new" is the currently-disabled requirement to have the *old* email addresses confirmed (in addition to confirming only via the new one in "email_change")
      // My guess: "email" is EmailOTPVerification, perhaps used when 2FA is enabled, as an additional OTP step to signing in
      throw new Error(
        `Email action type "${email_action_type}" has not yet been implemented`
      );
    }

    // Send the email
    const resendSendStart = Date.now();
    // Timeout debugging
    console.log(
      "[global] Before resend.emails.send",
      resendSendStart - timingStart,
      "ms since function start"
    );
    const { error } = await resend.emails.send({
      from: "Peels <team@peels.app>",
      to: [emailAddress],
      subject,
      html,
      text,
    });
    const resendSendEnd = Date.now();
    // Timeout debugging
    console.log(
      "[global] After resend.emails.send",
      resendSendEnd - resendSendStart,
      "ms for Resend send"
    );
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
      }
    );
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
