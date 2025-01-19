"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { debounce } from "lodash";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { Drawer } from "vaul";
const snapPoints = [0.35, 1];

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import { config, geolocation } from "@maptiler/client";

import MapSearch from "@/components/MapSearch";
import MapRender from "@/components/MapRender";
import ListingRead from "@/components/ListingRead";
import GuestActions from "@/components/GuestActions";
import StorageImage from "@/components/StorageImage";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MapSidebar from "@/components/MapSidebar";
import LoremIpsum from "../LoremIpsum";

import { styled } from "@pigment-css/react";
import { getListingDisplayName, getListingDisplayType } from "@/utils/listing";
import { useDeviceContext } from "@/hooks/useDeviceContext";

const sidebarWidth = "clamp(20rem, 30vw, 30rem)";
const pagePadding = "24px";
const ZOOM_LEVEL_DEFAULT = 11;

// TEMPORARY: Copied up here for the hardcoded coordinates
// TODO: Remove and allow dynamic location fetch from IP, keep the copy in MapRender
// Default coordinates for Brisbane, Australia
const DEFAULT_COORDINATES = {
  longitude: 153.0322,
  latitude: -27.415,
  zoom: 9,
};

// For IP geolocation API
config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

const StyledMapPage = styled("main")({
  flex: 1,
  gap: "1.5rem",
  alignItems: "stretch",
  // background: "red",
  display: "flex",
  flexDirection: "row",
  // gap: "1.5rem",
  // width: "100dvw",
  // height: "100dvh",

  // overflow: "hidden",
  // touchAction: "none",
  // pointerEvents: "none",

  // Doesn't work:
  // "& html": {
  //   overflow: "hidden",
  //   overscrollBehavior: "none",
  // },
});

const StyledMapWrapper = styled("div")(({ theme }) => ({
  // marginBottom: "80px", //Equal to height of tab bar

  // overflow: "hidden",
  // touchAction: "none",
  // overscrollBehavior: "none",

  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flex: 1,
  // touchAction: "none",

  // Prepare for tab bar on mobile
  height: "100%",
  "@media (min-width: 768px)": {
    borderRadius: theme.corners.base,
    border: `1px solid ${theme.colors.border.base}`,
    overflow: "hidden",
  },
}));

const ButtonSet = styled("div")({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
  position: "absolute",
  right: "0.75rem",
});

const StyledIconButtonAbsolute = styled(IconButton)({
  position: "absolute",
  right: "0.75rem",
});

const StyledIconButtonStationary = styled(IconButton)({
  position: "relative",
});

const StyledDrawerContent = styled(Drawer.Content)(({ theme }) => ({
  // display: "flex",
  // flexDirection: "column",
  border: `2px solid ${theme.colors.border.base}`, // border-gray-200
  borderBottom: "none",
  borderRadius: `${theme.corners.base}px ${theme.corners.base}px 0 0`,

  position: "fixed",
  bottom: "0",
  left: "0",
  right: "0",

  height: "97%", // Take up full height to prevent awkward drawer pop-ups when minimal content
  // maxHeight: "97%",

  // overscrollBehavior: "unset",
  // margin: "0 -1px", // mx-[-1px]

  background: theme.colors.background.slight,

  border: `0.5px solid ${theme.colors.border.base}`,
  boxShadow: `0px -3px 3px 1px rgba(0, 0, 0, 0.06)`,

  overflowX: "hidden",
  // overflowY: "hidden", // Necessary to focus on the drawer content

  "&::after": {
    display: "none", // Otherwise seems to visibly block the drawer content
  },

  "@media (min-width: 768px)": {
    background: theme.colors.background.top,
    borderRadius: theme.corners.base,
    boxShadow: `-3px 0px 3px 1px rgba(0, 0, 0, 0.03)`,
    // background: "blue",
    // margin: "unset",
    height: "unset",
    top: "24px",
    right: "24px",
    bottom: "24px",
    left: "unset",
    outline: "none",
    width: sidebarWidth,
  },
}));

const StyledDrawerHeader = styled("header")({
  // flex justify-between items-center absolute top-0 w-full py-2 px-4 rounded-t-lg
  flex: 1,

  position: "sticky",
  top: "0",
  // Create a new stacking context to ensure header content stays above avatar whose rotation transform caused a new stacking context
  zIndex: 1,
  width: "100%",

  display: "flex",
  // alignItems: "center",

  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  // padding: "0.5rem 1rem",
});

