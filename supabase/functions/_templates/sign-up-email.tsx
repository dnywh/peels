import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import { buildAuthConfirmUrl } from "./build-auth-confirm-url.ts";
import * as React from "npm:react";

interface SignUpEmailProps {
  email: string;
  firstName: string;
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
  firstName,
  //   lang,
  //   token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: SignUpEmailProps) => {
  const confirmUrl = buildAuthConfirmUrl({
    email,
    emailActionType: email_action_type,
    redirectTo: redirect_to,
    tokenHash: token_hash,
  });

  return (
    <EmailBody
      previewText={`Let's get you composting, ${firstName}! Here’s a link to verify your Peels account.`}
      headingText="Welcome to Peels"
      footerText="You’re receiving this email because you signed up for a Peels account."
    >
      <EmailParagraph>
        We’re so glad you’re here, {firstName}! Follow this link to verify your
        account:
      </EmailParagraph>

      <EmailButton
        href={confirmUrl}
      >
        Verify your Peels account
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
