import type { Viewport } from "next";
import type { ReactNode } from "react";

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
