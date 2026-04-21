import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { NewsletterIssueEmail } from "../_templates/newsletter-issue-email.tsx";
import {
  getNewsletterAudienceConfigs,
  getNewsletterEmailSubject,
} from "../_shared/newsletter.ts";
// Temporarily required for rendering a text version
// The `react` email sending method does not yet supports text version
// https://github.com/resend/resend-node/pull/469
import { render } from "npm:@react-email/render";

const newsletterEmailAddress = Deno.env.get("NEWSLETTER_EMAIL_ADDRESS");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

// This edge function handles the sending of newsletter issues to external folks
// who don't have a Peels account, such as council or external waste educators
const handler = async (_request: Request): Promise<Response> => {
  try {
    if (!RESEND_API_KEY || !newsletterEmailAddress) {
      throw new Error("Missing required environment variables");
    }

    console.log("Creating broadcast for Resend audience...");

    const audienceConfigs = getNewsletterAudienceConfigs();

    if (audienceConfigs.length === 0) {
      throw new Error("No newsletter audiences configured");
    }

    const broadcasts = [];

    for (const { locale, audienceId } of audienceConfigs) {
      const email = NewsletterIssueEmail({
        locale,
        recipientName: "{{{FIRST_NAME|there}}}",
        externalAudience: true,
      });

      const { data: broadcast, error: broadcastError } =
        await resend.broadcasts.create({
          audienceId,
          from: `Danny from Peels <${newsletterEmailAddress}>`,
          subject: getNewsletterEmailSubject(locale),
          react: email,
          text: await render(email, { plainText: true }),
          headers: {
            "List-Unsubscribe": "{{{RESEND_UNSUBSCRIBE_URL}}}",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

      if (broadcastError) {
        throw broadcastError;
      }

      console.log(`Broadcast created for locale ${locale}, sending...`);

      const { data: sendData, error: sendError } = await resend.broadcasts.send(
        broadcast.id
      );

      if (sendError) {
        throw sendError;
      }

      broadcasts.push({
        locale,
        audienceId,
        broadcastId: broadcast.id,
        sendData,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcasts,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
