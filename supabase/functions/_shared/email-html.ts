import { render } from "npm:@react-email/render";
import type { ReactElement } from "npm:react";
import { encodeEmailHtmlCharacterReferences } from "./email-character-references.ts";

export { encodeEmailHtmlCharacterReferences };

export const renderEmailHtml = async (email: ReactElement) =>
  encodeEmailHtmlCharacterReferences(await render(email));

export const renderEmailText = (email: ReactElement) =>
  render(email, {
    plainText: true,
  });
