import * as React from "npm:react";
import { ReactNode } from "npm:react";
import {
  Img as ReactEmailImg,
  type ImgProps,
  Section,
  Container,
  Row,
} from "npm:@react-email/components";
import EmailCaption from "./EmailCaption.tsx";
import { assignments } from "../../_shared/tokens.js";

interface EmailImageProps extends ImgProps {
  src: string;
  alt: string;
  width?: number | string;
  height: number;
  margin?: boolean;
  caption?: ReactNode;
}

const EmailImage = ({
  src,
  alt,
  caption,
  margin = true,
  ...ImgProps
}: EmailImageProps) => (
  <Section style={margin ? imgSectionWithMargin : undefined}>
    <Container style={imgContainer}>
      <ReactEmailImg src={src} alt={alt} {...ImgProps} style={img} />
    </Container>
    {caption && <EmailCaption>{caption}</EmailCaption>}
  </Section>
);

export default EmailImage;

// For images that are displayed by themselves, i.e. not in a grid
const imgSectionWithMargin = {
  margin: "40px 0",
};

const imgContainer = {
  boxShadow: `0 0 0 2px ${assignments.colors.border.elevated} inset`, // Matches gallery, Apple Mail only
  borderRadius: 9, // 1px more than img
  border: `1px solid ${assignments.colors.border.elevated}`,
};

const img = {
  margin: 0,
  mixBlendMode: "multiply", // So boxShadow on parent is visible in email clients that support it
  width: "100%",
  borderRadius: 8, // Should ideally match theme.corners.thumbnail (6px),
  objectFit: "cover",
  // border: "1px solid rgba(0, 0, 0, 0.12)",
};
