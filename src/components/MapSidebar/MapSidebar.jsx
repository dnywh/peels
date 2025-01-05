"use client";

import { useState, useEffect } from "react";
import { styled } from "@pigment-css/react";
import GuestActions from "@/components/GuestActions";
import { facts } from "@/data/facts";

const sidebarWidth = "clamp(20rem, 30vw, 30rem);";

const StyledSidebar = styled("div")({
  // background: "blue",
  border: "1px solid grey",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: sidebarWidth,
  height: "100%",
  // overflow: "scroll",
});

export default function MapSidebar({ user, covered }) {
  const [randomFact, setRandomFact] = useState(null);

  useEffect(() => {
    // Only generate a random fact if there is NO selected listing, not when one is opened
    if (!covered) {
      setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
    }
  }, [covered]);

  return (
    <StyledSidebar
      data-covered={covered}
      className={`bg-gray-100 md:rounded-lg sidebar flex flex-col gap-4 p-10 items-center justify-center text-center text-lg text-gray-400`}
    >
      {/* <MapSearch
          onPick={handleSearchPick}
          mapController={mapController}
        /> */}
      {user && randomFact && (
        // TODO
        // If user has sent >0 messages, show a fun composting fact
        // Otherwise show the fundamentals (1, 2, 3) of Peels
        <>
          <p>{randomFact.fact}</p>
          {randomFact.source && <small>Source: {randomFact.source}</small>}
        </>
      )}
      {!user && (
        <>
          <h2>Find a home for your food scraps, wherever you are</h2>
          <GuestActions />
        </>
      )}
    </StyledSidebar>
  );
}
