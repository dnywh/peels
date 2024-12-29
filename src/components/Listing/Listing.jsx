"use client";
import { useState, memo, useEffect, useCallback, useRef } from "react";

import Link from "next/link";
import { Marker, NavigationControl } from "react-map-gl/maplibre";

import StorageImage from "@/components/StorageImage";
import ChatWindow from "@/components/ChatWindow";
import StyledMap from "@/components/StyledMap";
import MapPin from "@/components/MapPin";

import turfDistance from "@turf/distance";

// Memoize the Listing component
const Listing = memo(function Listing({
  user,
  listing,
  setSelectedListing,
  modal,
}) {
  const mapRef = useRef(null);
  const [distanceAcrossMapWidth, setDistanceAcrossMapWidth] = useState(0);
  const [mapWidth, setMapWidth] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mapZoomLevel, setMapZoomLevel] = useState(null);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);
  // TODO: is this secure? Should this be done on the server or database?
  let listingName =
    listing.type === "residential" ? listing.profiles.first_name : listing.name;
  if (!user && listing.type === "residential") {
    listingName = "Private Host";
  }

  function getDistance() {
    console.log("Map loaded or moved, getting distance across map width");

    if (!mapRef.current) return;
    //   "Project latlng to pixel xy",
    //   mapRef.current.getMap().project({ lng: 0, lat: 0 })
    // );

    const topLeftCorner = mapRef.current.getMap().unproject([0, 0]);
    const topRightCorner = mapRef.current.getMap().unproject([mapWidth, 0]);

    console.log(
      // "First two points",
      // mapRef.current.getMap().project({ lng: 0, lat: 0 }),
      // mapRef.current.getMap().project({ lng: 1, lat: 0 }),
      // "Last two points",
      // mapRef.current.getMap().project({ lng: 153, lat: -33 }),
      // mapRef.current.getMap().project({ lng: 154, lat: -33 }),
      "Difference in X values",
      mapRef.current.getMap().project({ lng: 154, lat: -33 }).x -
        mapRef.current.getMap().project({ lng: 153, lat: -33 }).x
      // "Difference in Y values",
      // mapRef.current.getMap().project({ lng: 154, lat: -33 }).y -
      //   mapRef.current.getMap().project({ lng: 153, lat: -33 }).y
    );
    const bounds = mapRef.current.getMap().getBounds();

    const northWestCorner = {
      lng: bounds._sw.lng,
      lat: bounds._ne.lat,
    };

    const nextDistance = turfDistance(
      [northWestCorner.lat, northWestCorner.lng],
      [bounds._ne.lat, bounds._ne.lng]
    );
    setDistanceAcrossMapWidth(nextDistance);
  }

  // Fetch on map move
  const handleMapMove = useCallback(() => {
    getDistance();
  }, []);

  const handleMapResize = useCallback(() => {
    setMapWidth(mapRef.current.getMap().getContainer().clientWidth);
    getDistance();
  }, []);

  return (
    <div>
      {setSelectedListing && (
        <button onClick={setSelectedListing}>Close</button>
      )}

      <div key={listing.id}>
        {listing.type === "residential" ? (
          <StorageImage
            bucket="avatars"
            filename={listing.profiles.avatar}
            alt={listing.profiles.first_name}
            style={{ width: "100px", height: "100px" }}
          />
        ) : (
          <StorageImage
            bucket="listing_avatars"
            filename={listing.avatar}
            alt={listing.name}
            style={{ width: "100px", height: "100px" }}
          />
        )}

        <h2>{listingName}</h2>
        <p>{listing.type}</p>
        {/* <p>Last active: TODO</p> */}

        <p>Permalink: {listing.slug}</p>

        <div>
          <p>
            {user && listing.owner_id === user.id
              ? "This is your own listing, show button to edit instead of chat"
              : "Not your listing, show button to chat"}
          </p>

          {user ? (
            listing.owner_id === user.id ? (
              <Link href="/edit-listing">Edit listing</Link>
            ) : (
              <button onClick={() => setIsChatOpen(true)}>
                Contact{" "}
                {listing.type === "residential"
                  ? listing.profiles.first_name
                  : listing.name}
              </button>
            )
          ) : (
            <Link href="/sign-up?type=contact-host">Contact host</Link>
          )}
        </div>

        {isChatOpen && (
          <ChatWindow
            user={user}
            listing={listing}
            setIsChatOpen={setIsChatOpen}
          />
        )}

        {listing.description && (
          <>
            <h3>About</h3>
            <p>{listing.description}</p>
          </>
        )}

        {!modal && (
          <>
            <h3>Location</h3>
            <StyledMap
              ref={mapRef}
              style={{ height: "320px" }}
              interactive={false}
              initialViewState={{
                longitude: listing.longitude,
                latitude: listing.latitude,
                zoom: initialZoomLevel,
              }}
              onZoom={(event) => {
                // console.log("box zoom end", event);
                setMapZoomLevel(event.viewState.zoom);
              }}
              onLoad={handleMapResize}
              onMove={handleMapMove}
              onResize={handleMapResize}
            >
              <Marker
                longitude={listing.longitude}
                latitude={listing.latitude}
                anchor="center"
              >
                <MapPin
                  selected={true}
                  coarse={listing.type === "residential" ? true : false}
                  zoomLevel={mapZoomLevel}
                  distanceAcrossMapWidth={distanceAcrossMapWidth}
                  mapWidth={mapWidth}
                />
              </Marker>
              <NavigationControl
                showZoom={true}
                showCompass={false}
                // showAttribution={false}
              />
            </StyledMap>
            {listing.type === "residential" && (
              <p>Contact host for their exact location.</p>
            )}
            <Link href={`/map?listing=${listing.slug}`}>
              See nearby listings
            </Link>
          </>
        )}
        {listing.type === "residential" ? (
          <p>Contact host for their exact location.</p>
        ) : (
          <>
            <a
              href={`https://maps.apple.com/?ll=${listing.latitude},${listing.longitude}&q=${encodeURIComponent(
                listing.name
              )}`}
              target="_blank"
            >
              Apple Maps
            </a>
            <a
              href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
              target="_blank"
            >
              Google Maps
            </a>
          </>
        )}

        {listing.accepted_items.length > 0 && (
          <>
            <h3>Accepted</h3>
            <ul>
              {listing.accepted_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {listing.rejected_items.length > 0 && (
          <>
            <h3>Not accepted</h3>
            <ul>
              {listing.rejected_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {listing.photos.length > 0 && (
          <>
            <h3>Photos</h3>
            <ul>
              {listing.photos.map((photo, index) => (
                <li key={index}>
                  <StorageImage
                    bucket="listing_photos"
                    filename={photo}
                    alt={`Photo ${index + 1}`}
                    style={{ width: "100px", height: "100px" }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {listing.links.length > 0 && (
          <>
            <h3>Links</h3>
            <ul>
              {listing.links.map((link, index) => (
                <li key={index}>
                  <Link href={link} target="_blank">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link href={`/listings/${listing.slug}`}>Permalink</Link>
        <h3>Raw data</h3>
        <pre>{JSON.stringify(listing, null, 2)}</pre>
      </div>
    </div>
  );
});

export default Listing;
