"use client";
import {
  Fragment,
  useState,
  memo,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { Marker, NavigationControl } from "react-map-gl/maplibre";
import { createClient } from "@/utils/supabase/client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { Drawer } from "vaul";

import StorageImage from "@/components/StorageImage";

import PeelsMap from "@/components/PeelsMap";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";
import { useSearchParams, useRouter } from "next/navigation";

import turfDistance from "@turf/distance";

import ListingHeader from "@/components/ListingHeader";
import ListingItemList from "@/components/ListingItemList";
import { getListingDisplayName } from "@/utils/listing";

import Hyperlink from "@/components/Hyperlink";

import ListingChatDrawer from "@/components/ListingChatDrawer";

const Column = styled("section")({
  // Inherit same flex properties as parent, given these columns should be invisible when drawer
  // flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
  maxWidth: "720px",

  "& p + p": {
    marginTop: "0.5rem",
  },
});

const ButtonGroup = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

const PhotosList = styled("ul")(({ theme }) => ({
  display: "flex",
  gap: "0.5rem",
  overflowX: "scroll",

  "& li": {
    flexShrink: 0,
    borderRadius: "0.25rem",
    boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
    overflow: "hidden",
  },
}));

const ListingPhotoStorageImage = styled(StorageImage)(({ theme }) => ({
  mixBlendMode: "multiply", // So box-shadow on parent is visible
  // width: "100px",
  // height: "10rem",
  objectFit: "cover",
  backgroundColor: theme.colors.background.map,
  cursor: "zoom-in",
}));

// A much fancier version than just using whiteSpace: "pre-wrap", which renders looking like a completely new empty paragraph in between lines
const ParagraphWithLineBreaks = ({ text }) => {
  const paragraphs = text.split("\n").filter((line) => line.trim() !== ""); // Split by line breaks and filter out empty lines
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p> // Render each line as a separate paragraph
      ))}
    </>
  );
};

// Memoize the Listing component
const ListingRead = memo(function Listing({
  user,
  listing,
  setSelectedListing,
  isDrawer,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
}) {
  const [existingThread, setExistingThread] = useState(null);
  const supabase = createClient();

  // Load existing thread if any
  useEffect(() => {
    async function loadExistingThread() {
      // console.log("Loading existing thread for listing:", listing.slug);

      const { data: thread, error } = await supabase
        .from("chat_threads_with_participants")
        .select(
          `
          *,
          chat_messages_with_senders (*)
        `
        )
        .match({
          listing_id: listing.id,
          initiator_id: user.id,
          owner_id: listing.owner_id,
        })
        .maybeSingle();

      if (error) {
        console.error("Error loading thread:", error);
        return;
      }

      setExistingThread(thread);
    }

    if (user && listing) {
      loadExistingThread();
    }
  }, [listing?.id, user?.id]);

  const [mapZoomLevel, setMapZoomLevel] = useState(null);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);

  const listingDisplayName = getListingDisplayName(listing, user);

  if (!listing) return null;

  return (
    <Fragment key={listing.id}>
      <Column>
        <ListingHeader
          listing={listing}
          listingName={listingDisplayName}
          user={user}
        />

        <ListingChatDrawer
          isNested={isDrawer}
          user={user}
          listing={listing}
          isChatDrawerOpen={isChatDrawerOpen}
          setIsChatDrawerOpen={setIsChatDrawerOpen}
          existingThread={existingThread}
          listingDisplayName={listingDisplayName}
        />

        {listing.description && (
          <section>
            <h3>
              {listing.type === "business" ? "Donation details" : "About"}
            </h3>
            <ParagraphWithLineBreaks text={listing.description} />
          </section>
        )}

        {listing.accepted_items?.length > 0 && (
          <section>
            <h3>Accepted</h3>
            <ListingItemList items={listing.accepted_items} type="accepted" />
          </section>
        )}

        {listing.rejected_items?.length > 0 && (
          <section>
            <h3>Not accepted</h3>
            <ListingItemList items={listing.rejected_items} type="rejected" />
          </section>
        )}
      </Column>

      <Column>
        {!isDrawer && (
          <section>
            <h3>Location</h3>
            <PeelsMap
              style={{ height: "320px" }}
              interactive={false}
              initialViewState={{
                longitude: listing.longitude,
                latitude: listing.latitude,
                zoom: initialZoomLevel,
              }}
            >
              <Marker
                longitude={listing.longitude}
                latitude={listing.latitude}
                anchor="center"
              >
                <MapPin selected={true} type={listing.type} />
              </Marker>
              <NavigationControl showCompass={false} />
            </PeelsMap>

            {listing.type === "residential" && (
              <p>
                {listingDisplayName} is a resident of{" "}
                {listing.area_name ? listing.area_name : "this area"}. Ask them
                for their exact location when you arrange a food scrap drop-off.
              </p>
            )}
            {listing.type === "community" && listing.area_name && (
              <p>
                {listingDisplayName} is a located in {listing.area_name}.
              </p>
            )}
            {listing.type === "business" && listing.area_name && (
              <p>
                {listingDisplayName} is a business located in{" "}
                {listing.area_name}.
              </p>
            )}

            <ButtonGroup>
              <Button
                variant="secondary"
                size="small"
                href={`/map?listing=${listing.slug}`}
              >
                See nearby listings
              </Button>
              {listing.type !== "residential" && (
                <>
                  <Button
                    variant="secondary"
                    size="small"
                    href={`https://maps.apple.com/?ll=${listing.latitude},${listing.longitude}&q=${encodeURIComponent(
                      listing.name
                    )}`}
                    target="_blank"
                  >
                    Open in Apple Maps
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                  >
                    Open in Google Maps
                  </Button>
                </>
              )}
            </ButtonGroup>
          </section>
        )}

        {listing.photos?.length > 0 &&
          (!listing.type === "residential" || user) && (
            <section>
              <h3>Photos</h3>
              <PhotosList>
                {listing.photos.map((photo, index) => (
                  <li key={index}>
                    <ListingPhotoStorageImage
                      bucket="listing_photos"
                      filename={photo}
                      alt={`Listing photo ${index + 1}`}
                      width={300}
                      height={220}
                    />
                  </li>
                ))}
              </PhotosList>
            </section>
          )}

        {listing.links?.length > 0 && (
          <section>
            <h3>Links</h3>
            <ListingItemList items={listing.links} type="links" />
          </section>
        )}

        {!user && listing.type === "residential" && (
          <p>
            <Hyperlink href="/sign-in">Sign in</Hyperlink> to see more about
            this host.
          </p>
        )}

        {isDrawer && (
          <Button
            variant="secondary"
            size="small"
            width="contained"
            href={`/listings/${listing.slug}`}
          >
            View full listing
          </Button>
        )}
      </Column>
    </Fragment>
  );
});

export default ListingRead;
