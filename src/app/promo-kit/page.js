import { redirect } from "next/navigation";
import { getPromoKitUrl } from "@/utils/storage";

export default function PromoKit() {
  redirect(getPromoKitUrl());
}
