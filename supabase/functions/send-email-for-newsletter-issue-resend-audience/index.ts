import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { NewsletterIssueOneEmail } from "../_templates/newsletter-issue-one-email.tsx";
// Temporarily required for rendering a text version
// The `react` email sending method does not yet supports text version
// https://github.com/resend/resend-node/pull/469
import { render } from "npm:@react-email/render";

const newsletterEmailAddress = Deno.env.get("NEWSLETTER_EMAIL_ADDRESS");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);
const newsletterAudienceId = "34497242-6af7-4862-a2e7-356eca18176b";

// This edge function handles the sending of newsletter issues to external folks
// who don't have a Peels account, such as council or external waste educators
const handler = async (_request: Request): Promise<Response> => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    console.log("Creating broadcast for Resend audience...");

    const { data: broadcast, error: broadcastError } = await resend.broadcasts
      .create({
        audienceId: newsletterAudienceId,
        from: `Danny from Peels <${newsletterEmailAddress}>`,
        subject: "Our first few months of Peels",
        react: NewsletterIssueOneEmail({
          recipientName: "{{{FIRST_NAME|there}}}",
          externalAudience: true,
        }),
        text: await render(
          NewsletterIssueOneEmail({
            recipientName: "there",
            externalAudience: true,
          }),
          { plainText: true },
        ),
        headers: {
          "List-Unsubscribe": "{{{RESEND_UNSUBSCRIBE_URL}}}",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

    if (broadcastError) {
      throw broadcastError;
    }

    console.log("Broadcast created, sending...");

    const { data: sendData, error: sendError } = await resend.broadcasts.send(
      broadcast.id,
    );

    if (sendError) {
      throw sendError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcastId: broadcast.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

serve(handler);
