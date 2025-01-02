"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Drawer } from "vaul";
const snapPoints = [0.35, 1];

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import MapSearch from "@/components/MapSearch";
import MapRender from "@/components/MapRender";
import ListingRead from "@/components/ListingRead";
import GuestActions from "@/components/GuestActions";

import Button from "@/components/Button";
import CloseButton from "@/components/CloseButton";

import { facts } from "@/data/facts";

import { styled } from "@pigment-css/react";
import LoremIpsum from "../LoremIpsum";

import clsx from "clsx";

const StyledMapPage = styled("div")({
  // background: "red",
  display: "flex",
  // flexDirection: "row",
  // gap: "2rem",
  width: "100dvw",
  height: "100dvh",
});

const StyledMapRender = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flex: 1,
  // borderRadius: "0.5rem",
  // overflow: "hidden", // Wrecks it!
});

const StyledSidebar = styled("div")({
  // background: "blue",
  border: "1px solid grey",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "20rem",
  height: "100%",
  // overflow: "scroll",
});

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

  const [randomFact, setRandomFact] = useState(null);

  const [snap, setSnap] = useState(snapPoints[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState(false);

  // const [isDragging, setIsDragging] = useState(false);

  // const handleTouchStart = () => {
  //   console.log("Touch start");
  //   setIsDragging(true);
  // };

  // const handleTouchEnd = () => {
  //   console.log("Touch end");
  //   setIsDragging(false);
  // };

  // const handleDrawerOpenChange = useCallback(
  //   (open, fromMarker = false) => {
  //     console.log("Drawer open change:", open, "fromMarker:", fromMarker);

  //     if (!open && !fromMarker) {
  //       // Only handle drawer closing through this handler
  //       setIsDrawerOpen(false);
  //       if (selectedListing) {
  //         console.log("Closing listing");
  //         handleCloseListing();
  //       }
  //     } else {
  //       setIsDrawerOpen(true);
  //     }
  //   },
  //   [selectedListing]
  // );

  // useEffect(() => {
  //   console.log("snap", snap);
  // }, [snap]);

  useEffect(() => {
    // Only generate a random fact if there is NO selected listing, not when one is opened
    if (!selectedListing) {
      setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
    }
  }, [selectedListing]);

  // Load listing from URL param on mount
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (listingSlug) {
      loadListingBySlug(listingSlug);
      // If there is a selected listing upon mount, open the drawer
      setIsDrawerOpen(true);
    } else {
      // Clear selected listing if no slug in URL
      setSelectedListing(null);
      // If the user traversed the history back to where there was (possibly) no slug, close the drawer
      setIsDrawerOpen(false);
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
              zoom: 5,
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
    console.log("Data fetched:", data);
    setListings(data);
    setIsLoading(false);
  }, []);

  const handleMarkerClick = async (listingId) => {
    // If the clicked marker is already selected, do nothing and return early
    if (selectedListing?.id === listingId) {
      return;
    }

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

    setSelectedListing(data);
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
    }
  };

  useEffect(() => {
    if (snap !== 1) {
      // setIsDrawerHeaderShown(false);
      return;
    }

    console.log("At full snap");

    const handleScroll = () => {
      // console.log(drawerContentRef.current);
      if (drawerContentRef.current) {
        const scrollTop = drawerContentRef.current.scrollTop;
        // console.log("Scroll position:", scrollTop);

        // console.log("Scroll position:", scrollTop);
        if (scrollTop > 340) {
          // Make this equal to the height of the nav bar (64px), since that blocks the software scrollbar
          // console.log("Scrolled more than 0px");
          setIsDrawerHeaderShown(true);
        } else {
          // console.log("Scrolled less than 0px");
          setIsDrawerHeaderShown(false);
        }
      }
    };

    const drawerContent = drawerContentRef.current;

    if (drawerContent) {
      console.log("Adding scroll listener");
      drawerContent.addEventListener("scroll", handleScroll);
    } else {
      console.warn(
        "drawerContentRef.current is null, cannot add scroll listener."
      );
    }

    return () => {
      if (drawerContent) {
        drawerContent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [snap]);

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

  const handleCloseListing = () => {
    console.log("Closing listing");
    setSelectedListing(null);
    // Remove listing param from URL
    router.push("/map", { scroll: false });
  };

  return (
    <StyledMapPage>
      {/* <h1>Map for {user ? user.email : "Guest"}</h1> */}
      <StyledMapRender>
        <Drawer.Root
          snapPoints={snapPoints}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
          modal={false}
          open={isDrawerOpen}
          // onOpenChange={handleDrawerOpenChange}
          // onDrag={handleTouchStart}
          // onRelease={handleTouchEnd}
          scrollLockTimeout={0}
          onAnimationEnd={() => {
            console.log("Animation ended");
          }}
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
          />

          <Drawer.Portal>
            <Drawer.Content
              data-testid="content"
              className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px] overflow-hidden"
            >
              <header
                className={`${isDrawerHeaderShown ? "bg-white shadow-md" : ""} flex justify-between items-center absolute top-0 w-full py-2 px-4`}
              >
                {/* Empty button slot until I properly set layout for centered title */}
                <CloseButton className="opacity-0">Close</CloseButton>

                <div
                  className={`self-center flex flex-col items-center ${
                    isDrawerHeaderShown ? "" : "opacity-0"
                  }`}
                >
                  <Drawer.Title
                    className={`text-md font-medium text-gray-900 `}
                  >
                    {selectedListing?.type === "residential"
                      ? selectedListing?.profiles.first_name
                      : selectedListing?.name}
                  </Drawer.Title>
                  <p className="-mt-1 text-sm text-gray-500">
                    {selectedListing?.type}
                  </p>
                </div>
                <CloseButton onClick={handleCloseListing}>Close</CloseButton>
                {/* <Drawer.Close className="bg-gray-100 rounded-full p-2">
                  Close
                </Drawer.Close> */}
              </header>
              {/* Page content */}
              <div
                ref={drawerContentRef}
                // data-vaul-no-drag
                className={clsx("pt-8 flex flex-col mx-auto w-full px-4", {
                  "overflow-y-auto": snap === 1,
                  "overflow-hidden": snap !== 1,
                })}
                // style={{
                //   overscrollBehavior: "none",
                // }}
              >
                <ListingRead
                  user={user}
                  listing={selectedListing}
                  setSelectedListing={handleCloseListing}
                  modal={true}
                />

                <div className="bg-gray-400 w-24 h-24 py-12"></div>

                <Drawer.Title>
                  {selectedListing?.type === "residential"
                    ? selectedListing?.profiles.first_name
                    : selectedListing?.name}
                </Drawer.Title>
                <Drawer.Description>
                  {selectedListing?.description}
                </Drawer.Description>
                <LoremIpsum />

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
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </StyledMapRender>
    </StyledMapPage>
  );
}
