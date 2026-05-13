"use client";

import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";
import { css, styled } from "next-yak";
import type { GeocodingFeature, Position } from "@maptiler/client";

import { theme } from "@/styles/theme.yak";
import { useGeocodingSearch } from "../hooks/useGeocodingSearch";

export type GeocodingSearchHandle = {
  blur: () => void;
  clear: () => void;
  focus: () => void;
  setQuery: (query: string) => void;
};

type GeocodingSearchVariant = "inline" | "palette";

type GeocodingSearchProps = {
  id?: string;
  ariaInvalid?: "true" | "false";
  autoFocus?: boolean;
  clearLabel: string;
  countryCode?: string | null;
  error?: string;
  errorMessage: string;
  inputTestId?: string;
  loadingMessage: string;
  noResultsMessage: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onPick: (feature: GeocodingFeature) => void;
  placeholder: string;
  proximity?: Position | "ip";
  variant?: GeocodingSearchVariant;
};

const Root = styled.div<{
  $error?: boolean;
  $variant: GeocodingSearchVariant;
}>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;

  ${({ $variant }) =>
    $variant === "palette" &&
    css`
      gap: 0.75rem;
    `}

  input {
    border-radius: ${({ $variant }) =>
      $variant === "palette"
        ? `calc(${theme.corners.base} * 1.25)`
        : `calc(${theme.corners.base} * 0.85)`};
    font-size: ${({ $variant }) =>
      $variant === "palette" ? "1.0625rem" : "1rem"};
    min-height: 3.5rem;
    padding-inline: ${({ $variant }) =>
      $variant === "palette" ? "1rem 2.75rem" : "0.75rem 2.625rem"};

    ${({ $error }) =>
      $error &&
      css`
        border-color: hsla(22, 87%, 50%, 1);
        border-width: 1.5px;
        background-color: hsla(22, 87%, 50%, 0.0625);
      `}
  }
`;

const InputWrap = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  appearance: none;
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.base};
  background-color: ${theme.colors.background.top};
  box-shadow: inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03);
  line-height: 1.35;
  outline: none;

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${theme.colors.focus.outline};
    box-shadow:
      0 0 0 3px
        color-mix(in srgb, ${theme.colors.focus.outline}, transparent 65%),
      inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03);
  }
`;

const ClearButton = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  position: absolute;
  right: 0.375rem;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 999px;

  &:hover {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.sunk};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
  }
`;

const ResultsPanel = styled.div<{ $variant: GeocodingSearchVariant }>`
  box-sizing: border-box;
  position: absolute;
  z-index: 4;
  left: 0;
  right: 0;
  top: calc(100% + 0.25rem);
  overflow: hidden;
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
  box-shadow: 0 5px 10px #33335926;

  ${({ $variant }) =>
    $variant === "palette" &&
    css`
      position: static;
      max-height: min(45vh, 24rem);
      overflow-y: auto;
    `}
`;

const StatusMessage = styled.div`
  padding: 0.75rem 1rem;
  color: ${theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.35;
`;

const ResultList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

const ResultOption = styled.button<{ $active?: boolean }>`
  appearance: none;
  width: 100%;
  border: 0;
  background: ${({ $active }) =>
    $active ? theme.colors.background.sunk : theme.colors.background.top};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 1rem;
  text-align: left;
  transition: background-color 100ms ease-in-out;

  &:hover,
  &:focus-visible {
    background: ${theme.colors.background.sunk};
    outline: none;
  }
`;

const ResultPrimary = styled.span`
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
`;

const ResultSecondary = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: 0.875rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function getFeaturePrimaryLabel(feature: GeocodingFeature) {
  return feature.matching_text || feature.text || feature.place_name;
}

function getFeatureSecondaryLabel(feature: GeocodingFeature) {
  return feature.matching_place_name || feature.place_name;
}

function getFeatureInputLabel(feature: GeocodingFeature) {
  return feature.place_name || feature.text;
}

const GeocodingSearch = forwardRef<GeocodingSearchHandle, GeocodingSearchProps>(
  function GeocodingSearch(
    {
      id,
      ariaInvalid,
      autoFocus,
      clearLabel,
      countryCode,
      error,
      errorMessage,
      inputTestId = "geocoding-search-input",
      loadingMessage,
      noResultsMessage,
      onBlur,
      onFocus,
      onPick,
      placeholder,
      proximity,
      variant = "inline",
    },
    forwardedRef
  ) {
    const generatedId = useId();
    const inputId = id ?? `${generatedId}-geocoding-search`;
    const listId = `${inputId}-results`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const { features, isError, isLoading, isReady } = useGeocodingSearch({
      query,
      countryCode,
      proximity,
    });
    const hasSearchableQuery = query.trim().length >= 3;
    const showResults =
      hasSearchableQuery &&
      (variant === "palette" ||
        isFocused ||
        isLoading ||
        isError ||
        features.length > 0);
    const showNoResults =
      showResults && isReady && !isLoading && !isError && features.length === 0;
    const activeFeature = features[activeIndex];

    useImperativeHandle(
      forwardedRef,
      () => ({
        blur: () => inputRef.current?.blur(),
        clear: () => {
          setQuery("");
          setActiveIndex(0);
        },
        focus: () => inputRef.current?.focus(),
        setQuery: (nextQuery: string) => {
          setQuery(nextQuery);
          setActiveIndex(0);
        },
      }),
      []
    );

    const pickFeature = (feature: GeocodingFeature) => {
      setQuery(getFeatureInputLabel(feature));
      setActiveIndex(0);
      onPick(feature);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (!features.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % features.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + features.length) % features.length
        );
      } else if (event.key === "Enter" && activeFeature) {
        event.preventDefault();
        pickFeature(activeFeature);
      }
    };

    return (
      <Root $error={Boolean(error)} $variant={variant}>
        <InputWrap>
          <Input
            ref={inputRef}
            id={inputId}
            data-testid={inputTestId}
            value={query}
            autoFocus={autoFocus}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={showResults}
            aria-invalid={ariaInvalid}
            aria-activedescendant={
              activeFeature ? `${listId}-option-${activeIndex}` : undefined
            }
            role="combobox"
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onKeyDown={handleKeyDown}
          />
          {query ? (
            <ClearButton
              type="button"
              aria-label={clearLabel}
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
            >
              <X size={16} aria-hidden="true" />
            </ClearButton>
          ) : null}
        </InputWrap>

        {showResults ? (
          <ResultsPanel $variant={variant} id={listId}>
            {isLoading ? <StatusMessage>{loadingMessage}</StatusMessage> : null}
            {isError ? (
              <StatusMessage>{error || errorMessage}</StatusMessage>
            ) : null}
            {showNoResults ? (
              <StatusMessage>{noResultsMessage}</StatusMessage>
            ) : null}
            {features.length > 0 ? (
              <ResultList role="listbox">
                {features.map((feature, index) => (
                  <li key={feature.id}>
                    <ResultOption
                      id={`${listId}-option-${index}`}
                      role="option"
                      type="button"
                      $active={index === activeIndex}
                      aria-selected={index === activeIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pickFeature(feature)}
                    >
                      <ResultPrimary>
                        {getFeaturePrimaryLabel(feature)}
                      </ResultPrimary>
                      <ResultSecondary>
                        {getFeatureSecondaryLabel(feature)}
                      </ResultSecondary>
                    </ResultOption>
                  </li>
                ))}
              </ResultList>
            ) : null}
          </ResultsPanel>
        ) : null}
      </Root>
    );
  }
);

export default GeocodingSearch;
