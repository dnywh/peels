"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { Drawer } from "vaul";
const snapPoints = [0.35, 1];

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

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

const StyledMapRender = styled("div")(({ theme }) => ({
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

const StyledIconButton = styled(IconButton)({
  position: "absolute",
  right: "0.75rem",
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

  background: theme.colors.background.between,

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
  background: theme.colors.background.slight,
  borderBottom: `1px solid ${theme.colors.border.base}`,
  boxShadow: `0px 1px 8px 0px ${theme.colors.border.base}`,
  // Ensure header content stays above avatar whose rotation transform causes a new stacking context
  // position: "relative",
  // zIndex: 1,
}));

const StyledHeaderText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",

  "& h3, p": {
    lineHeight: "100%",
  },
  "& h3": {
    fontSize: "1",
    color: theme.colors.text.secondary,
  },
  "& p": {
    fontSize: "0.85rem",
    color: theme.colors.text.tertiary,
  },
}));

const StyledDrawerInner = styled("div")(({ theme }) => ({
  // Attempts to smooth drawer scroll
  // touchAction: "unset !important",
  // pointerEvents: "unset !important",
  marginTop: "-3.5rem", // To account for sticky header

  overflowY: "auto",

  // Seems to help with drawer scroll getting stuck, possibly placebo
  // overscrollBehavior: "auto",
  // touchAction: "pan-y", // Prevents zoom gesture which stuffs up general layout, should be revisted for accessibility

  // Normal classes
  padding: "1rem",
  paddingTop: "2rem",

  display: "flex",
  flexDirection: "column",
  gap: "3rem",

  // margin: "auto",
  width: "100%",
  // padding: "1rem",
  // backgroundColor: "red",
}));

