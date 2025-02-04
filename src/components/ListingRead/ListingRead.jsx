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

import { useSearchParams, useRouter } from "next/navigation";

import { getListingDisplayName } from "@/utils/listing";

import turfDistance from "@turf/distance";

import ListingHeader from "@/components/ListingHeader";
import ListingItemList from "@/components/ListingItemList";
import ListingPhotoGallery from "@/components/ListingPhotoGallery";
import RemoteImage from "@/components/RemoteImage";
import MapThumbnail from "@/components/MapThumbnail";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import ListingChatDrawer from "@/components/ListingChatDrawer";
import Hyperlink from "@/components/Hyperlink";

import { styled } from "@pigment-css/react";

const sharedColumnStyles = {
  // Inherit same flex properties as parent, given these columns should be invisible when drawer
  display: "flex",
  flexDirection: "column",
  gap: "3rem", // Match in MapPageClient (StyledDrawerInner)
};

const ColumnMain = styled("div")(({ theme }) => ({
  ...sharedColumnStyles,

  variants: [
    {
      props: { presentation: "full" },
      style: {
        "@media (min-width: 768px)": {
          padding: "2rem 0",
          backgroundColor: theme.colors.background.top,
          border: `1px solid ${theme.colors.border.base}`,
          borderRadius: theme.corners.base,
        },
      },
    },
  ],
}));

const ColumnMinor = styled("div")(({ theme }) => ({
  ...sharedColumnStyles,

  variants: [
    {
      props: { presentation: "full" },
      style: {
        // Make second column gap smaller on larger breakpoint

        "@media (min-width: 1280px)": {
          gap: "1.5rem",
        },
      },
    },
  ],
}));

const Cluster = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "3rem", // Match in MapPageClient (StyledDrawerInner)

  // Match styling of other sections
  variants: [
    {
      props: { presentation: "full" },
      style: {
        padding: "1.5rem 0",
        backgroundColor: theme.colors.background.top,
        border: `1px solid ${theme.colors.border.base}`,
        borderRadius: theme.corners.base,

        "@media (min-width: 768px)": {
          padding: "0 0.5rem", // 0.5rem + 1rem = 1.5rem used elsewhere in 'naked' ListingReadSection instances
          backgroundColor: "unset",
          border: "unset",
          borderRadius: "unset",
        },
      },
    },
  ],
}));

const ListingReadSection = styled("section")(({ theme }) => ({
  // width: "100%",
  padding: " 0 1rem", // Pad by default ,override on Photos section (overflowX: "visible")

  "& h3": {
    marginBottom: "0.5rem",
  },

  "& p + p": {
    // Add paragraph spacing
    marginTop: "0.5rem",
  },

  variants: [
    {
      props: { overflowX: "visible" },
      style: {
        padding: "0", // Pad by default, override on Photos section (overflowX: "visible")
        overflowX: "visible",

        "& h3": {
          padding: "0 1rem", // Account for removed padding on parent
        },
      },
    },
    {
      // TODO: This 'overflowX: undefined' is ignored, targeting everything with presentation: full. Ideally I can only target the presentation: full items that DON'T have an overflowX prop defined
      props: { overflowX: undefined, presentation: "full" },
      style: {
        backgroundColor: theme.colors.background.top,
        border: `1px solid ${theme.colors.border.base}`,
        borderRadius: theme.corners.base,

        padding: "1rem 1rem 1.5rem",

        "@media (min-width: 768px)": {
          padding: "1rem 1.5rem 1.5rem",
        },
      },
    },
    {
      props: { overflowX: "visible", presentation: "full" },
      style: {
        padding: "1rem 0 1.5rem",

        "@media (min-width: 768px)": {
          "& h3": {
            padding: "0 1.5rem", // Account for removed padding on parent
          },
        },
      },
    },
  ],
}));

const DemoButtonContainer = styled("div")({
  padding: "0 1rem", // Match padding from other parts of ListingRead
});

const MapDetails = styled("div")(({ theme }) => ({
  marginTop: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  "& p": {
    fontSize: "0.875rem",
    color: theme.colors.text.ui.tertiary,
  },
}));

