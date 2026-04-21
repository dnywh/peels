import { CodeInline } from "npm:@react-email/components";
import EmailBody from "./components/EmailBody.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import {
  getAuthEmailCopy,
  getAuthEmailSharedCopy,
  type SupportedLocale,
} from "../_shared/i18n.ts";
import * as React from "npm:react";

interface ReauthenticationEmailProps {
  locale: SupportedLocale;
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
  locale,
  //   username,
  //   lang,
  token,
  // supabase_url,
  // email_action_type,
  // redirect_to,
  // token_hash,
}: ReauthenticationEmailProps) => {
  const copy = getAuthEmailCopy(locale, "reauthentication");
  const sharedCopy = getAuthEmailSharedCopy(locale);
  return (
    <EmailBody
      previewText={copy.preview}
      headingText={copy.heading}
      footerText={copy.footer}
    >
      <EmailParagraph>{copy.body}</EmailParagraph>

      <EmailParagraph>
        <CodeInline>{token}</CodeInline>
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

export default ReauthenticationEmail;
