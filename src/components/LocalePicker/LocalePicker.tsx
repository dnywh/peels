"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { setDisplayLocaleAction } from "@/app/actions";
import Select from "@/components/Select";
import Field from "@/components/Field";
import InputHint from "@/components/InputHint";
import { styled } from "next-yak";

const Container = styled.div`
  width: 100%;
  max-width: 18rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: stretch;
  @media (min-width: 768px) {
    align-items: center;
  }
`;

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
  const [error, setError] = useState<string | null>(null);

  const handleChange = (nextLocale: Locale) => {
    startTransition(() => {
      void (async () => {
        setError(null);

        try {
          const formData = new FormData();
          formData.set("locale", nextLocale);
          const result = await setDisplayLocaleAction(formData);

          if (result?.error) {
            setError(t("Errors.genericLater"));
            return;
          }

          router.refresh();
        } catch (error) {
          console.error("Error updating display locale:", error);
          setError(t("Errors.genericLater"));
        }
      })();
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
        {error ? (
          <InputHint variant="error">{error}</InputHint>
        ) : showHint ? (
          <InputHint variant="default">{t("Common.languageHint")}</InputHint>
        ) : null}
      </Field>
    </Container>
  );
}
