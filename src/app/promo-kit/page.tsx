import { redirect } from "next/navigation";
import { getPromoKitUrl } from "@/utils/storage";

export default function PromoKitPage() {
  redirect(getPromoKitUrl());
}
