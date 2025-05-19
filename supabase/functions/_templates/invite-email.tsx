import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import EmailLink from "./components/EmailLink.tsx";
import * as React from "npm:react";

interface InviteEmailProps {
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

export const InviteEmail = ({
  //   username,
  //   lang,
  //   token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: InviteEmailProps) => {
  const rootUrl = "https://www.peels.app";
  return (
    <EmailBody
      previewText="Lucky you! You’re invited to try out Peels."
      headingText="You’re invited"
      footerText="You’re receiving this email because someone at Peels invited you to join."
    >
      <EmailParagraph>
        Someone at <EmailLink href={rootUrl}>Peels</EmailLink> has invited you
        to try it out. Follow this link to accept the invite:
      </EmailParagraph>

      <EmailButton
        href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
      >
        Accept invite
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

export default InviteEmail;
