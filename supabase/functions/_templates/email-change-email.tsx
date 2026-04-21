import EmailBody from "./components/EmailBody.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import { buildAuthConfirmUrl } from "./build-auth-confirm-url.ts";
import {
  getAuthEmailCopy,
  getAuthEmailSharedCopy,
  type SupportedLocale,
} from "../_shared/i18n.ts";
import * as React from "npm:react";

interface EmailChangeEmailProps {
  email: string;
  newEmail: string;
  locale: SupportedLocale;
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
  locale,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: EmailChangeEmailProps) => {
  const copy = getAuthEmailCopy(locale, "emailChange");
  const sharedCopy = getAuthEmailSharedCopy(locale);
  const confirmUrl = buildAuthConfirmUrl({
    emailActionType: email_action_type,
    locale,
    redirectTo: redirect_to,
    tokenHash: token_hash,
  });

  return (
    <EmailBody
      previewText={copy.preview}
      headingText={copy.heading}
      footerText={copy.footer}
    >
      <EmailParagraph>{copy.body}</EmailParagraph>

      <EmailButton href={confirmUrl}>{copy.button}</EmailButton>

      <EmailParagraph>
        {copy.reminder
          .replace("{email}", email)
          .replace("{newEmail}", newEmail)}
      </EmailParagraph>

      <EmailParagraph>{sharedCopy.replyHelp}</EmailParagraph>

      <EmailParagraph>
        {sharedCopy.signOff},
        <br />
        {sharedCopy.team}
      </EmailParagraph>
    </EmailBody>
  );
};

export default EmailChangeEmail;
