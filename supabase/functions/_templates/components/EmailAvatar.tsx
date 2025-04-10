import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Row, Column, Img } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

interface EmailAvatarProps {
  avatarMajorUrl?: string;
  avatarMajorBucket?: string;
  avatarMinorUrl?: string;
  listingType?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
// const assetUrl = Deno.env.get("STATIC_ASSET_URL");
const storageUrl = `${supabaseUrl}/storage/v1/object/public/`;

const EmailAvatar = ({
  avatarMajorUrl,
  avatarMajorBucket,
  avatarMinorUrl,
  listingType,
}: EmailAvatarProps) => {
  const avatarMajorFullUrl = avatarMajorUrl
    ? `${storageUrl}/${avatarMajorBucket}/${avatarMajorUrl}`
    : `${storageUrl}/static/avatars/${!listingType || listingType === "residential" ? "profile" : listingType}.png`;

  return (
    <Row style={avatarRow}>
      {avatarMinorUrl ? (
        <>
          <Column style={twoUpColumn}>
            <Img
              src={avatarMajorFullUrl}
              width="64"
              height="64"
              alt="The avatar for this Peels listing"
              style={twoUpImgLeft}
            />
          </Column>
          <Column style={twoUpColumn}>
            <Img
              src={`${storageUrl}/avatars/${avatarMinorUrl}`}
              width="40"
              height="40"
              alt="The avatar for this Peels member"
              style={twoUpImgRight}
            />
          </Column>
        </>
      ) : (
        <Column>
          <Img
            src={avatarMajorFullUrl}
            width="64"
            height="64"
            alt="The avatar for this Peels listing"
            style={oneUpImg}
          />
        </Column>
      )}
    </Row>
  );
};
export default EmailAvatar;

const avatarRow = {
  marginTop: "28px",
};

const twoUpColumn = {
  width: "50%",
};

const twoUpImgLeft = {
  margin: "-20px -32px auto auto",
  borderRadius: "12px",
  border: "4px solid #f4f4f4", // Slightly offwhite because most mail clients don't support box-shadow
  transform: "rotate(-3deg)", // Apple Mail only
  boxShadow: `3px 3px 0 0 rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)`, // Apple Mail only
};
const twoUpImgRight = {
  margin: "20px auto auto -6px",
  borderRadius: "10px",
  border: "4px solid #f4f4f4", // Slightly offwhite because most mail clients don't support box-shadow
  transform: "rotate(3deg)", // Apple Mail only
  boxShadow: `3px 3px 0 0 rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)`, // Apple Mail only
};

const oneUpImg = {
  margin: "auto",
  borderRadius: "12px",
  border: "4px solid #f4f4f4", // Slightly offwhite because most mail clients don't support box-shadow
  transform: "rotate(2deg)", // Apple Mail only
  boxShadow: `3px 3px 0 0 rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)`, // Apple Mail only
};