// export default async function MapPage() {
export default function MapPageClient({ user }) {
  const mapRef = useRef(null);
  const drawerContentRef = useRef(null);
  const [initialCoordinates, setInitialCoordinates] = useState(null);

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
    console.log("snap", snap);

    if (!hasTouch) return;

    // Touch device, continue setting appropriate classes
    // First off, set HTML to not overscroll or zoom if the user interacts with general page (e.g. via pinching on zoom controls)
    document.documentElement.classList.add("map");

    // If the drawer is open, set the HTML to not allow pointer events
    if (snap === 1) {
      console.log("Drawer is open, adding class to HTML");
      document.documentElement.classList.add("drawer-fully-open");
    } else {
      console.log("Drawer is closed, removing class from HTML");
      document.documentElement.classList.remove("drawer-fully-open");
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove("map");
      document.documentElement.classList.remove("drawer-fully-open");
    };
  }, [snap, hasTouch]);

  // Load listing from URL param on mount
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (listingSlug) {
      loadListingBySlug(listingSlug);
      // If there is a selected listing upon mount, open the drawer
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
    if (!listingSlug) {
      // Only fetch IP location if there's no listing in URL
      // TODO: Use MapTiler's API and compare which returns faster
      // TODO: see if there is location data already set from local storage, and return that first if so
      // Perhaps do this on the homepage/first page loaded and then use that data for the map
      // And then store that data in local storage for future use in the same session/browser
      // Consider using that as the default view state for the map for next time (by saving it to Supabase)
      async function initializeLocation() {
        console.log("No listing slug. Initializing location");
        try {
          const response = await fetch("https://freeipapi.com/api/json/", {
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok) throw new Error("IP lookup failed");
          const data = await response.json();

          if (data.latitude && data.longitude) {
            setInitialCoordinates({
              latitude: data.latitude,
              longitude: data.longitude,
              zoom: 9, // Increase zoom when more listings are available
            });
          }
        } catch (error) {
          console.warn("Could not determine location from IP");
        }
      }
      initializeLocation();
    }
  }, []); // Run once on mount

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
      console.error("Error fetching listing details:", error);
      return;
    }

    setSelectedListing(data);
  };

  const handleBoundsChange = useCallback(async (bounds) => {
    setIsLoading(true);
    console.log("Bounds changed. Bounds being sent:", bounds, {
      bottomLeftWest: bounds._sw.lat,
      bottomLeftSouth: bounds._sw.lng,
      topRightNorth: bounds._ne.lat,
      topRightEast: bounds._ne.lng,
    });

    const data = await fetchListingsInView(
      bounds._sw.lat,
      bounds._sw.lng,
      bounds._ne.lat,
      bounds._ne.lng
    );
    // console.log("Data fetched:", data);
    setListings(data);
    setIsLoading(false);
  }, []);

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
      console.error("Error fetching listing details:", error);
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
    if (!isDesktop && snap !== 1) {
      setIsDrawerHeaderShown(false);
      return;
    }

    console.log("Setting up mobile scroll listener");

    const handleScroll = () => {
      if (drawerContentRef.current) {
        const scrollTop = drawerContentRef.current.scrollTop;
        // console.log("Mobile Scroll position:", scrollTop);
        setIsDrawerHeaderShown(scrollTop > 16);
      }
    };

    const drawerContent = drawerContentRef.current;

    if (drawerContent) {
      console.log("Adding mobile scroll listener");
      drawerContent.addEventListener("scroll", handleScroll);
    } else {
      console.warn(
        "drawerContentRef.current is null for mobile, cannot add scroll listener."
      );
    }

    return () => {
      if (drawerContent) {
        drawerContent.removeEventListener("scroll", handleScroll);
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
    // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
    // Return early if that's the case
    if (!event.feature?.center) return;

    console.log("Search picked", event);
    // Blur the input
    // inputRef.current.blur();

    // Return those new coordinates
    const nextCoordinates = {
      latitude: event.feature?.center[1],
      longitude: event.feature?.center[0],
    };

    console.log("Flying to", nextCoordinates);
    mapRef.current?.flyTo({
      center: [nextCoordinates.longitude, nextCoordinates.latitude],
      duration: 1800,
      zoom: 10, // TODO later: start at very zoomed out, zoom in until listings appear in bounding box
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
    const handlePopState = () => {
      console.log("Popstate event searchParams: ", searchParams);
      if (!searchParams.get("listing")) {
        console.log("Popstate event: Removing drawer-fully-open class");
        document.documentElement.classList.remove("drawer-fully-open");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
      {/* <h1>Map for {user ? user.email : "Guest"}</h1> */}
      <StyledMapRender>
        <Drawer.Root
          // position={isDesktop ? "right" : undefined}
          direction={isDesktop ? "right" : undefined}
          snapPoints={snapPoints}
          activeSnapPoint={isDesktop ? 1 : snap}
          setActiveSnapPoint={setSnap}
          // snapToSequentialPoint={true}
          modal={isDesktop ? false : snap === 1} // Attempt to help with overscroll/touch events on mobile if header is dragged. Doesn't change anything about the overscroll
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
          />

          <Drawer.Portal>
            <StyledDrawerContent
              ref={drawerContentRef}
              data-vaul-no-drag={!hasTouch ? true : undefined}
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

                {/* <Drawer.Close className="bg-gray-100 rounded-full p-2">
                  Close
                </Drawer.Close> */}
                <StyledIconButton action="close" onClick={handleCloseListing} />
              </StyledDrawerHeader>

              {/* Begin drawer main content */}
              {/* Page content */}
              <StyledDrawerInner

              // data-vaul-no-drag
              // style={{
              //   overflowY: snap === 1 || isDesktop ? "auto" : "hidden",
              //   overscrollBehavior:
              //     snap === 1 && !isDesktop ? "auto" : "auto",
              // }}
              >
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
                {/* <LoremIpsum /> */}

                {/* {selectedListing ? (
                  <>
                    <ListingRead
                      user={user}
                      listing={selectedListing}
                      setSelectedListing={handleCloseListing}
                      modal={true}
                    />
                    <LoremIpsum />
                  </>
                ) : (
                  <>
                    <MapSearch
                      onPick={handleSearchPick}
                      mapController={mapController}
                    />
                    {user && randomFact && (
                      // TODO
                      // If user has sent >0 messages, show a fun composting fact
                      // Otherwise show the fundamentals (1, 2, 3) of Peels
                      <>
                        <p>{randomFact.fact}</p>
                        {randomFact.source && (
                          <p>Source: {randomFact.source}</p>
                        )}
                      </>
                    )}
                    {!user && (
                      <>
                        <h2>
                          Find a home for your food scraps, wherever you are
                        </h2>
                        <GuestActions />
                      </>
                    )}
                  </>
                )} */}
              </StyledDrawerInner>
            </StyledDrawerContent>
          </Drawer.Portal>
        </Drawer.Root>
      </StyledMapRender>
      {isDesktop && <MapSidebar user={user} covered={isDrawerOpen} />}
    </StyledMapPage>
  );
}
