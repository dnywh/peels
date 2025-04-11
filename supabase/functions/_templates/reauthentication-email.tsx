import { CodeInline } from "npm:@react-email/components";
import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import * as React from "npm:react";

interface ReauthenticationEmailProps {
  //   username: string;
  //   lang: string;
  token: string;
  // supabase_url: string;
  // email_action_type: string;
  // redirect_to: string;
  // token_hash: string;
}

// Translations could live here and be determined by the `lang` prop. See below for an example:
// https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/auth-hook-react-email-resend/_templates/sign-up.tsx

export const ReauthenticationEmail = ({
  //   username,
  //   lang,
  token,
  // supabase_url,
  // email_action_type,
  // redirect_to,
  // token_hash,
}: ReauthenticationEmailProps) => {
  return (
    <EmailBody
      previewText="Here’s your code for Peels."
      headingText="Your reauthentication code"
      footerText="You’re receiving this email because you requested help a reauthentication code for Peels."
    >
      <EmailParagraph>Enter the following code on Peels:</EmailParagraph>

      <EmailParagraph>
        <CodeInline>{token}</CodeInline>
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

export default ReauthenticationEmail;
