import { css } from "next-yak";

import { theme } from "@/styles/theme.yak";

export const sharedMediaFrameRadius = "0.375rem";
export const sharedMediaFrameBorderWidth = "2px";

export const sharedMediaFrameShapeStyles = css`
  border-radius: ${sharedMediaFrameRadius};
  overflow: hidden;
`;

export const sharedMediaFrameBorderStyles = css`
  border: ${sharedMediaFrameBorderWidth} solid ${theme.colors.border.elevated};
`;

export const sharedMediaFrameStyles = css`
  ${sharedMediaFrameShapeStyles}
  ${sharedMediaFrameBorderStyles}
`;

export const sharedMediaFrameImageStyles = css`
  background-color: ${theme.colors.background.sunk};
  display: block;
`;
