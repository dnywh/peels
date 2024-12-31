"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { deleteListingAction } from "@/app/actions";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import LocationSelect from "@/components/LocationSelect";
import SwitchToggle from "@/components/SwitchToggle";
import CheckboxUnit from "@/components/CheckboxUnit";

// Helper functions for database changes
// Initialize MapTiler client
// maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
// console.log(maptilersdk.config.apiKey)
// async function createLegibleLocation(longitude, latitude) {
//     // config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
//     const result = await geocoding.reverse([longitude, latitude]);
//     // Helper function to find feature by place type
//     const findFeatureByType = (features, types) => {
//         return features.find(f => types.some(type => f.place_type?.includes(type)));
//     };

//     const features = result.features;
//     console.log(features)

//     if (!features || features.length === 0) {
//         return undefined;
//     }

//     // Look for features in order of specificity
//     const neighbourhood = findFeatureByType(features, ['neighbourhood']);
//     const place = findFeatureByType(features, ['place']);
//     const municipality = findFeatureByType(features, ['municipality']);
//     const region = findFeatureByType(features, ['region']);
//     const country = findFeatureByType(features, ['country']);
//     const marine = findFeatureByType(features, ['continental_marine']);

//     // Build location string based on available information
//     if (place && region) {
//         return `${place.text}, ${region.text}`;
//     } else if (municipality && region) {
//         return `${municipality.text}, ${region.text}`;
//     } else if (municipality) {
//         return municipality.text;
//     } else if (region) {
//         return region.text;
//     } else if (country) {
//         return country.text;
//     } else if (marine) {
//         return marine.text;
//     } else {
//         // Fallback to the most relevant feature's place name
//         return features[0].place_name || undefined;
//     }
// }
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

async function uploadAvatar(file) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("listing_avatars")
    .upload(fileName, file);

  if (error) throw error;

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

function getAvatarUrl(filename) {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("listing_avatars").getPublicUrl(filename);
  return publicUrl;
}

async function deleteAvatar(filePath) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("listing_avatars")
    .remove([filePath]);

  if (error) throw error;
}

