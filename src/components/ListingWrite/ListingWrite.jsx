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

// Component
export default function ListingWrite({ initialListing, user, profile }) {
  const { type } = useParams();
  const router = useRouter();

  const listingType = initialListing?.type || type;

  // Update error state to handle both field and global errors
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  // Handle form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate editable fields
  const [avatar, setAvatar] = useState(
    initialListing ? initialListing.avatar : ""
  );
  const [name, setName] = useState(
    listingType === "residential"
      ? profile.first_name // Use profile.first_name for residential listings
      : initialListing
        ? initialListing.name
        : "" // Use listing name for others
  );

  const [description, setDescription] = useState(
    initialListing ? initialListing.description : ""
  );

  const [countryCode, setCountryCode] = useState(
    initialListing ? initialListing.country_code : ""
  );

  const [coordinates, setCoordinates] = useState(
    initialListing
      ? {
          latitude: initialListing.latitude,
          longitude: initialListing.longitude,
        }
      : null
  );

  const [areaName, setAreaName] = useState(
    initialListing ? initialListing.area_name : ""
  );

  const [acceptedItems, setAcceptedItems] = useState(
    initialListing ? initialListing.accepted_items : [""]
  );
  const [rejectedItems, setRejectedItems] = useState(
    initialListing ? initialListing.rejected_items : []
  );
  const [donatedItems, setDonatedItems] = useState(
    initialListing ? initialListing.donated_items : [""]
  );

  const [photos, setPhotos] = useState(
    initialListing ? initialListing.photos : []
  );
  const [links, setLinks] = useState(
    initialListing ? initialListing.links : []
  );
  const [visibility, setVisibility] = useState(
    initialListing ? initialListing.visibility : true
  );

  const [isStub, setIsStub] = useState(
    initialListing ? initialListing.is_stub : false
  );

  // Other states
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState([]);

  async function handleDeleteListing(event) {
    event.preventDefault();
    // console.log("Deleting listing with slug:", initialListing.slug);
    const response = await deleteListingAction(initialListing.slug);
    if (response.success) {
      router.push(`/profile/?message=${response.message}`);
    } else {
      setFeedbackMessage(response.message);
    }
  }

  // Form handling logic here
  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    // Reset all errors
    setErrors({});
    setGlobalError("");

    // Validate required fields
    const nextErrors = {};
    let validatedName = name; // Store the validated name

    if (listingType === "residential") {
      // Only validate and update first name if it was changed
      if (name !== profile.first_name) {
        const validation = validateName(name);
        if (!validation.isValid) {
          nextErrors.name = validation.error;
        } else {
          validatedName = validation.value; // Store the trimmed value
        }
      }
    } else {
      // For business/community listings, validate the name field
      const validation = validateName(name);
      if (!validation.isValid) {
        nextErrors.name = `You can't have an empty ${listingType} name.`;
      } else {
        validatedName = validation.value; // Store the trimmed value
      }
    }

    if (!coordinates) {
      nextErrors.location = "Please select a location.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      console.log("Validation errors:", nextErrors);
      return;
    }

    try {
      // For residential listings, update the profile first name if changed
      if (listingType === "residential" && profile.first_name !== name) {
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
          setErrors({ name: result.error });
          return;
        }
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Prepare the listing data
      const listingData = {
        // Add the id if it's an existing listing, so we know which to update
        ...(initialListing && { id: initialListing.id }),
        owner_id: user.id,
        type: listingType,
        ...(listingType !== "residential" && avatar && { avatar }),
        // Only include name for non-residential listings
        ...(listingType !== "residential" && { name: validatedName }),
        description,
        location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
        // Temporarily store the coordinates as longitude and latitude floats in the database as well
        // ...because I can't get the geometry type to convert to to long and lat dynamically if a user goes direct to a listing, e.g. http://localhost:3000/map?listing=9xvN9zxH0rzZ
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
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
        setGlobalError(error);
        return;
      }

      // Redirect to the new/updated listing
      router.push(
        `/listings/${data.slug}?status=${initialListing ? "updated" : "created"}`
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setGlobalError("An unexpected error occurred. Please try again later.");
    } finally {
      // Only reset isSubmitting if we're not navigating away
      if (globalError) {
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
  const handleAcceptedItemChange = (index, value) => {
    const newItems = [...acceptedItems];
    newItems[index] = value;
    setAcceptedItems(newItems);
  };

  const handleRejectedItemChange = (index, value) => {
    const newItems = [...rejectedItems];
    newItems[index] = value;
    setRejectedItems(newItems);
  };

  const handleLinksChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  return (
    <>
      {initialListing && initialListing.is_stub && <Lozenge>Stub</Lozenge>}
      <Form onSubmit={handleSubmit}>
        {listingType === "residential" ? (
          <AvatarUploadManager
            initialAvatar={profile?.avatar || ""}
            bucket="avatars"
            entityId={user.id}
            onAvatarChange={setAvatar}
            inputHintShown={profile?.avatar ? undefined : true}
            listingType={listingType}
          />
        ) : (
          <AvatarUploadManager
            initialAvatar={avatar}
            bucket="listing_avatars"
            entityId={initialListing?.slug}
            onAvatarChange={setAvatar}
            listingType={listingType}
          />
        )}

        <FormSection>
          <FormSectionHeader>
            <h2>Basics</h2>
          </FormSectionHeader>

          {listingType === "residential" ? (
            <Field>
              <Label htmlFor="first_name">Your first name</Label>
              <Input
                id="first_name"
                name="first_name"
                {...FIELD_CONFIGS.firstName}
                defaultValue={profile.first_name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
              />
              <InputHint>
                {errors.name ? errors.name : FIELD_CONFIGS.firstName.hint}
              </InputHint>
            </Field>
          ) : (
            <Field>
              <Label htmlFor="name">Place name</Label>
              <Input
                id="name"
                name="name"
                required={true}
                type="text"
                minLength={FIELD_CONFIGS.firstName.minLength}
                placeholder={`Your ${listingType === "business" ? "business’" : `${listingType}’s`} name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={errors.name}
              />
              {errors.name && (
                <InputHint variant="error">{errors.name}</InputHint>
              )}
            </Field>
          )}

          <LocationSelect
            listingType={listingType}
            initialPlaceholderText={
              initialListing
                ? areaName
                : listingType === "business"
                  ? "Your business’ address"
                  : listingType === "community"
                    ? "Your community’s address"
                    : "Your street or neighbourhood"
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
              <Label htmlFor="description">Donation details</Label>
              <Textarea
                id="description"
                rows={6}
                maxLength={DESCRIPTION_MAX_CHARACTERS}
                required={true}
                resize="vertical"
                placeholder="Your donation details"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <InputHint>
                What kind of scraps you have to give away and the collection
                details. Save any links for the dedicated section, below.
              </InputHint>
            </Field>
          ) : (
            <Field>
              <Label htmlFor="description" required={false}>
                Short description or instructions
              </Label>
              <Textarea
                id="description"
                rows={listingType === "residential" ? 4 : 5}
                maxLength={DESCRIPTION_MAX_CHARACTERS}
                required={false}
                resize="vertical"
                placeholder={`About your ${listingType === "residential" ? "listing" : listingType}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <InputHint>
                {listingType === "community"
                  ? "Opening hours and composting facilities."
                  : "Your composting set up and general availability."}{" "}
                Save the scraps you accept{" "}
                {listingType !== "residential" && "and any links"} for the
                dedicated section{listingType !== "residential" && "s"}, below.
              </InputHint>
            </Field>
          )}
        </FormSection>

        {(listingType === "residential" || listingType === "community") && (
          <FormSection>
            <FormSectionHeader>
              <h2>Composting details</h2>
              <p>
                Be specific so people know exactly what should be avoided. Enter
                items separately so it’s easier to read.
              </p>
            </FormSectionHeader>

            <MultiInput
              label="What scraps do you accept?"
              addButtonText="Add an item"
              addAnotherButtonText="Add another item"
              placeholder="An item you accept (e.g. ‘fruit rinds’)"
              secondaryPlaceholder="Another item you accept"
              items={acceptedItems}
              minRequired={1}
              handleItemChange={handleAcceptedItemChange}
              onClick={addAcceptedItem}
              limit={12}
            />

            <MultiInput
              label="What scraps do you not accept?"
              addButtonText="Add an item"
              addAnotherButtonText="Add another item"
              placeholder="An item you don’t accept (e.g. ‘meat’)"
              secondaryPlaceholder="Another item you don’t accept"
              items={rejectedItems}
              handleItemChange={handleRejectedItemChange}
              onClick={addRejectedItem}
              limit={16}
            />
          </FormSection>
        )}

        <FormSection>
          <FormSectionHeader>
            <h2>Media</h2>
            <p>
              Optionally show{" "}
              {listingType === "residential"
                ? "a bit more about your listing"
                : listingType === "community"
                  ? "a bit more about your community project"
                  : "off your business"}{" "}
              to Peels members.
            </p>
          </FormSectionHeader>

          <FieldsetWithGap>
            <Label htmlFor="photo-upload-button" required={false}>
              Photos
            </Label>
            <ListingPhotosManager
              initialPhotos={initialListing ? photos : pendingPhotos}
              listingSlug={initialListing?.slug}
              onPhotosChange={initialListing ? setPhotos : setPendingPhotos}
              isNewListing={!initialListing}
            />
          </FieldsetWithGap>

          {/* TODO: Selecting field should highlight button, just like every other input */}
          {listingType !== "residential" && (
            <MultiInput
              label="External links"
              required={false}
              addButtonText="Add link"
              placeholder="Your website or social media"
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
              <h2>Visibility</h2>
              <p>
                Need a break from Peels? Temporarily hide this listing from the
                map.
              </p>
            </FormSectionHeader>

            <Field>
              <Label htmlFor="visibility">Map visibility</Label>
              <Select
                id="visibility"
                value={initialListing ? visibility : "true"}
                onChange={(event) =>
                  setVisibility(event.target.value === "true")
                }
                required={true}
              >
                <option value="true">Show this listing on the map</option>
                <option value="false">Hide this listing from the map</option>
              </Select>
            </Field>
          </FormSection>
        )}

        {profile?.is_admin && (
          <FormSection>
            <FormSectionHeader>
              <h2>Admin</h2>
              <p>Admin-only controls for this listing.</p>
            </FormSectionHeader>

            <Field>
              <Label htmlFor="stub">Stub settings</Label>
              <Select
                id="stub"
                value={isStub}
                onChange={(event) => setIsStub(event.target.value === "true")}
                required={true}
              >
                <option value="false">
                  This is a regular listing owned by you
                </option>
                <option value="true">
                  This listing is a stub that others can claim
                </option>
              </Select>
              <InputHint>
                {isStub
                  ? "This listing will not contain your contact information. Others can claim it as their own and take it over."
                  : "This listing will be presented just like any other."}
              </InputHint>
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
                `Please fix the above error${
                  Object.keys(errors).length > 1 ? "s" : ""
                } and then try again.`,
            }}
          />
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          loadingText={initialListing ? "Saving..." : "Adding..."}
        >
          {initialListing ? "Save changes" : "Add listing"}
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
            View listing
          </Button>

          <ButtonToDialog
            variant="danger"
            initialButtonText="Delete listing"
            dialogTitle="Delete listing"
            confirmButtonText="Yes, delete listing"
            onSubmit={handleDeleteListing}
          >
            Are you sure you want to delete your listing? This is irreversible.
          </ButtonToDialog>
        </AdditionalSettings>
      )}

      {feedbackMessage && <p>{feedbackMessage}</p>}
    </>
  );
}