const ButtonGroup = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

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
  presentation = "full",
  isChatDrawerOpen,
  setIsChatDrawerOpen,
}) {
  const router = presentation !== "demo" ? useRouter() : null;

  const [existingThread, setExistingThread] = useState(null);
  const [mapZoomLevel, setMapZoomLevel] = useState(null);

  // Only initialize Supabase if not in demo mode
  const supabase = presentation !== "demo" ? createClient() : null;

  // Load existing thread if any (only for non-demo mode)
  useEffect(() => {
    if (presentation === "demo" || !supabase || !user || !listing) return;

    // TODO should this only be called when the actual ListingChatDrawer is loaded?
    async function loadExistingThread() {
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

    loadExistingThread();
  }, [listing?.id, user?.id, presentation, supabase]);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);

  const listingDisplayName =
    presentation === "demo"
      ? listing?.name
        ? listing.name
        : listing.owner_first_name
      : getListingDisplayName(listing, user);

  if (!listing && presentation !== "demo") {
    console.log("Listing not found");
    return null;
  }

  return (
    <Fragment key={listing?.id ? listing.id : undefined}>
      <ColumnMain presentation={presentation}>
        <ListingHeader
          listing={listing}
          listingName={listingDisplayName}
          user={user}
        />

        {presentation === "demo" ? (
          <DemoButtonContainer>
            <Button variant="primary" width="full" href="/#contact">
              Contact{" "}
              {listing.owner_first_name
                ? listing.owner_first_name
                : listing.name}
            </Button>
          </DemoButtonContainer>
        ) : (
          <ListingChatDrawer
            isNested={presentation === "drawer" ? true : false}
            user={user}
            listing={listing}
            isChatDrawerOpen={isChatDrawerOpen}
            setIsChatDrawerOpen={setIsChatDrawerOpen}
            existingThread={existingThread}
            listingDisplayName={listingDisplayName}
          />
        )}

        <Cluster presentation={presentation}>
          {listing?.description && (
            <ListingReadSection>
              <h3>
                {listing.type === "business" ? "Donation details" : "About"}
              </h3>
              <ParagraphWithLineBreaks text={listing?.description} />
            </ListingReadSection>
          )}

          {listing?.accepted_items?.length > 0 && (
            <ListingReadSection>
              <h3>What’s accepted</h3>
              <ListingItemList
                items={listing?.accepted_items}
                type="accepted"
              />
            </ListingReadSection>
          )}

          {listing?.rejected_items?.length > 0 && (
            <ListingReadSection>
              <h3>What’s not</h3>
              <ListingItemList
                items={listing?.rejected_items}
                type="rejected"
              />
            </ListingReadSection>
          )}
        </Cluster>
      </ColumnMain>

      {presentation !== "demo" && (
        <ColumnMinor presentation={presentation}>
          {presentation !== "drawer" && (
            <ListingReadSection presentation={presentation}>
              <h3>Location</h3>

              <MapThumbnail
                height="320px"
                initialViewState={{
                  longitude: listing.longitude,
                  latitude: listing.latitude,
                  zoom: initialZoomLevel,
                }}
                interactive={false}
              >
                <Marker
                  longitude={listing.longitude}
                  latitude={listing.latitude}
                  anchor="center"
                  onClick={(event) => {
                    event.originalEvent.stopPropagation();
                    router.push(`/map?listing=${listing.slug}`);
                  }}
                >
                  <MapPin selected={true} type={listing.type} />
                </Marker>
                <NavigationControl showCompass={false} />
              </MapThumbnail>

              <MapDetails>
                {listing.type === "residential" ? (
                  <p>
                    {listingDisplayName} is a resident of{" "}
                    {listing.area_name ? listing.area_name : "this area"}. Ask
                    them for their exact location when you arrange a food scrap
                    drop-off.
                  </p>
                ) : (
                  <p>
                    {listingDisplayName} is{" "}
                    {listing.type === "business"
                      ? "a business"
                      : listing.type === "community"
                        ? "a community spot"
                        : ""}{" "}
                    located in {listing.area_name}.
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
              </MapDetails>
            </ListingReadSection>
          )}

          {listing.photos?.length > 0 && (
            <ListingReadSection
              presentation={presentation}
              overflowX={
                !user && listing.type === "residential" ? undefined : "visible"
              }
            >
              <h3>Photos</h3>
              {!user && listing.type === "residential" ? (
                <p>
                  <Hyperlink href="/sign-in">Sign in</Hyperlink> to see this
                  host’s photos.
                </p>
              ) : (
                <>
                  <ListingPhotoGallery
                    presentation={presentation}
                    photos={listing.photos}
                  />
                </>
              )}
            </ListingReadSection>
          )}

          {/* TODO: Other listings also managed by this owner */}
          {/* {listing.other_listings?.length > 0 && (
          <ListingReadSection>
            <h3>Other listings</h3>
            <ListingItemList items={listing.other_listings} type="other_listings" />
          </ListingReadSection>
        )} */}

          {listing.links?.length > 0 && (
            <ListingReadSection presentation={presentation}>
              <h3>Links</h3>
              <ListingItemList items={listing.links} type="links" />
            </ListingReadSection>
          )}

          {presentation === "drawer" && (
            <ListingReadSection>
              <Button
                variant="secondary"
                size="small"
                width="contained"
                href={`/listings/${listing.slug}`}
              >
                View full listing
              </Button>
            </ListingReadSection>
          )}
        </ColumnMinor>
      )}
    </Fragment>
  );
});

export default ListingRead;
