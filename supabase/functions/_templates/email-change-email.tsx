import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import * as React from "npm:react";

interface EmailChangeEmailProps {
  email: string;
  newEmail: string;
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

export const EmailChangeEmail = ({
  email,
  newEmail,
  //   username,
  //   lang,
  //   token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: EmailChangeEmailProps) => {
  return (
    <EmailBody
      previewText="Here’s a link to change the email address you use on Peels."
      headingText="Confirm your email change"
      footerText="You’re receiving this email because you requested an email address change on Peels."
    >
      <EmailParagraph>
        Follow this link to confirm your new email on Peels:
      </EmailParagraph>

      <EmailButton
        href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
      >
        Change email address
      </EmailButton>

      <EmailParagraph>
        As a reminder, you’re changing from {email} to {newEmail}.
      </EmailParagraph>

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

export default EmailChangeEmail;
