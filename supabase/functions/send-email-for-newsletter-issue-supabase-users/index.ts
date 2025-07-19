import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { NewsletterIssueOneEmail } from "../_templates/newsletter-issue-one-email.tsx";
// Temporarily required for rendering a text version
// The `react` email sending method does not yet supports text version
// https://github.com/resend/resend-node/pull/469
import { render } from "npm:@react-email/render";

// Look up required API keys from Supabase secrets
const newsletterEmailAddress = Deno.env.get("NEWSLETTER_EMAIL_ADDRESS");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

// This edge function handles the sending of newsletter issues to Peels users
// who opted-in to the newsletter after sign-up or later on in their profile
const handler = async (_request: Request): Promise<Response> => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get all profiles that are opted-in to the newsletter
    // And have not yet been emailed this issue
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .eq("is_newsletter_subscribed", true)
      .eq("emailed_latest_issue", false)
      .limit(60); // Limit to around 50 (half a day's limit)

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles.length} profiles to process`);

    // Process each profile
    const results = [];
    for (const profile of profiles) {
      try {
        // Get user email from auth
        const { data: userData, error: userError } =
          await supabase.auth.admin.getUserById(profile.id);

        if (userError) {
          console.error(
            `Failed to fetch user data for ${profile.id}:`,
            userError
          );
          results.push({
            userId: profile.id,
            success: false,
            error: userError.message,
          });
          continue;
        }

        const userEmail = userData?.user?.email;
        if (!userEmail) {
          console.error(`No email found for user ${profile.id}`);
          results.push({
            userId: profile.id,
            success: false,
            error: "No email found",
          });
          continue;
        }

        console.log(`Processing: ${profile.first_name} (${userEmail})`);

        // Add delay to respect rate limit (at most 2 per second)
        await new Promise((resolve) => setTimeout(resolve, 750));

        // TEST MODE: Only email yourself
        // const testEmail = "you@example.com";
        // console.log(
        //   `TEST MODE: Would email ${userEmail}, but sending to ${testEmail} instead`,
        // );

        const { data, error } = await resend.emails.send({
          from: `Danny from Peels <${newsletterEmailAddress}>`,
          // to: [testEmail], // Send to yourself instead of userEmail
          to: [userEmail],
          subject: "Our first few months of Peels",
          react: NewsletterIssueOneEmail({
            recipientName: profile.first_name || "there",
            externalAudience: false,
          }),
          text: await render(
            NewsletterIssueOneEmail({
              recipientName: profile.first_name || "there",
              externalAudience: false,
            }),
            {
              plainText: true,
            }
          ),
          headers: {
            "List-Unsubscribe": "<https://www.peels.app/profile>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click", // Required for deliverability, even if irrelevant
          },
        });

        if (error) {
          console.error(`Failed to send email to ${userEmail}:`, error);
          results.push({
            userId: profile.id,
            email: userEmail,
            success: false,
            error: error.message,
          });
          continue;
        }

        // Only update the flag if email was successful
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ emailed_latest_issue: true })
          .eq("id", profile.id);

        if (updateError) {
          console.error(
            `Failed to update flag for ${profile.id}:`,
            updateError
          );
          results.push({
            userId: profile.id,
            email: userEmail,
            success: false,
            error: updateError.message,
          });
          continue;
        }

        results.push({
          userId: profile.id,
          email: userEmail,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing profile ${profile.id}:`, error);
        results.push({
          userId: profile.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