// React component
export default function ListingWrite({ initialListing }) {
  const searchParams = useSearchParams();
  const listingTypeFromSearchParams =
    searchParams.get("type") === "community" ||
    searchParams.get("type") === "business"
      ? searchParams.get("type")
      : "residential";

  // TODO do we need this?
  //   const [listing, setListing] = useState(initialListing);

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

  const [acceptedItems, setAcceptedItems] = useState(
    initialListing ? initialListing.accepted_items : [""]
  );
  const [rejectedItems, setRejectedItems] = useState(
    initialListing ? initialListing.rejected_items : []
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
  const [legal, setLegal] = useState(true);

  // Other states
  const [isDeleting, setIsDeleting] = useState(false);

  //   Populate hardcoded values
  const listingType = initialListing
    ? initialListing.type
    : listingTypeFromSearchParams;

  // Form handling logic here
  async function handleSubmit(event) {
    event.preventDefault();
    console.log(visibility);
    // console.log(coordinates);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get location_legible using your tested function
      // const locationLegible = await createLegibleLocation(longitude, latitude);

      // Prepare the listing data
      const listingData = {
        // Add the id if it's an existing listing, so we know which to update
        ...(initialListing && { id: initialListing.id }),
        owner_id: user.id,
        type: listingType,
        avatar,
        name,
        description,
        location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
        // Temporarily store the coordinates as longitude and latitude floats in the database as well
        // ...because I can't get the geometry type to convert to to long and lat dynamically if a user goes direct to a listing, e.g. http://localhost:3000/map?listing=9xvN9zxH0rzZ
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
        country_code: countryCode,
        accepted_items: acceptedItems.filter((item) => item.trim() !== ""),
        rejected_items: rejectedItems.filter((item) => item.trim() !== ""),
        photos,
        links: links ? [links] : [],
        visibility,
      };

      console.log(listingData);

      // Insert the listing into the database
      const { data, error } = await supabase
        .from("listings")
        .upsert(listingData)
        .select()
        .single();

      if (error) throw error;

      // Clear form and show success
      console.log("Listing created/updated:", data);

      // Reset form after submission if it's a new listing
      //   if (!initialListing) {
      //     setName("");
      //     setAvatar("");
      //     setDescription("");
      //     setCoordinates({ latitude: 0, longitude: 0 });
      //     setCountryCode("");
      //     setAcceptedItems([""]);
      //     setRejectedItems([""]);
      //     setPhotos([]);
      //     setLinks([]);
      //     setVisibility(true);
      //     setLegal(false);
      //   }

      // TODO: redirect to listings page and show success toast
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

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // If there's an existing avatar, delete it first
        if (avatar) {
          // Extract the file path from the URL
          const existingFilePath = avatar.split("/").pop();
          await deleteAvatar(existingFilePath);
        }

        const avatarUrl = await uploadAvatar(file);
        setAvatar(avatarUrl);
      } catch (error) {
        console.error("Error handling avatar:", error);
        // Show error message to user
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (avatar) {
      try {
        const filePath = avatar.split("/").pop();
        await deleteAvatar(filePath);
        setAvatar("");
      } catch (error) {
        console.error("Error deleting avatar:", error);
        // Show error message to user
      }
    }
  };

  //   Functions for adding and removing items
  const addAcceptedItem = () => {
    if (acceptedItems.length < 10) {
      setAcceptedItems([...acceptedItems, ""]);
    }
  };
  const addRejectedItem = () => {
    if (rejectedItems.length < 10) {
      setRejectedItems([...rejectedItems, ""]);
    }
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

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="avatar">
          Avatar <span>(optional)</span>
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          multiple={false}
          onChange={handleAvatarChange}
        />
        {avatar && (
          <div>
            <img
              src={getAvatarUrl(avatar)}
              alt="Listing avatar"
              style={{ width: "100px" }}
            />
            <button type="button" onClick={handleAvatarDelete}>
              Remove avatar
            </button>
          </div>
        )}

        <h2>Basics</h2>
        {listingType !== "residential" && (
          <>
            <label htmlFor="name">Place name</label>
            <input
              id="name"
              required={true}
              type="text"
              placeholder={`Your ${listingType === "business" ? "business’" : `${listingType}’s`} name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </>
        )}

        {/* TODO: Handle database error when user doesn't enter a location */}
        <LocationSelect
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
        />

        <label htmlFor="description">
          Description
          {listingType === "residential" ? <span>(optional)</span> : undefined}
        </label>
        <textarea
          id="description"
          required={listingType === "residential" ? false : true}
          placeholder="Description here"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div>
          <h2>Composting details</h2>
          <p>
            Be specific so people know exactly what should be avoided. Enter
            items separately so it’s easier to read.
          </p>

          <label htmlFor="acceptedItems">What scraps do you accept?</label>
          {acceptedItems.map((item, index) => (
            <div key={`accepted-${index}`}>
              <input
                id={`acceptedItems-${index}`}
                required={index === 0}
                type="text"
                placeholder="Something you accept (e.g. 'fruit rinds')"
                value={item}
                onChange={(e) =>
                  handleAcceptedItemChange(index, e.target.value)
                }
              />
            </div>
          ))}
          {acceptedItems.length < 10 && (
            <button type="button" onClick={addAcceptedItem}>
              Add another
            </button>
          )}

          <label htmlFor="rejectedItems">
            What scraps do you <em>not</em> accept? <span>(optional)</span>
          </label>
          {rejectedItems.map((item, index) => (
            <div key={`rejected-${index}`}>
              <input
                id={`rejectedItems-${index}`}
                type="text"
                placeholder="Something you don't accept (e.g. 'meat')"
                value={item}
                onChange={(e) =>
                  handleRejectedItemChange(index, e.target.value)
                }
              />
            </div>
          ))}
          {rejectedItems.length < 10 && (
            <button type="button" onClick={addRejectedItem}>
              Add another
            </button>
          )}
        </div>

        <div>
          <h2>Media</h2>
          <p>
            Optionally show a bit more about your community project to Peels
            members.
          </p>

          <label htmlFor="photos">
            Additional photos <span>(optional)</span>
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple={true}
            onChange={handlePhotoChange}
          />
          {photos.length > 0 && (
            <div>
              {photos.map((filename, index) => (
                <img
                  key={index}
                  src={getPhotoUrl(filename)}
                  alt={`Photo ${index + 1}`}
                  style={{ width: "100px" }}
                />
              ))}
            </div>
          )}

          <label htmlFor="links">
            Links <span>(optional)</span>
          </label>
          <input
            id="link-1"
            type="url"
            placeholder="https://www.example.com"
            value={links}
            onChange={(event) => setLinks(event.target.value)}
          />
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
        <button type="submit">
          {initialListing ? "Save changes" : "Add listing"}
        </button>
      </form>
      <hr />
      <div>
        {/* TODO: warn if unsaved changes? */}
        {initialListing && (
          <>
            <Link href={`/listings/${initialListing.slug}`}>View listing</Link>
            <button type="button" onClick={() => setIsDeleting(true)}>
              Delete listing
            </button>

            {isDeleting && (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  console.log(
                    "Deleting listing with slug:",
                    initialListing.slug
                  );
                  await deleteListingAction(initialListing.slug);
                  setIsDeleting(false);
                }}
              >
                <p>
                  Are you sure you want to delete this listing? This action
                  cannot be undone.
                </p>
                <button type="submit">Yes, delete my listing</button>
                <button type="button" onClick={() => setIsDeleting(false)}>
                  No, cancel
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
}
