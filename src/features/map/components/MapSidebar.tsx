"use client";
import { theme } from "@/styles/theme.yak";

import { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "next-yak";
import { useTranslations } from "next-intl";

import { facts } from "@/data/facts";

import type { User } from "@supabase/supabase-js";

import { SIDEBAR_WIDTH } from "../lib/mapUtils";

type MapSidebarProps = {
  user: User | null | undefined;
  covered: boolean;
};

type Fact = {
  fact: string;
  source?: string;
};

const StyledSidebar = styled.div`
  background-color: ${theme.colors.background.pit};
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.corners.base};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: ${SIDEBAR_WIDTH};
  height: 100%;
  word-wrap: anywhere;
  border: 2px dashed ${theme.colors.border.base};
  overflow-y: hidden;
`;

const FactBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: ${theme.colors.text.ui.emptyState};
  & h3 {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    line-height: 100%;
    text-transform: uppercase;
  }
  & p:first-of-type {
    font-size: 1.35rem;
    font-weight: 500;
    line-height: 120%;
    text-wrap: balance;
  }
  & p > small {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 100%;
    & a {
      color: inherit;
      transition: opacity 150ms ease-in-out;
      &:hover {
        opacity: 0.75;
      }
    }
  }
`;

const StepList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 6rem, 9vh);
  list-style: none;
  padding: 0;
  counter-reset: steps;
  & li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    position: relative;
    padding-top: 2.25rem;
    & h3 {
      font-size: 1.5em;
      font-weight: 500;
      line-height: 100%;
    }
    & p {
      font-size: 1em;
      font-weight: 400;
      line-height: 100%;
    }
    &::before {
      content: counter(steps);
      counter-increment: steps;
      position: absolute;
      top: 0;
      width: 1.5rem;
      height: 1.5rem;
      background-color: ${theme.colors.text.counter};
      color: ${theme.colors.background.pit};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      leading-trim: both;
      font-size: 1em;
      font-weight: 700;
      font-variant-numeric: lining-nums;
    }
  }
`;

export default function MapSidebar({ user, covered }: MapSidebarProps) {
  const t = useTranslations();
  const [randomFact, setRandomFact] = useState<Fact | null>(null);

  const steps = [
    {
      title: t("Map.steps.find.title"),
      description: t("Map.steps.find.description"),
    },
    {
      title: t("Map.steps.contact.title"),
      description: t("Map.steps.contact.description"),
    },
    {
      title: t("Map.steps.dropOff.title"),
      description: t("Map.steps.dropOff.description"),
    },
  ];

  useEffect(() => {
    if (!covered) {
      setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
    }
  }, [covered]);

  return (
    <StyledSidebar className="sidebar" data-covered={covered}>
      {user && randomFact && (
        <FactBlock>
          <h3>{t("Map.didYouKnow")}</h3>
          <p>{randomFact.fact}</p>
          {randomFact.source && (
            <p>
              <small>
                <Link href={randomFact.source} target="_blank" rel="noopener">
                  {t("Common.source")}
                </Link>
              </small>
            </p>
          )}
        </FactBlock>
      )}
      {!user && (
        <StepList>
          {steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </StepList>
      )}
    </StyledSidebar>
  );
}
