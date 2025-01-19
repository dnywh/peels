"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";

import { updateFirstNameAction, deleteListingAction } from "@/app/actions";

import { useSearchParams, useParams } from "next/navigation";

import { siteConfig } from "@/config/site";

import LocationSelect from "@/components/LocationSelect";
import SwitchToggle from "@/components/SwitchToggle";
import LegalAgreement from "@/components/LegalAgreement";
import Form from "@/components/Form";
import FormSection from "@/components/FormSection";
import FormSectionHeader from "@/components/FormSectionHeader";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import MultiInput from "@/components/MultiInput";
import AvatarUploadManager from "@/components/AvatarUploadManager";
import ButtonToDialog from "@/components/ButtonToDialog";
import ListingPhotosManager from "@/components/ListingPhotosManager";
import Hyperlink from "@/components/Hyperlink";
import InputHint from "@/components/InputHint";
import Fieldset from "@/components/Fieldset";

import FormMessage from "@/components/FormMessage";

import { styled } from "@pigment-css/react";

const AdditionalSettings = styled("footer")(({ theme }) => ({
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

  // Prepare error state
  const [errors, setErrors] = useState({});

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
  const [legal, setLegal] = useState(initialListing ? true : false);

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

    // Reset errors
    setErrors({});

    // Validate required fields
    const nextErrors = {};

    if (listingType === "residential") {
      // Only validate and update first name if it was changed
      if (name !== profile.first_name) {
        const validation = validateFirstName(name);
        if (!validation.isValid) {
          nextErrors.name = validation.error;
        }
      }
    } else {
      // For business/community listings, validate the name field
      const validation = validateFirstName(name);
      if (!validation.isValid) {
        nextErrors.name = `You can’t have an empty ${listingType !== "residential" && listingType} name.`;
      }
    }

    if (!coordinates) {
      nextErrors.location = "Please select a location.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      console.log("Errors:", nextErrors);
      return;
    }

    try {
      // For residential listings, update the profile first name if changed
      if (listingType === "residential" && profile.first_name !== name) {
        console.log("Updating first name from", profile.first_name, "to", name);
        const formData = new FormData();
        formData.append("first_name", name);
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
        ...(listingType !== "residential" && { name }),
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
        visibility,
      };

      console.log("Submitting listing data:", listingData);

      // Insert the listing into the database
      const { data, error } = await supabase
        .from("listings")
        .upsert(listingData)
        .select()
        .single();

      if (error) throw error;

      // If this was a new listing, we need to update the photo references
      if (!initialListing && pendingPhotos.length > 0) {
        const { error: updateError } = await supabase
          .from("listings")
          .update({ photos: pendingPhotos })
          .eq("slug", data.slug);
        if (updateError) throw updateError;
      }

      console.log("Listing created/updated:", data);

      // Redirect to the new/updated listing
      router.push(
        `/listings/${data.slug}?status=${initialListing ? "updated" : "created"}`
      );
      // window.location.href = `/listings/${data.slug}?success=Listing ${initialListing ? "updated" : "created"} successfully`
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrors({
        submit: error.message,
      });
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
      <Form onSubmit={handleSubmit}>
        {listingType === "residential" ? (
          <AvatarUploadManager
            initialAvatar={profile?.avatar || ""}
            bucket="avatars"
            entityId={user.id}
            onAvatarChange={setAvatar}
            inputHintShown={profile?.avatar ? undefined : true}
          />
        ) : (
          <AvatarUploadManager
            initialAvatar={avatar}
            bucket="listing_avatars"
            entityId={initialListing?.slug}
            onAvatarChange={setAvatar}
          />
        )}

        <FormSection>
          <FormSectionHeader>
            <h2>Basics</h2>
          </FormSectionHeader>

          {listingType === "residential" ? (
            <Field>
              <Label htmlFor="name">Your first name</Label>
              <Input
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
                maxLength={512}
                required={true}
                resize="vertical"
                placeholder="Your donation details"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <InputHint>
                What kind of food scraps or similar you have to give away,
                collection details, and similar.
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
                maxLength={512}
                required={false}
                resize="vertical"
                placeholder={`About your ${listingType === "residential" ? "listing" : listingType}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <InputHint>
                {listingType === "community"
                  ? "Opening hours, composting facilities, and similar."
                  : "Composting facilities, gates to unlock, and similar."}{" "}
                Save instructions about which scraps you take for the dedicated
                section, below.
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
              placeholder="Something you accept (e.g. ‘fruit rinds’)"
              secondaryPlaceholder="Something else"
              items={acceptedItems}
              minRequired={1}
              handleItemChange={handleAcceptedItemChange}
              onClick={addAcceptedItem}
              limit={6}
            />

            <MultiInput
              label="What scraps do you not accept?"
              addButtonText="Add an item"
              placeholder="Something you don’t accept (e.g. ‘meat’)"
              secondaryPlaceholder="Something else"
              items={rejectedItems}
              handleItemChange={handleRejectedItemChange}
              onClick={addRejectedItem}
              limit={6}
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

          <Fieldset>
            <Label required={false}>Photos</Label>
            <ListingPhotosManager
              initialPhotos={initialListing ? photos : pendingPhotos}
              listingSlug={initialListing?.slug}
              onPhotosChange={initialListing ? setPhotos : setPendingPhotos}
              isNewListing={!initialListing}
            />
          </Fieldset>

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
            />
          )}
        </FormSection>

        {initialListing && (
          <FormSection>
            <FormSectionHeader>
              <h2>Visibility</h2>
              <p>Switch this off if you need to take a break from Peels.</p>
            </FormSectionHeader>
            {/* onChange event is handled differently because Radix Switch provides a direct boolean value in its change handler. */}
            <SwitchToggle
              id="visibility"
              label="Show on map"
              checked={visibility}
              onChange={(checked) => setVisibility(checked)}
            />
          </FormSection>
        )}

        <FormSection>
          <LegalAgreement
            required={true}
            defaultChecked={initialListing ? true : undefined}
          />
        </FormSection>

        {Object.keys(errors).length > 0 && (
          <FormMessage
            message={{
              error: `Please fix the above error${
                Object.keys(errors).length > 1 ? "s" : ""
              } and then try again.`,
            }}
          />
        )}
        <SubmitButton>
          {initialListing ? "Save changes" : "Add listing"}
        </SubmitButton>

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
              initialButtonText="Delete listing"
              dialogTitle="Delete listing"
              confirmButtonText="Yes, delete listing"
              onSubmit={handleDeleteListing}
            >
              Are you sure you want to delete your listing? This action cannot
              be undone.
            </ButtonToDialog>
          </AdditionalSettings>
        )}
      </Form>

      {feedbackMessage && <p>{feedbackMessage}</p>}
    </>
  );
}
