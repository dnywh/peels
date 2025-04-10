import { Heading, Text } from "npm:@react-email/components";
import BasicEmail from "./components/BasicEmail.tsx";
import EmailAvatar from "./components/EmailAvatar.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import EmailFooterLink from "./components/EmailFooterLink.tsx";
import { assignments } from "../_shared/tokens.js";
import * as React from "npm:react";

interface NewChatMessageEmailProps {
  senderName: string;
  recipientName: string;
  // messageContent: string;
  threadId: string;
  listingSlug: string;
  listingAreaName: string;
  recipientRole: string;
  avatarMajorUrl?: string;
  avatarMajorBucket?: string;
  avatarMinorUrl?: string;
  listingName?: string;
  listingType?: string;
}

export const NewChatMessageEmail = ({
  senderName,
  recipientName,
  // messageContent,
  threadId,
  listingSlug,
  listingAreaName,
  recipientRole,
  avatarMajorUrl,
  avatarMajorBucket,
  avatarMinorUrl,
  listingName,
  listingType,
}: NewChatMessageEmailProps) => {
  const rootUrl = "https://www.peels.app";
  return (
    <BasicEmail
      logoUnread={true}
      previewText={`Hi ${recipientName}, you’ve received a new message from ${senderName}. Visit Peels to see what they wrote.`}
      headingText="New message on Peels"
      footerText={
        recipientRole === "owner" ? (
          <>
            Don’t want emails like this?{" "}
            <EmailFooterLink
              href={`${rootUrl}/profile/listings/${listingSlug}`}
            >
              Manage
            </EmailFooterLink>{" "}
            your listing to hide or remove it from Peels.
          </>
        ) : (
          <>
            You’ve received this email because you originally reached out to{" "}
            {senderName} on{" "}
            <EmailFooterLink href={`${rootUrl}/profile`}>Peels</EmailFooterLink>
            .
          </>
        )
      }
    >
      <EmailAvatar
        avatarMajorUrl={avatarMajorUrl}
        avatarMajorBucket={avatarMajorBucket}
        avatarMinorUrl={avatarMinorUrl ? avatarMinorUrl : undefined}
        listingType={listingType ? listingType : undefined}
      />
      <Heading as="h2" style={senderHeading}>
        {senderName}
      </Heading>

      <Text style={senderByline}>
        {recipientRole === "owner"
          ? "Keen composter"
          : listingName
            ? listingName
            : `Resident of ${listingAreaName}`}
      </Text>

      <Heading as="h2" style={senderHeading}>
        {senderName}
      </Heading>
      <Text style={senderByline}>Keen composter</Text>

      <EmailParagraph>
        Hi {recipientName}, you’ve received a new message from {senderName}.
        Check it out on Peels:
      </EmailParagraph>

      <EmailButton href={`${rootUrl}/chats/${threadId}`}>
        View message
      </EmailButton>

      <EmailParagraph>
        Best,
        <br />
        Peels team
      </EmailParagraph>
    </BasicEmail>
  );
};

export default NewChatMessageEmail;

const senderHeading = {
  fontSize: "24px",
  lineHeight: "110%",
  letterSpacing: "-0.015em",
  margin: "12px auto 0",
  textAlign: "center" as const,
  textWrap: "balance" as const,
  color: assignments.colors.text.brand.primary,
};
const senderByline = {
  fontSize: "14px",
  lineHeight: "110%",
  letterSpacing: "-0.015em",
  margin: "6px auto 32px",
  textAlign: "center" as const,
  textWrap: "balance" as const,
  color: assignments.colors.text.ui.quaternary,
};
