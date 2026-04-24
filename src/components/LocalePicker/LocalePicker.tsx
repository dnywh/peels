"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  const handleChange = async (nextLocale: Locale) => {
    if (isPending) {
      return;
    }

    setSelectedLocale(nextLocale);
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("locale", nextLocale);
      const result = await setDisplayLocaleAction(formData);

      if (!result.success || result.error) {
        setSelectedLocale(locale);
        setError(result.error || t("Errors.genericLater"));
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating display locale:", error);
      setSelectedLocale(locale);
      setError(t("Errors.genericLater"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Container style={compact ? { maxWidth: "11rem" } : undefined}>
      <Field>
        <Select
          variant={compact ? "compact" : "default"}
          name="locale"
          value={selectedLocale}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            void handleChange(event.target.value as Locale)
          }
          disabled={isPending}
          aria-busy={isPending || undefined}
          aria-label={t("Common.language")}
          data-testid="locale-picker-select"
        >
          {locales.map((optionLocale) => (
            <option key={optionLocale} value={optionLocale}>
              {localeLabels[optionLocale]}
            </option>
          ))}
        </Select>
        {error ? (
          <InputHint variant="error" data-testid="locale-picker-message">
            {error}
          </InputHint>
        ) : showHint ? (
          <InputHint variant="default" data-testid="locale-picker-message">
            {t("Common.languageHint")}
          </InputHint>
        ) : null}
      </Field>
    </Container>
  );
}
