"use client";

import EncodedEmailLink from "@/components/EncodedEmailLink";
import { siteConfig } from "@/config/site";
import { sanitiseSupportPageUrl, type SupportScope } from "@/lib/supportError";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type SupportErrorMessageProps = {
  message: string;
  pageUrl?: string;
  scope: SupportScope;
  supportReference?: string;
  timestamp?: string;
};

export default function SupportErrorMessage({
  message,
  pageUrl,
  scope,
  supportReference,
  timestamp,
}: SupportErrorMessageProps) {
  const t = useTranslations("Errors");
  const [details, setDetails] = useState<{
    pageUrl: string;
    timestamp: string;
  } | null>(
    pageUrl && timestamp
      ? {
          pageUrl: sanitiseSupportPageUrl(pageUrl),
          timestamp,
        }
      : null
  );

  useEffect(() => {
    setDetails({
      pageUrl: sanitiseSupportPageUrl(pageUrl ?? window.location.href),
      timestamp: timestamp ?? new Date().toISOString(),
    });
  }, [pageUrl, timestamp]);

  const area = t("supportArea", { scope });
  const bodyKey = supportReference
    ? "supportEmailBody"
    : "supportEmailBodyWithoutReference";

  return (
    <>
      {message.endsWith(".") ? message : `${message}.`}{" "}
      {t.rich("supportContact", {
        contact: (chunks) =>
          details ? (
            <EncodedEmailLink
              as="plain"
              address={siteConfig.encodedEmail.team}
              body={t(bodyKey, {
                area,
                pageUrl: details.pageUrl,
                reference: supportReference ?? "",
                timestamp: details.timestamp,
              })}
              subject={t("supportEmailSubject", { area })}
            >
              {chunks}
            </EncodedEmailLink>
          ) : (
            chunks
          ),
      })}
    </>
  );
}