const StyledDrawerHeaderInner = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",

  padding: "1rem",
  background: theme.colors.background.sunk,
  borderBottom: `1px solid ${theme.colors.border.base}`,
  boxShadow: `0px 1px 8px 0px ${theme.colors.border.base}`,
  // Ensure header content stays above avatar whose rotation transform causes a new stacking context
  // position: "relative",
  // zIndex: 1,

  transform: "translateY(-0.5px)", // Avoid clipping on Retina screens

  "@media (min-width: 768px)": {
    background: theme.colors.background.slight,
    transform: "unset",
  },
}));

const StyledHeaderText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  width: "100%",
  padding: "0 2.5rem", // Padding to account for the icon button

  "& h3, p": {
    lineHeight: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    display: "block",
    textOverflow: "ellipsis",

    fontSize: "0.85rem",
  },
  "& h3": {
    color: theme.colors.text.secondary,
  },
  "& p": {
    color: theme.colors.text.tertiary,
  },
}));

const StyledDrawerInner = styled("div")(({ theme }) => ({
  width: "100%",
  // Normal classes
  padding: "1rem",
  paddingTop: "2rem",
  marginTop: "-3.5rem", // To account for sticky header

  // Attempts to smooth drawer scroll
  // touchAction: "unset !important",
  // pointerEvents: "unset !important",
  overflowY: "auto",

  // Seems to help with drawer scroll getting stuck, possibly placebo
  // overscrollBehavior: "auto",
  // touchAction: "pan-y", // Prevents zoom gesture which stuffs up general layout, should be revisted for accessibility

  // Set same flex properties in ListingRead > Column, given these columns should be invisible when drawer
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
}));

const NoListingFound = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  textAlign: "center",
  textWrap: "balance",
  padding: "2rem",
  color: theme.colors.text.secondary,

  "& div": {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
}));

