"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { deleteListingAction } from "@/app/actions";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

import LocationSelect from "@/components/LocationSelect";
import SwitchToggle from "@/components/SwitchToggle";
import CheckboxUnit from "@/components/CheckboxUnit";

import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import MultiInput from "@/components/MultiInput";
import AvatarUploadManager from "@/components/AvatarUploadManager";
import PhotosUploader from "@/components/PhotosUploader";
import LinkButton from "@/components/LinkButton";
import ButtonToDialog from "@/components/ButtonToDialog";
import { styled } from "@pigment-css/react";

import AdditionalSettings from "@/components/AdditionalSettings";

async function uploadPhoto(file) {
  const supabase = createClient();

  // Create a unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from("listing_photos")
    .upload(fileName, file);

  if (error) throw error;

  // Return just the filename instead of full URL
  return fileName;
}

// Add a helper function to get URLs when needed
function getPhotoUrl(filename) {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("listing_photos").getPublicUrl(filename);
  return publicUrl;
}

// React component
export default function ListingWrite({ initialListing, user, profile }) {
  const { type } = useParams();
  const router = useRouter();

  const listingType = initialListing?.type || type;

  // Populate editable fields
  const [avatar, setAvatar] = useState(
    initialListing ? initialListing.avatar : ""
  );
  const [name, setName] = useState(initialListing ? initialListing.name : "");
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

  async function handleDeleteListing(event) {
    event.preventDefault();
    // console.log("Deleting listing with slug:", initialListing.slug);
    const response = await deleteListingAction(initialListing.slug);
    if (response.success) {
      router.push(`/profile/account?message=${response.message}`);
    } else {
      setFeedbackMessage(response.message);
    }
  }

  // Form handling logic here
  async function handleSubmit(event) {
    event.preventDefault();
    console.log(visibility);
    try {
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
        name,
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
        photos,
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

      console.log("Listing created/updated:", data);

      // Redirect to the new/updated listing
      router.push(
        `/listings/${data.slug}?status=${initialListing ? "updated" : "created"}`
      );
      // window.location.href = `/listings/${data.slug}?success=Listing ${initialListing ? "updated" : "created"} successfully`
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  }

  const handlePhotoChange = async (event) => {
    const files = Array.from(event.target.files);
    try {
      const uploadPromises = files.map(uploadPhoto);
      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos(uploadedUrls);
    } catch (error) {
      console.error("Error uploading photos:", error);
      // Show error message to user
    }
  };

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
          />
        ) : (
          <AvatarUploadManager
            initialAvatar={avatar}
            bucket="listing_avatars"
            entityId={initialListing?.slug}
            onAvatarChange={setAvatar}
          />
        )}

        <div>
          <h2>Basics</h2>
          {listingType !== "residential" && (
            <Field>
              <Label htmlFor="name">Place name</Label>
              <Input
                id="name"
                required={true}
                type="text"
                placeholder={`Your ${listingType === "business" ? "business’" : `${listingType}’s`} name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
          )}

          {/* TODO: Handle database error when user doesn't enter a location */}
          <LocationSelect
            listingType={listingType}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            areaName={areaName}
            setAreaName={setAreaName}
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
            </Field>
          ) : (
            <Field>
              <Label htmlFor="description" required={false}>
                Short description or instructions
              </Label>
              <Textarea
                id="description"
                rows={6}
                maxLength={512}
                required={false}
                resize="vertical"
                placeholder={`About your ${listingType === "residential" ? "listing" : listingType === "community" ? "community project" : "business"}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          )}
        </div>

        {(listingType === "residential" || listingType === "community") && (
          <div>
            <h2>Composting details</h2>
            <p>
              Be specific so people know exactly what should be avoided. Enter
              items separately so it’s easier to read.
            </p>

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
              placeholder="Something you don’t accept (e.g. ‘meat’)"
              secondaryPlaceholder="Something else"
              items={rejectedItems}
              handleItemChange={handleRejectedItemChange}
              onClick={addRejectedItem}
              limit={6}
            />
          </div>
        )}

        <div>
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

          <PhotosUploader
            title="Additional photos"
            photos={photos}
            optional={true}
            onChange={handlePhotoChange}
            getPhotoUrl={getPhotoUrl}
          />

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
        </div>

        {initialListing && (
          <div>
            <h2>Visibility</h2>
            <p>Switch this off if you need to take a break from Peels.</p>
            {/* onChange event is handled differently because Radix Switch provides a direct boolean value in its change handler. */}
            <SwitchToggle
              id="visibility"
              label="Show on map"
              checked={visibility}
              onChange={(checked) => setVisibility(checked)}
            />
          </div>
        )}

        <div>
          <CheckboxUnit
            id="legal"
            checked={legal}
            required={true}
            onChange={(event) => setLegal(event.target.checked)}
          >
            I have read and accept the Peels{" "}
            <Link href="/terms-of-use" target="_blank">
              {" "}
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank">
              Privacy Policy
            </Link>
          </CheckboxUnit>
        </div>

        {/* More form fields */}
        <SubmitButton>
          {initialListing ? "Save changes" : "Add listing"}
        </SubmitButton>
      </Form>

      {/* TODO: warn if unsaved changes? */}
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
            Are you sure you want to delete your listing? This action cannot be
            undone.
          </ButtonToDialog>
        </AdditionalSettings>
      )}

      {feedbackMessage && <p>{feedbackMessage}</p>}
    </>
  );
}
