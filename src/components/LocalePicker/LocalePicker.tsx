"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { setDisplayLocaleAction } from "@/app/actions";
import Select from "@/components/Select";
import Field from "@/components/Field";
import InputHint from "@/components/InputHint";
import { styled } from "@pigment-css/react";

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: "18rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  alignItems: "stretch",

  "@media (min-width: 768px)": {
    alignItems: "center",
  },
}));

type LocalePickerProps = {
  showHint?: boolean;
  compact?: boolean;
};

export default function LocalePicker({
  showHint = false,
  compact = false,
}: LocalePickerProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: Locale) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("locale", nextLocale);
      await setDisplayLocaleAction(formData);
      router.refresh();
    });
  };

  return (
    <Container style={compact ? { maxWidth: "11rem" } : undefined}>
      <Field>
        <Select
          variant={compact ? "compact" : "default"}
          name="locale"
          value={locale}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange(event.target.value as Locale)
          }
          disabled={isPending}
          aria-label={t("Common.language")}
        >
          {locales.map((optionLocale) => (
            <option key={optionLocale} value={optionLocale}>
              {localeLabels[optionLocale]}
            </option>
          ))}
        </Select>
        {showHint && (
          <InputHint variant="default">{t("Common.languageHint")}</InputHint>
        )}
      </Field>
    </Container>
  );
}
