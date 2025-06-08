import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import * as React from "npm:react";

interface ResetPasswordEmailProps {
  //   username: string;
  //   lang: string;
  //   token: string;
  supabase_url: string;
  email_action_type: string;
  redirect_to: string;
  token_hash: string;
}

// Translations could live here and be determined by the `lang` prop. See below for an example:
// https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/auth-hook-react-email-resend/_templates/sign-up.tsx

export const ResetPasswordEmail = ({
  //   username,
  //   lang,
  //   token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: ResetPasswordEmailProps) => {
  return (
    <EmailBody
      previewText="Sorry to hear you’re having trouble signing in to Peels. Here’s a link to reset your password."
      headingText="Reset your password"
      footerText="You’re receiving this email because someone—hopefully you—requested a password reset link for your Peels account."
    >
      <EmailParagraph>
        Sorry to hear you’re having trouble signing in to Peels. Tap the below
        link to reset your password:
      </EmailParagraph>

      <EmailButton
        href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
      >
        Reset password
      </EmailButton>

      <EmailParagraph>
        Just hit ‘reply’ if you run into any issues or have questions.
      </EmailParagraph>

      <EmailParagraph>
        Best,
        <br />
        Peels team
      </EmailParagraph>
    </EmailBody>
  );
};

export default ResetPasswordEmail;
