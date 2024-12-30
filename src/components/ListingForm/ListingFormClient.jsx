"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

import Link from "next/link";

import LocationSelect from "@/components/LocationSelect";
import SwitchToggle from "@/components/SwitchToggle";
import CheckboxUnit from "@/components/CheckboxUnit";

export default function ListingFormClient({ initialListing }) {
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

  const [coordinates, setCoordinates] = useState(
    initialListing
      ? {
          latitude: initialListing.latitude,
          longitude: initialListing.longitude,
        }
      : { latitude: 0, longitude: 0 }
  );

  const [acceptedItems, setAcceptedItems] = useState(
    initialListing ? initialListing.accepted_items : []
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

  //   Populate hardcoded values
  const listingType = initialListing
    ? initialListing.type
    : "TODO FROM SEARCH PARAMS";

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
    <form onSubmit={handleSubmit}>
      <h2>Basics</h2>
      {listingType !== "residential" && (
        <>
          <label htmlFor="name">Place name</label>
          <input
            id="name"
            required={true}
            type="text"
            placeholder="Your community’s name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </>
      )}

      <LocationSelect
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />

      <label htmlFor="description">
        Description
        {listingType === "residential" ? <span>(optional)</span> : null}
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
          Be specific so people know exactly what should be avoided. Enter items
          separately so it’s easier to read.
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
              onChange={(e) => handleAcceptedItemChange(index, e.target.value)}
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
              onChange={(e) => handleRejectedItemChange(index, e.target.value)}
            />
          </div>
        ))}
        {rejectedItems.length < 10 && (
          <button type="button" onClick={addRejectedItem}>
            Add another
          </button>
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
      <button type="submit">
        {initialListing ? "Save changes" : "Add listing"}
      </button>
    </form>
  );
}
