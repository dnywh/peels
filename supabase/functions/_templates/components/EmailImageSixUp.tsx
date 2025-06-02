import * as React from "npm:react";
import { ReactNode } from "npm:react";
import {
  Img as ReactEmailImg,
  type ImgProps,
  Container,
  Row,
  Column,
  Text,
} from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

interface EmailImageSixUpProps extends ImgProps {
  src: string;
  alt: string;
  width?: number | string;
  height: number;
  caption?: ReactNode;
}

const EmailImageSixUp = ({
  src,
  alt,
  caption,
  ...ImgProps
}: EmailImageSixUpProps) => (
  <>
    <Row style={{ marginTop: 16 }}>
      <Column style={gridImgColLeft}>
        <Container style={imgContainer}>
          <ReactEmailImg
            alt="Stagg Electric Kettle"
            height={288}
            src="https://react.email/static/stagg-eletric-kettle.jpg"
            style={img}
          />
        </Container>
      </Column>
      <Column style={gridImgColRight}>
        <Container style={imgContainer}>
          <ReactEmailImg
            alt="Ode Grinder"
            height={288}
            src="https://react.email/static/ode-grinder.jpg"
            style={img}
          />
        </Container>
      </Column>
    </Row>
    <Text>More text here.</Text>
    <Row style={{ marginTop: 16 }}>
      <Column style={gridImgColLeft}>
        <Container style={imgContainer}>
          <ReactEmailImg
            alt="Atmos Vacuum Canister"
            height={144}
            src="https://react.email/static/atmos-vacuum-canister.jpg"
            style={img}
          />
        </Container>
      </Column>
      <Column style={gridImgColRight}>
        <Container style={imgContainer}>
          <ReactEmailImg
            alt="Clyde Electric Kettle"
            height={144}
            src="https://react.email/static/clyde-electric-kettle.jpg"
            style={img}
          />
        </Container>
      </Column>
    </Row>
  </>
);

export default EmailImageSixUp;

const imgContainer = {
  margin: "40px 0",
  boxShadow: `0 0 0 2px ${assignments.colors.border.elevated} inset`, // Matches gallery, Apple Mail only
  borderRadius: 9, // 1px more than img
  border: `1px solid ${assignments.colors.border.elevated}`,
};

const img = {
  margin: 0,
  mixBlendMode: "multiply", // So boxShadow on parent is visible in email clients that support it
  width: "100%",
  borderRadius: 8,
  objectFit: "cover",
  // border: "1px solid rgba(0, 0, 0, 0.12)",
};

const captionStyle = {
  margin: 0,
  fontSize: 13,
  lineHeight: "145%",
  textAlign: "center",
  color: assignments.colors.text.tertiary,
  textWrap: "balance",
};
