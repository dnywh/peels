import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getFirstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function Contact({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const address = getFirstValue(params?.address);
  const via = getFirstValue(params?.via);

  if (address) query.set("address", address);
  if (via) query.set("via", via);

  const queryString = query.toString();

  redirect(
    `${siteConfig.links.help}${queryString ? `?${queryString}` : ""}#contact`
  );
}
