import NewsletterCallout from "@/components/NewsletterCallout";
import { styled } from "@pigment-css/react";

export default async function Layout({ children }) {
  return (
    <main>
      <article>{children}</article>
      <NewsletterCallout />
    </main>
  );
}
