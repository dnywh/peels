"use client";
import { Fragment, useState, memo, useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { Marker, NavigationControl } from "react-map-gl/maplibre";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { getListingDisplayName } from "@/utils/listingUtils";
import { parseTextWithLinks } from "@/utils/linkUtils";
import ListingHeader from "@/components/ListingHeader";
import ListingItemList from "@/components/ListingItemList";
import ListingPhotoGallery from "@/components/ListingPhotoGallery";
import MapThumbnail from "@/components/MapThumbnail";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import ListingChatDrawer from "@/components/ListingChatDrawer";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

import type { DemoListing, Listing } from "@/types/listing";

type Presentation = "full" | "drawer" | "demo";

type ListingReadListing = Listing | DemoListing;

type ListingReadProps = {
  user: User | null;
  listing: ListingReadListing | null;
  presentation?: Presentation;
};

function isDemoListing(
  listing: ListingReadListing | null
): listing is DemoListing {
  return Boolean(listing && (listing as DemoListing).is_demo === true);
}

const ListingRead = memo(function Listing({
  user,
  listing,
  presentation = "full",
}: ListingReadProps) {
  const t = useTranslations();
  // Hooks must be called unconditionally; router is unused in demo mode.
  const router = useRouter();

  const [existingThread, setExistingThread] = useState<unknown>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState<number | null>(null);
  // Chat drawer state is owned here so that each selected listing gets a
  // fresh drawer. The parent resets this by remounting with `key`.
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const supabase = presentation !== "demo" ? createClient() : null;

  const isDemo = presentation === "demo";
  const demoListing = isDemoListing(listing) ? listing : null;
  const realListing =
    !isDemo && listing && !isDemoListing(listing) ? (listing as Listing) : null;

  // Load existing thread if any (only if not in demo mode)
  useEffect(() => {
    if (isDemo || !supabase || !user || !realListing) return;

    // TODO: Should this only be called when the actual ListingChatDrawer is loaded?
    async function loadExistingThread() {
      if (!supabase || !user || !realListing) return;
      const { data: thread, error } = await supabase
        .from("chat_threads_with_participants")
        .select(
          `
          *,
          chat_messages_with_senders (*)
        `
        )
        .match({
          listing_id: realListing.id,
          initiator_id: user.id,
          owner_id: realListing.owner_id,
        })
        .maybeSingle();

      if (error) {
        console.error("Error loading thread:", error);
        return;
      }

      setExistingThread(thread);
    }

    loadExistingThread();
  }, [realListing?.id, user?.id, isDemo, supabase, realListing]);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);

  const listingDisplayName: string = isDemo
    ? (demoListing?.name ?? demoListing?.owner_first_name ?? "")
    : realListing
      ? getListingDisplayName(realListing, user)
      : "";

  const coordinates = realListing?.coordinates ?? null;

  if (!listing && !isDemo) {
    return null;
  }

  return (
    <Fragment key={realListing?.id ? realListing.id : undefined}>
      <ColumnMain presentation={presentation}>
        <ListingHeader
          presentation={presentation}
          listing={listing}
          listingName={listingDisplayName}
          user={user}
        />

        {isDemo && demoListing ? (
          <DemoButtonContainer>
            <Button variant="primary" width="full" href="/#contact">
              {t("Listings.read.contact", {
                name: demoListing.owner_first_name ?? demoListing.name ?? "",
              })}
            </Button>
          </DemoButtonContainer>
        ) : realListing ? (
          <ListingChatDrawer
            isNested={presentation === "drawer"}
            user={user}
            listing={realListing}
            isChatDrawerOpen={isChatDrawerOpen}
            setIsChatDrawerOpen={setIsChatDrawerOpen}
            existingThread={existingThread}
            listingDisplayName={listingDisplayName}
          />
        ) : null}

        <ListingContents presentation={presentation}>
          {listing?.description && (
            <ListingSection>
              <h3>
                {listing.type === "business"
                  ? t("Listings.read.donationDetails")
                  : t("Listings.read.about")}
              </h3>
              <MultiParagraphCluster text={listing.description} />
            </ListingSection>
          )}

          {listing?.accepted_items && listing.accepted_items.length > 0 && (
            <ListingSection>
              <h3>{t("Listings.read.accepted")}</h3>
              <ListingItemList items={listing.accepted_items} type="accepted" />
            </ListingSection>
          )}

          {listing?.rejected_items && listing.rejected_items.length > 0 && (
            <ListingSection>
              <h3>{t("Listings.read.rejected")}</h3>
              <ListingItemList items={listing.rejected_items} type="rejected" />
            </ListingSection>
          )}
        </ListingContents>
      </ColumnMain>

      {realListing && !isDemo && (
        <ColumnMinor presentation={presentation}>
          {presentation !== "drawer" && coordinates && (
            <ListingSection presentation={presentation}>
              <h3>{t("Listings.read.location")}</h3>

              <MapThumbnail
                height="320px"
                initialViewState={{
                  longitude: coordinates.longitude,
                  latitude: coordinates.latitude,
                  zoom: initialZoomLevel,
                }}
                interactive={false}
              >
                <Marker
                  longitude={coordinates.longitude}
                  latitude={coordinates.latitude}
                  anchor="center"
                  onClick={(event) => {
                    event.originalEvent.stopPropagation();
                    router.push(`/map?listing=${realListing.slug}`);
                  }}
                >
                  <MapPin
                    selected={true}
                    type={realListing.type ?? undefined}
                  />
                </Marker>
                <NavigationControl showCompass={false} />
              </MapThumbnail>

              <MapDetails>
                {realListing.type === "residential" ? (
                  <p>
                    {t("Listings.read.residentialLocation", {
                      name: listingDisplayName,
                      area: realListing.area_name
                        ? realListing.area_name
                        : t("Listings.read.thisArea"),
                    })}
                  </p>
                ) : (
                  <p>
                    {t("Listings.read.nonResidentialLocation", {
                      name: listingDisplayName,
                      type:
                        realListing.type === "business"
                          ? t("Listings.read.businessType")
                          : realListing.type === "community"
                            ? t("Listings.read.communityType")
                            : "",
                      area: realListing.area_name ?? "",
                    })}
                  </p>
                )}

                <ButtonGroup>
                  <Button
                    variant="secondary"
                    size="small"
                    href={`/map?listing=${realListing.slug}`}
                  >
                    {t("Actions.seeNearbyListings")}
                  </Button>
                  {realListing.type !== "residential" && (
                    <>
                      <Button
                        variant="secondary"
                        size="small"
                        href={`https://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&q=${encodeURIComponent(
                          realListing.name ?? ""
                        )}`}
                        target="_blank"
                      >
                        {t("Actions.openInAppleMaps")}
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        href={`https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`}
                        target="_blank"
                      >
                        {t("Actions.openInGoogleMaps")}
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </MapDetails>
            </ListingSection>
          )}

          {realListing.photos && realListing.photos.length > 0 && (
            <ListingSection
              presentation={presentation}
              overflowX={
                !user && realListing.type === "residential"
                  ? undefined
                  : "visible"
              }
            >
              <h3>{t("Common.photos")}</h3>
              {!user && realListing.type === "residential" ? (
                <p>
                  {t.rich("Listings.read.signInForPhotos", {
                    link: (chunks: ReactNode) => (
                      <StrongLink href="/sign-in">{chunks}</StrongLink>
                    ),
                  })}
                </p>
              ) : (
                <ListingPhotoGallery
                  presentation={presentation}
                  photos={realListing.photos}
                />
              )}
            </ListingSection>
          )}

          {realListing.links && realListing.links.length > 0 && (
            <ListingSection presentation={presentation}>
              <h3>{t("Common.links")}</h3>
              <ListingItemList items={realListing.links} type="links" />
            </ListingSection>
          )}

          {presentation === "drawer" && (
            <ListingSection>
              <Button
                variant="secondary"
                size="small"
                width="contained"
                href={`/listings/${realListing.slug}`}
              >
                {t("Actions.viewFullListing")}
              </Button>
            </ListingSection>
          )}
        </ColumnMinor>
      )}
    </Fragment>
  );
});

export default ListingRead;

type PresentationVariantProps = {
  presentation?: Presentation;
  children?: ReactNode;
};

type ListingSectionVariantProps = PresentationVariantProps & {
  overflowX?: "visible";
};

// Pigment's variant typing narrows shared props to the first variant's literal.
// Cast the `styled()` factory so our variant props survive as a string union.
type StyledWithVariants<P> = (arg: unknown) => ComponentType<P>;

const styledDivWithPresentation = styled(
  "div"
) as unknown as StyledWithVariants<PresentationVariantProps>;
const styledSectionWithSection = styled(
  "section"
) as unknown as StyledWithVariants<ListingSectionVariantProps>;

const sharedColumnStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
};

const ColumnMain = styledDivWithPresentation(({ theme }: { theme: any }) => ({
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

const ColumnMinor = styledDivWithPresentation(({ theme }: { theme: any }) => ({
  ...sharedColumnStyles,

  variants: [
    {
      props: { presentation: "full" },
      style: {
        "@media (min-width: 1280px)": {
          gap: "1.5rem",
        },
      },
    },
  ],
}));

const ListingContents = styledDivWithPresentation(
  ({ theme }: { theme: any }) => ({
    display: "flex",
    flexDirection: "column",
    gap: "3rem",

    variants: [
      {
        props: { presentation: "full" },
        style: {
          padding: "1.5rem 0",
          backgroundColor: theme.colors.background.top,
          border: `1px solid ${theme.colors.border.base}`,
          borderRadius: theme.corners.base,

          "@media (min-width: 768px)": {
            padding: "0 0.5rem",
            backgroundColor: "unset",
            border: "unset",
            borderRadius: "unset",
          },
        },
      },
    ],
  })
);

const ListingSection = styledSectionWithSection(
  ({ theme }: { theme: any }) => ({
    padding: " 0 1rem",

    "& h3": {
      fontWeight: "500",
      marginBottom: "0.5rem",
      color: theme.colors.text.ui.secondary,
    },

    "& p + p": {
      marginTop: "0.5rem",
      color: theme.colors.text.ui.primary,
    },

    variants: [
      {
        props: { overflowX: "visible" },
        style: {
          padding: "0",
          overflowX: "visible",

          "& h3": {
            padding: "0 1rem",
          },
        },
      },
      {
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
              padding: "0 1.5rem",
            },
          },
        },
      },
    ],
  })
);

const DemoButtonContainer = styled("div")({
  padding: "0 1rem",
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

// Split by line breaks and render each paragraph with inline link parsing.
function MultiParagraphCluster({ text }: { text: string }) {
  const paragraphs = text.split("\n").filter((line) => line.trim() !== "");
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {parseTextWithLinks(paragraph).map((part, i) =>
            typeof part === "string" ? (
              part
            ) : (
              <StrongLink key={i} href={part.href} target="_blank">
                {part.text}
              </StrongLink>
            )
          )}
        </p>
      ))}
    </>
  );
}
