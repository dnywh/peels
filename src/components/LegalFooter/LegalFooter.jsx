import { siteConfig } from "@/config/site";
import Link from "next/link";

const currentYear = new Date().getFullYear();

function LegalFooter() {
  return (
    <footer>
      <p>
        © {currentYear} {siteConfig.name}
      </p>
      <Link href={siteConfig.links.terms}>Terms</Link>
      <Link href={siteConfig.links.privacy}>Privacy</Link>
    </footer>
  );
}

export default LegalFooter;
