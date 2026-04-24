"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import Form from "@/components/Form";
import RadioGroup from "@/components/RadioGroup";
import Radio from "@/components/Radio";
import type { FormSubmitEvent } from "@/types/events";

type ListingTypeOption = {
  key: string;
  title: string;
  description: string;
};

type ListingTypeChooserProps = {
  mode: "listing" | "host";
  options: ListingTypeOption[];
  continueLabel: string;
  ariaLabel: string;
};

export default function ListingTypeChooser({
  mode,
  options,
  continueLabel,
  ariaLabel,
}: ListingTypeChooserProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<ListingTypeOption | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const nextHref = useMemo(() => {
    if (!selectedOption) return null;

    if (mode === "host") {
      return `/profile/listings/new/${selectedOption.key}`;
    }

    if (selectedOption.key === "business") {
      return "/profile/listings/new/business";
    }

    return "/profile/listings/new?type=host";
  }, [mode, selectedOption]);

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    if (!nextHref) return;
    router.push(nextHref);
  }

  return (
    <Form
      onSubmit={handleSubmit}
      data-testid="listing-type-chooser"
      data-hydrated={isHydrated ? "true" : "false"}
    >
      <RadioGroup
        value={selectedOption}
        onChange={(value) => setSelectedOption(value as ListingTypeOption)}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <Radio
            key={option.key}
            value={option}
            data-testid={`listing-type-option-${option.key}`}
            title={option.title}
            description={option.description}
          />
        ))}
      </RadioGroup>

      <SubmitButton
        width="full"
        disabled={!selectedOption}
        data-testid="listing-type-chooser-submit"
      >
        {continueLabel}
      </SubmitButton>
    </Form>
  );
}
