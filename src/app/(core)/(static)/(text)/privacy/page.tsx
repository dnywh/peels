import Hyperlink from "@/components/Hyperlink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function Privacy() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p>
        Peels is currently <Hyperlink href="/preview">invite only</Hyperlink>.
        Our privacy policy will be added here soon.
      </p>
    </>
  );
}
