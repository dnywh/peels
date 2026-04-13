"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { validateName, FIELD_CONFIGS } from "@/lib/formValidation";
import {
  updateFirstNameAction,
  deleteListingAction,
  createOrUpdateListingAction,
} from "@/app/actions";
import { useParams } from "next/navigation";
import LocationSelect from "@/components/LocationSelect";
import CheckboxCluster from "@/components/CheckboxCluster";
import LegalAgreement from "@/components/LegalAgreement";
import Form from "@/components/Form";
import FormSection from "@/components/FormSection";
import FormSectionHeader from "@/components/FormSectionHeader";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import MultiInput from "@/components/MultiInput";
import AvatarUploadManager from "@/components/AvatarUploadManager";
import ButtonToDialog from "@/components/ButtonToDialog";
import ListingPhotosManager from "@/components/ListingPhotosManager";
import InputHint from "@/components/InputHint";
import Fieldset from "@/components/Fieldset";
import Lozenge from "@/components/Lozenge";
import FormMessage from "@/components/FormMessage";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

const DESCRIPTION_MAX_CHARACTERS = 640;

const FieldsetWithGap = styled(Fieldset)({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const AdditionalSettings = styled("footer")(({ theme }) => ({
  width: "100%", // Take full width of the container

  borderTop: `1px solid ${theme.colors.border.base}`,
  paddingTop: `calc(${theme.spacing.unit} * 3)`,
  display: "flex",
  flexDirection: "column",
  gap: `calc(${theme.spacing.unit} * 1.5)`,
}));

const AvatarUploadManagerComponent =
  AvatarUploadManager as React.ComponentType<any>;
const InputComponent = Input as React.ComponentType<any>;
const InputHintComponent = InputHint as React.ComponentType<any>;
const ListingPhotosManagerComponent =
  ListingPhotosManager as React.ComponentType<any>;
const LocationSelectComponent = LocationSelect as React.ComponentType<any>;
const MultiInputComponent = MultiInput as React.ComponentType<any>;
const SelectComponent = Select as React.ComponentType<any>;
const TextareaComponent = Textarea as React.ComponentType<any>;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ListingErrors = Partial<Record<"name" | "location", string>>;

type ListingWriteProps = {
  initialListing?: any;
  user: any;
  profile: any;
};

// Component
export default function ListingWrite({
  initialListing,
  user,
  profile,
}: ListingWriteProps) {
  const t = useTranslations();
  const { type } = useParams<{ type?: string }>();
  const router = useRouter();

  const listingType = initialListing?.type || type || "residential";

  // Update error state to handle both field and global errors
  const [errors, setErrors] = useState<ListingErrors>({});
  const [globalError, setGlobalError] = useState("");

  // Handle form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate editable fields
  const [avatar, setAvatar] = useState<string>(
    initialListing ? initialListing.avatar || "" : ""
  );
  const [name, setName] = useState<string>(
    listingType === "residential"
      ? profile.first_name || "" // Use profile.first_name for residential listings
      : initialListing
        ? initialListing.name || ""
        : "" // Use listing name for others
  );

  const [description, setDescription] = useState<string>(
    initialListing ? initialListing.description || "" : ""
  );

  const [countryCode, setCountryCode] = useState<string>(
    initialListing ? initialListing.country_code || "" : ""
  );

  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    initialListing
      ? {
          latitude: initialListing.latitude,
          longitude: initialListing.longitude,
        }
      : null
  );

  const [areaName, setAreaName] = useState<string>(
    initialListing ? initialListing.area_name || "" : ""
  );

  const [acceptedItems, setAcceptedItems] = useState<string[]>(
    initialListing ? initialListing.accepted_items || [""] : [""]
  );
  const [rejectedItems, setRejectedItems] = useState<string[]>(
    initialListing ? initialListing.rejected_items || [] : []
  );
  const [donatedItems, setDonatedItems] = useState<string[]>(
    initialListing ? initialListing.donated_items || [""] : [""]
  );

  const [photos, setPhotos] = useState<string[]>(
    initialListing ? initialListing.photos || [] : []
  );
  const [links, setLinks] = useState<string[]>(
    initialListing ? initialListing.links || [] : []
  );
  const [visibility, setVisibility] = useState<boolean>(
    initialListing ? initialListing.visibility : true
  );

  const [isStub, setIsStub] = useState<boolean>(
    initialListing ? initialListing.is_stub : false
  );

  // Other states
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);

  async function handleDeleteListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFeedbackMessage("");
    try {
      const response = await deleteListingAction(initialListing.slug);
      if (response.success) {
        router.push(`/profile/?message=${response.message}`);
      } else {
        setFeedbackMessage(response.message);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      setFeedbackMessage(t("Errors.generic"));
    }
  }

  // Form handling logic here
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    // Reset all errors
    setErrors({});
    setGlobalError("");

    // Validate required fields
    const nextErrors: ListingErrors = {};
    let validatedName = name; // Store the validated name

    if (listingType === "residential") {
      // Only validate and update first name if it was changed
      if (name !== profile.first_name) {
        const validation = validateName(name);
        if (!validation.isValid) {
          nextErrors.name = validation.error;
        } else {
          validatedName = validation.value ?? ""; // Store the trimmed value
        }
      }
    } else {
      // For business/community listings, validate the name field
      const validation = validateName(name);
      if (!validation.isValid) {
        nextErrors.name = t("Errors.emptyListingName", { type: listingType });
      } else {
        validatedName = validation.value ?? ""; // Store the trimmed value
      }
    }

    const selectedCoordinates = coordinates;

    if (!selectedCoordinates) {
      nextErrors.location = t("Errors.missingLocation");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      console.log("Validation errors:", nextErrors);
      return;
    }

    if (!selectedCoordinates) return;

    setIsSubmitting(true);
    let shouldResetSubmitting = true;

    try {
      // For residential listings, update the profile first name if changed
      if (
        listingType === "residential" &&
        profile.first_name !== validatedName
      ) {
        console.log(
          "Updating first name from",
          profile.first_name,
          "to",
          validatedName
        );
        const formData = new FormData();
        formData.append("first_name", validatedName);
        const result = await updateFirstNameAction(formData);
        if (result?.error) {
          setErrors({ name: String(result.error) });
          return;
        }
      }

      const supabase = createClient();
      const {
        data: { user: activeUser },
      } = await supabase.auth.getUser();

      if (!activeUser) {
        setGlobalError(t("Errors.generic"));
        return;
      }

      // Prepare the listing data
      const listingData = {
        // Add the id if it's an existing listing, so we know which to update
        ...(initialListing && { id: initialListing.id }),
        owner_id: activeUser.id,
        type: listingType,
        ...(listingType !== "residential" && avatar && { avatar }),
        // Only include name for non-residential listings
        ...(listingType !== "residential" && { name: validatedName }),
        description,
        location: `POINT(${selectedCoordinates.longitude} ${selectedCoordinates.latitude})`,
        // Temporarily store the coordinates as longitude and latitude floats in the database as well
        // ...because I can't get the geometry type to convert to to long and lat dynamically if a user goes direct to a listing, e.g. http://localhost:3000/map?listing=9xvN9zxH0rzZ
        longitude: selectedCoordinates.longitude,
        latitude: selectedCoordinates.latitude,
        area_name: areaName,
        country_code: countryCode,
        accepted_items: acceptedItems.filter((item) => item.trim() !== ""),
        rejected_items: rejectedItems.filter((item) => item.trim() !== ""),
        photos: initialListing ? photos : pendingPhotos,
        links: links.filter((link) => link.trim() !== ""),
        // Only include is_stub if the user is an admin
        ...(profile.is_admin && { is_stub: isStub }),
        visibility,
      };

      console.log("Submitting listing data:", listingData);

      const { data, error } = await createOrUpdateListingAction(listingData);

      if (error) {
        setGlobalError(String(error));
        return;
      }

      if (!data?.slug) {
        setGlobalError(t("Errors.genericLater"));
        return;
      }

      // Redirect to the new/updated listing
      shouldResetSubmitting = false;
      router.push(
        `/listings/${data.slug}?status=${initialListing ? "updated" : "created"}`
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setGlobalError(t("Errors.unexpected"));
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
      }
    }
  }

  //   Functions for adding and removing items
  const addAcceptedItem = () => {
    // if (acceptedItems.length < 10) {
    setAcceptedItems([...acceptedItems, ""]);
    // }
  };
  const addRejectedItem = () => {
    // if (rejectedItems.length < 10) {
    setRejectedItems([...rejectedItems, ""]);
    // }
  };
  const addLink = () => {
    // if (links.length < 3) {
    setLinks([...links, ""]);
    // }
  };
  const handleAcceptedItemChange = (index: number, value: string) => {
    const newItems = [...acceptedItems];
    newItems[index] = value;
    setAcceptedItems(newItems);
  };

  const handleRejectedItemChange = (index: number, value: string) => {
    const newItems = [...rejectedItems];
    newItems[index] = value;
    setRejectedItems(newItems);
  };

  const handleLinksChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  return (
    <>
      {initialListing && initialListing.is_stub && (
        <Lozenge>{t("Common.stub")}</Lozenge>
      )}
      <Form onSubmit={handleSubmit}>
        {listingType === "residential" ? (
          <AvatarUploadManagerComponent
            initialAvatar={profile?.avatar || ""}
            bucket="avatars"
            entityId={user.id}
            onAvatarChange={setAvatar}
            inputHintShown={profile?.avatar ? undefined : true}
            listingType={listingType}
          />
        ) : (
          <AvatarUploadManagerComponent
            initialAvatar={avatar}
            bucket="listing_avatars"
            entityId={initialListing?.slug}
            onAvatarChange={setAvatar}
            listingType={listingType}
          />
        )}

        <FormSection>
          <FormSectionHeader>
            <h2>{t("Listings.form.basics")}</h2>
          </FormSectionHeader>

          {listingType === "residential" ? (
            <Field>
              <Label htmlFor="first_name">
                {t("Listings.form.yourFirstName")}
              </Label>
              <InputComponent
                id="first_name"
                name="first_name"
                {...FIELD_CONFIGS.firstName}
                defaultValue={profile.first_name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
                error={errors.name}
              />
              <InputHintComponent>
                {errors.name || t("Profile.account.firstNameHint")}
              </InputHintComponent>
            </Field>
          ) : (
            <Field>
              <Label htmlFor="name">{t("Listings.form.placeName")}</Label>
              <InputComponent
                id="name"
                name="name"
                required={true}
                type="text"
                minLength={FIELD_CONFIGS.firstName.minLength}
                placeholder={t("Listings.form.placeNamePlaceholder", {
                  type:
                    listingType === "business"
                      ? "business’"
                      : `${listingType}’s`,
                })}
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
                error={errors.name}
              />
              {errors.name && (
                <InputHintComponent variant="error">
                  {errors.name}
                </InputHintComponent>
              )}
            </Field>
          )}

          <LocationSelectComponent
            listingType={listingType}
            initialPlaceholderText={
              initialListing
                ? areaName
                : listingType === "business"
                  ? t("Listings.form.businessAddress")
                  : listingType === "community"
                    ? t("Listings.form.communityAddress")
                    : t("Listings.form.residentialAddress")
            }
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            areaName={areaName}
            setAreaName={setAreaName}
            error={errors.location}
          />

          {listingType === "business" ? (
            <Field>
              <Label htmlFor="description">
                {t("Listings.form.donationDetails")}
              </Label>
              <TextareaComponent
                id="description"
                rows={6}
                maxLength={DESCRIPTION_MAX_CHARACTERS}
                required={true}
                resize="vertical"
                placeholder={t("Listings.form.donationDetailsPlaceholder")}
                value={description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value)
                }
              />
              <InputHintComponent>
                {t("Listings.form.donationDetailsHint")}
              </InputHintComponent>
            </Field>
          ) : (
            <Field>
              <Label htmlFor="description" required={false}>
                {t("Listings.form.descriptionLabel")}
              </Label>
              <TextareaComponent
                id="description"
                rows={listingType === "residential" ? 4 : 5}
                maxLength={DESCRIPTION_MAX_CHARACTERS}
                required={false}
                resize="vertical"
                placeholder={t("Listings.form.descriptionPlaceholder", {
                  type: listingType === "residential" ? "listing" : listingType,
                })}
                value={description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value)
                }
              />
              <InputHintComponent>
                {listingType === "community"
                  ? t("Listings.form.communityDescriptionHint")
                  : t("Listings.form.residentialDescriptionHint")}
              </InputHintComponent>
            </Field>
          )}
        </FormSection>

        {(listingType === "residential" || listingType === "community") && (
          <FormSection>
            <FormSectionHeader>
              <h2>{t("Listings.form.compostingDetails")}</h2>
              <p>{t("Listings.form.compostingDetailsHint")}</p>
            </FormSectionHeader>

            <MultiInputComponent
              label={t("Listings.form.acceptedLabel")}
              addButtonText={t("Listings.form.addItem")}
              addAnotherButtonText={t("Listings.form.addAnotherItem")}
              placeholder={t("Listings.form.acceptedPlaceholder")}
              secondaryPlaceholder={t(
                "Listings.form.acceptedSecondaryPlaceholder"
              )}
              items={acceptedItems}
              minRequired={1}
              handleItemChange={handleAcceptedItemChange}
              onClick={addAcceptedItem}
              limit={12}
            />

            <MultiInputComponent
              label={t("Listings.form.rejectedLabel")}
              addButtonText={t("Listings.form.addItem")}
              addAnotherButtonText={t("Listings.form.addAnotherItem")}
              placeholder={t("Listings.form.rejectedPlaceholder")}
              secondaryPlaceholder={t(
                "Listings.form.rejectedSecondaryPlaceholder"
              )}
              items={rejectedItems}
              handleItemChange={handleRejectedItemChange}
              onClick={addRejectedItem}
              limit={16}
            />
          </FormSection>
        )}

        <FormSection>
          <FormSectionHeader>
            <h2>{t("Listings.form.media")}</h2>
            <p>
              {t("Listings.form.mediaHint", {
                subject:
                  listingType === "residential"
                    ? t("Listings.form.mediaResidential")
                    : listingType === "community"
                      ? t("Listings.form.mediaCommunity")
                      : t("Listings.form.mediaBusiness"),
              })}
            </p>
          </FormSectionHeader>

          <FieldsetWithGap>
            <Label htmlFor="photo-upload-button" required={false}>
              {t("Common.photos")}
            </Label>
            <ListingPhotosManagerComponent
              initialPhotos={initialListing ? photos : pendingPhotos}
              listingSlug={initialListing?.slug}
              onPhotosChange={initialListing ? setPhotos : setPendingPhotos}
              isNewListing={!initialListing}
            />
          </FieldsetWithGap>

          {/* TODO: Selecting field should highlight button, just like every other input */}
          {listingType !== "residential" && (
            <MultiInputComponent
              label={t("Listings.form.externalLinks")}
              required={false}
              addButtonText={t("Listings.form.addLink")}
              placeholder={t("Listings.form.linkPlaceholder")}
              items={links}
              handleItemChange={handleLinksChange}
              onClick={addLink}
              limit={3}
              type="url"
              pattern="https?://.+"
            />
          )}
        </FormSection>

        {initialListing && (
          <FormSection>
            <FormSectionHeader>
              <h2>{t("Listings.form.visibility")}</h2>
              <p>{t("Listings.form.visibilityHint")}</p>
            </FormSectionHeader>

            <Field>
              <Label htmlFor="visibility">
                {t("Listings.form.mapVisibility")}
              </Label>
              <SelectComponent
                id="visibility"
                value={String(initialListing ? visibility : true)}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setVisibility(event.target.value === "true")
                }
                required={true}
              >
                <option value="true">{t("Listings.form.showOnMap")}</option>
                <option value="false">{t("Listings.form.hideFromMap")}</option>
              </SelectComponent>
            </Field>
          </FormSection>
        )}

        {profile?.is_admin && (
          <FormSection>
            <FormSectionHeader>
              <h2>{t("Common.admin")}</h2>
              <p>{t("Listings.form.adminHint")}</p>
            </FormSectionHeader>

            <Field>
              <Label htmlFor="stub">{t("Listings.form.stubSettings")}</Label>
              <SelectComponent
                id="stub"
                value={String(isStub)}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setIsStub(event.target.value === "true")
                }
                required={true}
              >
                <option value="false">
                  {t("Listings.form.regularListing")}
                </option>
                <option value="true">{t("Listings.form.stubListing")}</option>
              </SelectComponent>
              <InputHintComponent>
                {isStub
                  ? t("Listings.form.stubActiveHint")
                  : t("Listings.form.stubInactiveHint")}
              </InputHintComponent>
            </Field>
          </FormSection>
        )}

        <FormSection>
          <CheckboxCluster>
            <LegalAgreement
              required={true}
              defaultChecked={initialListing ? true : undefined}
            />
          </CheckboxCluster>
        </FormSection>

        {(Object.keys(errors).length > 0 || globalError) && (
          <FormMessage
            message={{
              error:
                globalError ||
                t("Errors.validationSummary", {
                  count: Object.keys(errors).length,
                }),
            }}
          />
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          loadingText={initialListing ? t("Status.saving") : t("Status.adding")}
        >
          {initialListing ? t("Actions.saveChanges") : t("Actions.addListing")}
        </Button>
      </Form>

      {/* TODO: Fix styling but do not move into above form, as that means nested forms (and an error) */}
      {initialListing && (
        <AdditionalSettings>
          <Button
            variant="secondary"
            width="contained"
            href={`/listings/${initialListing.slug}`}
          >
            {t("Actions.viewListing")}
          </Button>

          <ButtonToDialog
            variant="danger"
            initialButtonText={t("Actions.deleteListing")}
            dialogTitle={t("Actions.deleteListing")}
            confirmButtonText={t("Listings.delete.confirm")}
            confirmLoadingText={t("Status.deleting")}
            onSubmit={handleDeleteListing}
          >
            {t("Listings.delete.dialog")}
          </ButtonToDialog>
        </AdditionalSettings>
      )}

      {feedbackMessage && <p>{feedbackMessage}</p>}
    </>
  );
}
