import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div>
      <h2>404</h2>
      <p>{t("NotFound.body")}</p>
      <Link href="/">{t("Actions.home")}</Link>
    </div>
  );
}
