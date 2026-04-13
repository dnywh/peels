"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SubmitButton from "@/components/SubmitButton";
import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import RadioGroup from "@/components/RadioGroup";
import Radio from "@/components/Radio";
import { useTranslations } from "next-intl";

// Not possible because this page is marked as "use client". Nest children in client components and then add the metadata
// export const metadata = {
//     title: 'Add Listing', // TODO: Generate metadata to include the type of listing, see edit listing page
// }

function AddListingContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const listingTypes = [
    {
      key: "host",
      title: t("Listings.new.options.host.title"),
      description: t("Listings.new.options.host.description"),
    },
    {
      key: "business",
      title: t("Listings.new.options.business.title"),
      description: t("Listings.new.options.business.description"),
    },
  ];
  const hostTypes = [
    {
      key: "residential",
      title: t("Listings.new.options.residential.title"),
      description: t("Listings.new.options.residential.description"),
    },
    {
      key: "community",
      title: t("Listings.new.options.community.title"),
      description: t("Listings.new.options.community.description"),
    },
  ];

  const [selectedListingType, setSelectedListingType] = useState(null);
  const [selectedHostType, setSelectedHostType] = useState(null);

  console.log("Current state:", {
    type,
    selectedListingType,
    selectedHostType,
  });

  function handleSubmit(event) {
    event.preventDefault();

    // If we're on the host type selection page
    if (type === "host") {
      if (!selectedHostType?.key) {
        console.warn("No host type selected");
        return;
      }
      router.push(`/profile/listings/new/${selectedHostType.key}`);
      return;
    }

    // If we're on the initial selection page
    if (!selectedListingType?.key) {
      console.warn("No listing type selected");
      return;
    }

    if (selectedListingType.key === "business") {
      router.push(`/profile/listings/new/business`);
    } else if (selectedListingType.key === "host") {
      router.push(`/profile/listings/new?type=host`);
    }
  }

  // Show different form based on URL type
  return (
    <>
      <FormHeader button="back">
        {type === "host" ? (
          <h1>{t("Listings.new.hostTypeTitle")}</h1>
        ) : (
          <h1>{t("Listings.new.listingTypeTitle")}</h1>
        )}
      </FormHeader>

      <Form onSubmit={handleSubmit}>
        {type === "host" ? (
          <RadioGroup
            by="title"
            value={selectedHostType}
            onChange={setSelectedHostType}
            aria-label={t("Listings.new.hostTypeLabel")}
          >
            {hostTypes.map((option) => (
              <Radio
                key={option.key}
                value={option}
                title={option.title}
                description={option.description}
              />
            ))}
          </RadioGroup>
        ) : (
          <RadioGroup
            by="title"
            value={selectedListingType}
            onChange={setSelectedListingType}
            aria-label={t("Listings.new.listingTypeLabel")}
          >
            {listingTypes.map((option) => (
              <Radio
                key={option.key}
                value={option}
                title={option.title}
                description={option.description}
              />
            ))}
          </RadioGroup>
        )}

        <SubmitButton
          width="full"
          disabled={type === "host" ? !selectedHostType : !selectedListingType}
        >
          {t("Actions.continue")}
        </SubmitButton>
      </Form>
    </>
  );
}

function AddListingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddListingContent />
    </Suspense>
  );
}

function LoadingFallback() {
  const t = useTranslations("Common");

  return <div>{t("loading")}</div>;
}

export default AddListingPage;
