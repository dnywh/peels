import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function PromoKitPage() {
  redirect(siteConfig.links.share);
}
