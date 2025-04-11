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
        user_metadata: {
          username: string; // Only reliable upon signup, as user can later outdate this value (via editing their name on profiles table)
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

    const isRecovery = email_action_type === "recovery";
    console.log({ email_action_type }, "recovery", isRecovery);

    // Prepare React Email template based on email_action_type
    if (email_action_type === "recovery") { // or is it 'reset_password'?
      console.log(
        "Email action type is recovery, preparing ResetPasswordEmail...",
      );
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
      );
    } else if (email_action_type === "signup") {
      subject = "Verify your Peels account";
      html = await renderAsync(
        React.createElement(SignUpEmail, {
          email: user.email,
          username: user["user_metadata"].username,
          // lang: user["user_metadata"].lang,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          // token,
          token_hash,
          redirect_to,
          email_action_type,
        }),
      );
    } else if (email_action_type === "email_change") {
      subject = "Confirm your email change on Peels";
      html = await renderAsync(
        React.createElement(EmailChangeEmail, {
          email: user.email,
          newEmail: new_email,
          supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
          token_hash,
          redirect_to,
          email_action_type,
        }),
      );
    } else {
      // Probably another email_action_type:
      // "enum": ["signup", "invite", "magiclink", "recovery", "email_change", "email"]
      // `login` (magic link)?
      // `recovery` (signup)?
      // https://github.com/supabase/auth/blob/master/internal/mailer/template.go#L56-L66
      // https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-hooks/send-email-hook.mdx
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
      // TODO: plain text too?
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
