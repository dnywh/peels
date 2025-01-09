"use client";

import { useState, useEffect } from "react";
import { styled } from "@pigment-css/react";
import GuestActions from "@/components/GuestActions";
import { facts } from "@/data/facts";

const sidebarWidth = "clamp(20rem, 30vw, 30rem);";

const StyledSidebar = styled("div")({
  backgroundColor: "#f0f0f0",
  color: "#404040",
  borderRadius: "0.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.5rem",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  width: sidebarWidth,
  height: "100%",
  wordWrap: "anywhere", // for source URLs on facts, remove when those go
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
    <StyledSidebar className="sidebar" data-covered={covered}>
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
