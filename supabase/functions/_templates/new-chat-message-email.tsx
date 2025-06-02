import { Heading, Text, Row } from "npm:@react-email/components";
import EmailBody from "./components/EmailBody.tsx";
import EmailAvatar from "./components/EmailAvatar.tsx";
import EmailButton from "./components/EmailButton.tsx";
import EmailParagraph from "./components/EmailParagraph.tsx";
import EmailLink from "./components/EmailLink.tsx";
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
  const siteUrl = "https://www.peels.app";
  return (
    <EmailBody
      logoUnread={true}
      previewText={`Hi ${recipientName}, you’ve received a new message from ${senderName}. Visit Peels to see what they wrote.`}
      headingText="New message on Peels"
      footerText={
        recipientRole === "owner" ? (
          <>
            Don’t want emails like this?{" "}
            <EmailLink href={`${siteUrl}/profile/listings/${listingSlug}`}>
              Manage
            </EmailLink>{" "}
            your listing to hide or remove it from Peels.
          </>
        ) : (
          <>
            You’re receiving this email because you originally reached out to{" "}
            {senderName} on{" "}
            <EmailLink href={`${siteUrl}/profile`}>Peels</EmailLink>.
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

      <Row style={avatarSubtitleRow}>
        <Heading as="h2" style={senderHeading}>
          {senderName}
        </Heading>

        {recipientRole === "initiator" && (
          <Text style={listingByline}>
            {listingName ? listingName : `Resident of ${listingAreaName}`}
          </Text>
        )}
      </Row>

      <EmailParagraph>
        Hi {recipientName}, you’ve received a new message from {senderName}.
        Check it out on Peels:
      </EmailParagraph>

      <EmailButton href={`${siteUrl}/chats/${threadId}`}>
        View message
      </EmailButton>

      <EmailParagraph>
        Best,
        <br />
        Peels team
      </EmailParagraph>
    </EmailBody>
  );
};

export default NewChatMessageEmail;

const avatarSubtitleRow = {
  margin: "4px auto 32px auto",
};

const senderHeading = {
  fontSize: "24px",
  lineHeight: "110%",
  letterSpacing: "-0.015em",
  margin: "12px auto 0",
  textAlign: "center" as const,
  textWrap: "balance" as const,
  color: assignments.colors.text.brand.primary,
};
const listingByline = {
  fontSize: "14px",
  lineHeight: "110%",
  letterSpacing: "-0.015em",
  margin: "6px auto 0",
  textAlign: "center" as const,
  textWrap: "balance" as const,
  color: assignments.colors.text.ui.quaternary,
};
