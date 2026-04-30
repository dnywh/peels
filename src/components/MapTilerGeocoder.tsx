"use client";

import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type {
  MaptilerGeocoderElement,
  MaptilerGeocoderOptions,
  PickEvent,
} from "@maptiler/geocoding-control";

export type MapTilerGeocoderPickEvent = PickEvent["detail"];
export type MapTilerGeocoderHandle = MaptilerGeocoderElement;

type MapTilerGeocoderProps = Partial<MaptilerGeocoderOptions> & {
  id?: string;
  className?: string;
  style?: CSSProperties;
  error?: string;
  required?: boolean;
  ariaInvalid?: "true" | "false";
  onPick?: (event: MapTilerGeocoderPickEvent) => void;
};

const MapTilerGeocoder = forwardRef<
  MapTilerGeocoderHandle,
  MapTilerGeocoderProps
>(function MapTilerGeocoder(
  { id, className, style, error, required, ariaInvalid, onPick, ...options },
  forwardedRef
) {
  const elementRef = useRef<MaptilerGeocoderElement | null>(null);
  const [isDefined, setIsDefined] = useState(false);

  useImperativeHandle(forwardedRef, () => elementRef.current!, [isDefined]);

  useEffect(() => {
    let isMounted = true;

    void import("@maptiler/geocoding-control").then(() => {
      if (isMounted) {
        setIsDefined(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDefined || !elementRef.current) {
      return;
    }

    elementRef.current.setOptions(options);
  }, [isDefined, options]);

  useEffect(() => {
    const element = elementRef.current;

    if (!isDefined || !element || !onPick) {
      return;
    }

    const handlePick = (event: PickEvent) => {
      onPick(event.detail);
    };

    element.addEventListener("pick", handlePick);

    return () => {
      element.removeEventListener("pick", handlePick);
    };
  }, [isDefined, onPick]);

  if (!isDefined) {
    return null;
  }

  return createElement("maptiler-geocoder", {
    ref: elementRef,
    id,
    className,
    style,
    "aria-invalid": ariaInvalid,
    "data-error": error ? "true" : undefined,
    "data-required": required ? "true" : undefined,
  });
});

export default MapTilerGeocoder;
