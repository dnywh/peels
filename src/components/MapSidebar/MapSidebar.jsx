"use client";

import { useState, useEffect } from "react";
import { styled } from "@pigment-css/react";
import GuestActions from "@/components/GuestActions";
import { facts } from "@/data/facts";

const steps = [
  { title: "Find a host", description: "Select a marker on the map." },
  { title: "Contact", description: "Arrange a drop-off via chat." },
  { title: "Drop-off", description: "Meet your neighbours!" },
];
const sidebarWidth = "clamp(20rem, 30vw, 30rem);";

const StyledSidebar = styled("div")(({ theme }) => ({
  backgroundColor: theme.colors.background.pit,
  color: theme.colors.text.secondary,
  borderRadius: theme.corners.base,
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
  border: `2px dashed ${theme.colors.border.base}`,

  overflowY: "scroll",
}));

const StepList = styled("ol")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "6rem",
  listStyle: "none",
  padding: 0,
  counterReset: "steps",

  "& li": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.35rem",
    position: "relative",
    paddingTop: "2.25rem", // Make room for the number above

    "& h3": {
      fontSize: "1.5em",
      fontWeight: "500",
      lineHeight: "100%",
    },

    "& p": {
      fontSize: "1em",
      fontWeight: "400",
      lineHeight: "100%",
    },

    "&::before": {
      content: "counter(steps)",
      counterIncrement: "steps",
      position: "absolute",
      top: 0,
      width: "1.5rem",
      height: "1.5rem",
      backgroundColor: theme.colors.text.counter,
      color: theme.colors.background.pit,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      leadingTrim: "both",
      fontSize: "1em",
      fontWeight: "700",
    },
  },
}));

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
          <StepList>
            {steps.map((step, index) => (
              <li key={index}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </StepList>
        </>
      )}
    </StyledSidebar>
  );
}
