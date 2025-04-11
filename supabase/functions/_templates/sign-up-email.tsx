import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import * as React from "npm:react";

interface SignUpEmailProps {
  email: string;
  username: string;
  //   lang: string;
  //   token: string;
  supabase_url: string;
  email_action_type: string;
  redirect_to: string;
  token_hash: string;
}

// Translations could live here and be determined by the `lang` prop. See below for an example:
// https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/auth-hook-react-email-resend/_templates/sign-up.tsx

export const SignUpEmail = ({
  email,
  username,
  //   lang,
  //   token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: SignUpEmailProps) => {
  return (
    <EmailBody
      previewText={`Let’s get you composting, ${username}! Here’s a link to verify your Peels account.`}
      headingText="Welcome to Peels"
      footerText="You’re receiving this email because you signed up for a Peels account."
    >
      <EmailParagraph>
        We’re so glad you’re here, {username}! Follow this link to verify your
        account:
      </EmailParagraph>

      <EmailButton
        // Append `&email=user@email.com` to standard {{ .ConfirmationURL }}
        href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}&email=${email}`}
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

export default SignUpEmail;
