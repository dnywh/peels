import { permanentRedirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function PromoKitPage() {
  permanentRedirect(siteConfig.links.share);
}
