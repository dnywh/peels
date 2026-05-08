import type { Metadata } from "next";

export const noindexFollowMetadata = {
  robots: {
    index: false,
    follow: true,
  },
} satisfies Metadata;