// export default async function MapPage() {
export default function MapPageClient({ user }) {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const drawerContentRef = useRef(null);
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const [countryCode, setCountryCode] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  // Set mapController to set relationship between MapSearch and MapRender
  const [mapController, setMapController] = useState(); // https://docs.maptiler.com/react/maplibre-gl-js/geocoding-control/

  const [isLoading, setIsLoading] = useState(true);
  // const [isDesktop, setIsDesktop] = useState(false);
  const [snap, setSnap] = useState(snapPoints[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState(null);

  const { isDesktop, hasTouch } = useDeviceContext();

  useEffect(() => {
    if (isDesktop) {
      setSnap(snapPoints[1]);
      console.log("Viewport is desktop");
    } else {
      console.log("Viewport is mobile");
    }
  }, [isDesktop]);

  useEffect(() => {
    console.log("Managing HTML classes", { hasTouch, snap });
    const listingSlug = searchParams.get("listing");

    if (isDesktop) return;

    // Always add map class for touch devices
    document.documentElement.classList.add("map");

    // Manage drawer-fully-open class based on both snap AND URL state
    if (snap === snapPoints[1] && listingSlug) {
      console.log("Drawer is open, adding class to HTML");
      document.documentElement.classList.add("drawer-fully-open");
    } else {
      console.log("Drawer is closed or no listing, removing class from HTML");
      document.documentElement.classList.remove("drawer-fully-open");
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove("map");
      document.documentElement.classList.remove("drawer-fully-open");
    };
  }, [snap, isDesktop, searchParams]); // Include all dependencies

  // Load listing from URL param on mount
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (listingSlug) {
      loadListingBySlug(listingSlug);
      // If there is a selected listing upon mount, open the drawerc
      setIsDrawerOpen(true);
    } else {
      // Clear selected listing if no slug in URL
      // setSelectedListing(null);
      // If the user traversed the history back to where there was (possibly) no slug, close the drawer
      setIsDrawerOpen(false);
      setSelectedPinId(null);
    }
  }, [searchParams]); // This will run when the URL changes

  // Add this new effect to handle initial location
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    // Only fetch IP location if there's no listing in URL
    if (!listingSlug) {
      // TEMPORARY: Hardcoded coordinates for Brisbane, Australia
      setInitialCoordinates({
        latitude: DEFAULT_COORDINATES.latitude,
        longitude: DEFAULT_COORDINATES.longitude,
        zoom: ZOOM_LEVEL_DEFAULT,
      });

      // TODO: un-comment the below and remove the hardcoded coordinates

      //   // TODO: see if there is location data already set from local storage, and return that first if so
      //   // Perhaps do this on the homepage/first page loaded and then use that data for the map
      //   // And then store that data in local storage for future use in the same session/browser
      //   async function initializeLocation() {
      //     console.log("No listing slug. Initializing location");

      //     try {
      //       // Create a timeout promise
      //       const timeoutPromise = new Promise((_, reject) => {
      //         setTimeout(() => reject(new Error("Location timeout")), 3000);
      //       });

      //       // Race between the geolocation request and timeout
      //       const response = await Promise.race([
      //         geolocation.info(),
      //         timeoutPromise,
      //       ]);

      //       if (response && response.latitude && response.longitude) {
      //         setCountryCode(response.country_code); // Used in MapSearch until proximity feature is fixed
      //         setInitialCoordinates({
      //           latitude: response.latitude,
      //           longitude: response.longitude,
      //           zoom: ZOOM_LEVEL_DEFAULT, // TODO: Increase zoom when more listings are available. Also in MapRender
      //         });
      //       }
      //     } catch (error) {
      //       console.warn(
      //         "Could not determine location from MapTiler:",
      //         error.message
      //       );
      //       // No need to set fallback coordinates - MapRender will handle that
      //     }
      //   }

      //   initializeLocation();
    }
  }, []);

  const loadListingBySlug = async (slug) => {
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        profiles (
          first_name,
          avatar
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      setSelectedListing({ error: true, message: "Listing not found" });
      return;
    }

    setSelectedListing(data);
  };

  const debouncedBoundsChange = useCallback(
    debounce(async (bounds) => {
      setIsLoading(true);
      try {
        const data = await fetchListingsInView(
          bounds._sw.lat,
          bounds._sw.lng,
          bounds._ne.lat,
          bounds._ne.lng
        );
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms delay
    []
  );

  const handleBoundsChange = useCallback(
    async (bounds) => {
      debouncedBoundsChange(bounds);
    },
    [debouncedBoundsChange]
  );

  const handleSnapChange = () => {
    console.log("Handling snap change", snap, snapPoints[0]);
    if (snap === snapPoints[0]) {
      setSnap(snapPoints[1]);
    } else {
      if (drawerContentRef.current) {
        drawerContentRef.current.scrollTop = 0;
      }
      setSnap(snapPoints[0]);
    }
  };

  const handleMarkerClick = async (listingId) => {
    // If the clicked marker is already selected AND the drawer is already open, do nothing and return early
    if (selectedListing?.id === listingId && isDrawerOpen) {
      return;
    }
    // Otherwise load the listing details for the new marker
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        profiles (
          first_name,
          avatar
        )
      `
      )
      .eq("id", listingId)
      .single();

    if (error) {
      setSelectedListing({ error: true, message: "Listing not found" });
      return;
    }

    // Close the chat drawer if it's open
    setIsChatDrawerOpen(false);
    // Prepare the listing drawer for the new listing
    setSelectedListing(data);
    // Open the listing drawer
    setIsDrawerOpen(true); // Open drawer when marker is clicked
    setSnap(snapPoints[0]); // Reset snap point
    setIsDrawerHeaderShown(false); // Reset header shown state

    // Scroll to the top of the drawer content in case the scrollTop is not 0
    if (drawerContentRef.current) {
      drawerContentRef.current.scrollTop = 0; // Reset scroll position
      console.log("Scrolled to top of drawer content");
    }

    router.push(`/map?listing=${data.slug}`, { scroll: false });
  };

  const handleMapClick = () => {
    console.log("Map clicked without marker click");
    if (selectedListing) {
      handleCloseListing();
      setIsDrawerOpen(false);
      setIsChatDrawerOpen(false);
    }
  };

  // Mobile scroll listener
  useEffect(() => {
    if (isDesktop || (!isDesktop && snap !== 1)) {
      setIsDrawerHeaderShown(false);
      return;
    }

    console.log("Setting up mobile scroll listener");

    const handleScroll = () => {
      if (drawerContentRef.current) {
        const scrollTop = drawerContentRef.current.scrollTop;
        setIsDrawerHeaderShown(scrollTop > 16); // When to show sticky drawer header
      }
    };

    if (drawerContentRef.current) {
      console.log("Adding mobile scroll listener");
      drawerContentRef.current.addEventListener("scroll", handleScroll);
    } else {
      console.warn(
        "drawerContentRef.current is null for mobile, cannot add scroll listener."
      );
    }

    return () => {
      if (drawerContentRef.current) {
        drawerContentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [snap]); // Only depends on snap for mobile

  // Desktop scroll listener
  useEffect(() => {
    if (isDesktop && isDrawerOpen) {
      console.log("Setting up desktop scroll listener");

      const handleScroll = () => {
        if (drawerContentRef.current) {
          const scrollTop = drawerContentRef.current.scrollTop;
          // console.log("Desktop Scroll position:", scrollTop);
          setIsDrawerHeaderShown(scrollTop > 16);
        }
      };

      const observer = new MutationObserver(() => {
        const drawerContent = drawerContentRef.current;
        if (drawerContent) {
          console.log("Adding desktop scroll listener");
          drawerContent.addEventListener("scroll", handleScroll);
          observer.disconnect(); // Stop observing once the listener is added
        }
      });

      // Start observing the drawer content for changes
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect(); // Clean up the observer on unmount
      };
    }
  }, [isDesktop, isDrawerOpen]); // Depends on isDesktop and isDrawerOpen for desktop

  const handleSearchPick = useCallback((event) => {
    // console.log("searchInputRef", searchInputRef);
    // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
    // Return early if that's the case
    if (!event.feature?.center) return;

    console.log("Search picked", event);
    // Blur the input
    // Not needed because the Geocoding component handles this
    // Delete ref and prop drilling if I don't end up using it for other reasons
    // searchInputRef.current.blur();

    // Return those new coordinates
    const nextCoordinates = {
      latitude: event.feature?.center[1],
      longitude: event.feature?.center[0],
    };

    console.log("Flying to", nextCoordinates);
    mapRef.current?.flyTo({
      center: [nextCoordinates.longitude, nextCoordinates.latitude],
      duration: 3200, // TODO: Make this dynamic based on distance from current location
      zoom: ZOOM_LEVEL_DEFAULT, // Defaulting to a conservative amount of zoomed-out. TODO: set zoom level dynamically based on how many listings are around the area
    });
  }, []);

  const handleCloseListing = useCallback(() => {
    console.log("Closing listing");
    setIsDrawerOpen(false);
    setIsChatDrawerOpen(false);
    setSelectedPinId(null);
    setSnap(snapPoints[0]); // Helps to remove conditional CSS class from html

    // Explicitly remove the class
    // This is ignored for some reason on popstate, so commenting out to make clear.
    // console.log("Removing drawer-fully-open class");
    // document.documentElement.classList.remove("drawer-fully-open");

    router.push("/map", { scroll: false, shallow: true });
  }, [router]);

  // Add an effect to handle browser back/forward
  useEffect(() => {
    // Check URL state whenever searchParams changes
    const listingSlug = searchParams.get("listing");

    if (!listingSlug) {
      // No listing in URL, ensure drawer-fully-open is removed
      console.log("No listing in URL, removing drawer-fully-open class");
      document.documentElement.classList.remove("drawer-fully-open");
      setSnap(snapPoints[0]);
    }
  }, [searchParams]); // Only depend on searchParams changes

  // useEffect(() => {
  //   const handlePopstate = () => {
  //     // Check if the modal is open on mobile devices
  //     // Replace the condition with your modal open check logic
  //     const isModalOpenOnMobile = true; // Replace with your own logic
  //     if (isModalOpenOnMobile) {
  //       // Close the modal when navigating using browser's back/forward buttons
  //       // Implement your own modal close logic here

  //       console.log("Removing drawer-fully-open class");
  //       document.documentElement.classList.remove("drawer-fully-open");
  //     }
  //   };

  //   window.addEventListener("popstate", handlePopstate);

  //   return () => {
  //     window.removeEventListener("popstate", handlePopstate);
  //   };
  // }, []);

  return (
    <StyledMapPage>
      <StyledMapWrapper>
        <Drawer.Root
          // position={isDesktop ? "right" : undefined}
          direction={isDesktop ? "right" : undefined}
          snapPoints={snapPoints}
          activeSnapPoint={isDesktop ? 1 : snap}
          setActiveSnapPoint={setSnap}
          // snapToSequentialPoint={true}
          modal={isDesktop ? false : snap === snapPoints[1]} // Attempt to help with overscroll/touch events on mobile if header is dragged. Doesn't change anything about the overscroll
          // modal={false}
          open={isDrawerOpen}
          onOpenChange={(open) => {
            // console.log("Drawer open change", open);
          }}
          // onDrag={(drag) => console.log("Drawer drag", drag)}
          // onRelease={(release) => {
          //   console.log("Drawer release", release);
          // }}
          // scrollLockTimeout={1} // Not sure but seems to make the mobile drawer more responsive
          // onAnimationEnd={(event) => {
          //   console.log("Animation ended", event);
          // }}

          // data-vaul-delayed-snap-points={false} // Seems to smooth out some of the snapping but I can't call it
        >
          <MapRender
            mapRef={mapRef}
            searchInputRef={searchInputRef}
            listings={listings}
            selectedListing={selectedListing}
            initialCoordinates={initialCoordinates}
            onBoundsChange={handleBoundsChange}
            isLoading={isLoading}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onSearchPick={handleSearchPick}
            setMapController={setMapController}
            DrawerTrigger={Drawer.Trigger}
            selectedPinId={selectedPinId}
            setSelectedPinId={setSelectedPinId}
            isDesktop={isDesktop}
            countryCode={countryCode}
          />

          <Drawer.Portal>
            <StyledDrawerContent
              ref={drawerContentRef}
              data-vaul-no-drag={isDesktop ? true : undefined}
              data-testid="content" // Not sure if this is needed
              // Desktop drawer offset
              // style={{ "--initial-transform": "calc(100% - 420px)" }}
              style={{
                overflowY: snap === 1 || isDesktop ? "auto" : "hidden",
              }}
            >
              <VisuallyHidden.Root>
                <Drawer.Title>Nested chat drawer</Drawer.Title>
                <Drawer.Description>
                  Test description for aria.
                </Drawer.Description>
              </VisuallyHidden.Root>
              {/* <IconButton onClick={handleChatClose}>Close</IconButton> */}

              <StyledDrawerHeader>
                <StyledDrawerHeaderInner
                  style={{
                    transition: "opacity 0.1s ease",
                    // opacity: isDrawerHeaderShown ? 1 : 0,
                    opacity: isDrawerHeaderShown ? 1 : 0,
                    // height: isDrawerHeaderShown ? "100px" : "0",
                  }}
                >
                  <StyledHeaderText>
                    <h3 style={{ fontSize: "0.85rem" }}>
                      {getListingDisplayName(selectedListing, user)}
                    </h3>
                    <p>{getListingDisplayType(selectedListing)}</p>
                  </StyledHeaderText>
                </StyledDrawerHeaderInner>

                {!hasTouch && !isDesktop ? (
                  <ButtonSet>
                    <StyledIconButtonStationary
                      action={snap === snapPoints[0] ? "maximize" : "minimize"}
                      onClick={handleSnapChange}
                    />
                    <StyledIconButtonStationary
                      action="close"
                      onClick={handleCloseListing}
                    />
                  </ButtonSet>
                ) : (
                  <StyledIconButtonAbsolute
                    action="close"
                    onClick={handleCloseListing}
                  />
                )}
              </StyledDrawerHeader>

              {/* Begin drawer main content */}
              {/* Page content */}
              <StyledDrawerInner

              // data-vaul-no-drag
              // style={{
              //   overflowY: snap === snapPoints[1] || isDesktop ? "auto" : "hidden",
              //   overscrollBehavior:
              //     snap === snapPoints[1] && !isDesktop ? "auto" : "auto",
              // }}
              >
                {selectedListing?.error ? (
                  <NoListingFound>
                    <div>
                      <h2>Coming up empty</h2>
                      <p>
                        The listing you’re looking for doesn’t exist or has been
                        removed. Sorry to disappoint.
                      </p>
                    </div>
                    <Button onClick={handleCloseListing}>Return to map</Button>
                  </NoListingFound>
                ) : (
                  <ListingRead
                    user={user}
                    listing={selectedListing}
                    setSelectedListing={handleCloseListing}
                    isDrawer={true}
                    isDesktop={isDesktop}
                    isChatDrawerOpen={isChatDrawerOpen}
                    setIsChatDrawerOpen={setIsChatDrawerOpen}
                    pagePadding={pagePadding}
                    sidebarWidth={sidebarWidth}
                  />
                )}
              </StyledDrawerInner>
            </StyledDrawerContent>
          </Drawer.Portal>
        </Drawer.Root>
      </StyledMapWrapper>
      {isDesktop && <MapSidebar user={user} covered={isDrawerOpen} />}
    </StyledMapPage>
  );
}
