import { permanentRedirect } from "next/navigation";

import { siteConfig } from "@/config/site";

type SupportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getFirstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function Support({ searchParams }: SupportPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const address = getFirstValue(params?.address);

  if (address) query.set("address", address);

  const queryString = query.toString();

  permanentRedirect(
    `${siteConfig.links.help}${queryString ? `?${queryString}` : ""}`
  );
}
