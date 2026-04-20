"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

import { siteConfig } from "@/config/site";
import type { Listing, ListingMarker, SelectedListing } from "@/types/listing";
import { isListing } from "@/types/listing";
import { getListingDisplayName } from "@/utils/listingUtils";
import { createClient } from "@/utils/supabase/client";

type UseMapListingUrlArgs = {
  user: User | null | undefined;
  initialListingSlug?: string | null;
  initialListing?: Listing | null;
};

type UseMapListingUrlResult = {
  listingSlug: string | null;
  selectedListing: SelectedListing | null;
  selectedListingId: number | null;
  isListingSelected: boolean;
  isSelectedListingLoading: boolean;
  selectListing: (listing: ListingMarker) => void;
  closeListing: () => void;
};

type CachedListing = {
  listing: Listing;
};

const MAP_TITLE = `Map · ${siteConfig.name}`;

function buildCacheKey(slug: string, tableName: string) {
  return `${tableName}:${slug}`;
}

export function useMapListingUrl({
  user,
  initialListingSlug,
  initialListing,
}: UseMapListingUrlArgs): UseMapListingUrlResult {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const listingSlug = searchParams.get("listing");
  const tableName = user ? "listings_private_data" : "listings_public_data";

  const [selectedListing, setSelectedListing] =
    useState<SelectedListing | null>(initialListing ?? null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    initialListing?.id ?? null
  );
  const [isListingSelected, setIsListingSelected] = useState(
    Boolean(initialListingSlug)
  );
  const [isSelectedListingLoading, setIsSelectedListingLoading] = useState(
    Boolean(initialListingSlug && !initialListing)
  );

  const requestTokenRef = useRef(0);
  const activeSlugRef = useRef<string | null>(initialListing?.slug ?? null);
  const activeTableRef = useRef<string | null>(
    initialListing ? tableName : null
  );
  const cacheRef = useRef<Map<string, CachedListing>>(new Map());

  useEffect(() => {
    if (!initialListing?.slug) return;
    cacheRef.current.set(buildCacheKey(initialListing.slug, tableName), {
      listing: initialListing,
    });
  }, [initialListing, tableName]);

  const getCachedListing = useCallback(
    (slug: string) => {
      return (
        cacheRef.current.get(buildCacheKey(slug, tableName))?.listing ?? null
      );
    },
    [tableName]
  );

  const setDocumentTitle = useCallback(
    (listing: Listing | null) => {
      if (typeof document === "undefined") return;

      const listingName = listing
        ? getListingDisplayName(listing, user ?? null)
        : "";
      document.title = listingName
        ? `${listingName} · ${siteConfig.name}`
        : MAP_TITLE;
    },
    [user]
  );

  const fetchBySlug = useCallback(
    async (slug: string, optimisticId: number | null = null) => {
      const token = ++requestTokenRef.current;

      activeSlugRef.current = slug;
      activeTableRef.current = tableName;
      setIsListingSelected(true);
      setIsSelectedListingLoading(true);

      if (optimisticId !== null) {
        setSelectedListingId(optimisticId);
      }

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .eq("slug", slug)
          .single();

        if (token !== requestTokenRef.current) return;

        if (error || !data) {
          setSelectedListing({
            error: true,
            message: t("Listings.edit.notFound"),
          });
          setSelectedListingId(optimisticId);
          setIsSelectedListingLoading(false);
          return;
        }

        const listing = data as Listing;
        cacheRef.current.set(buildCacheKey(slug, tableName), { listing });
        setSelectedListing(listing);
        setSelectedListingId(listing.id ?? optimisticId);
        setIsSelectedListingLoading(false);
      } catch (error) {
        if (token !== requestTokenRef.current) return;
        console.warn("Failed to load listing by slug:", error);
        setSelectedListing({
          error: true,
          message: t("Listings.edit.notFound"),
        });
        setSelectedListingId(optimisticId);
        setIsSelectedListingLoading(false);
      }
    },
    [supabase, t, tableName]
  );

  useEffect(() => {
    if (!listingSlug) {
      requestTokenRef.current += 1;
      activeSlugRef.current = null;
      activeTableRef.current = null;
      setIsListingSelected(false);
      setSelectedListingId(null);
      setIsSelectedListingLoading(false);
      return;
    }

    setIsListingSelected(true);

    if (
      listingSlug === activeSlugRef.current &&
      activeTableRef.current === tableName
    ) {
      return;
    }

    requestTokenRef.current += 1;
    activeSlugRef.current = listingSlug;
    activeTableRef.current = tableName;

    if (
      listingSlug === initialListingSlug &&
      initialListing &&
      initialListing.slug === listingSlug
    ) {
      setSelectedListing(initialListing);
      setSelectedListingId(initialListing.id ?? null);
      setIsSelectedListingLoading(false);
      return;
    }

    const cachedListing = getCachedListing(listingSlug);
    if (cachedListing) {
      setSelectedListing(cachedListing);
      setSelectedListingId(cachedListing.id ?? null);
      setIsSelectedListingLoading(false);
      return;
    }

    setSelectedListing(null);
    setSelectedListingId(null);
    setIsSelectedListingLoading(true);
    void fetchBySlug(listingSlug);
  }, [
    fetchBySlug,
    getCachedListing,
    initialListing,
    initialListingSlug,
    listingSlug,
    tableName,
  ]);

  useEffect(() => {
    if (!isListingSelected) {
      setDocumentTitle(null);
      return;
    }

    if (isListing(selectedListing)) {
      setDocumentTitle(selectedListing);
      return;
    }

    setDocumentTitle(null);
  }, [isListingSelected, selectedListing, setDocumentTitle]);

  const selectListing = useCallback(
    (listing: ListingMarker) => {
      requestTokenRef.current += 1;
      activeSlugRef.current = listing.slug;
      activeTableRef.current = tableName;

      setIsListingSelected(true);
      setSelectedListingId(listing.id);

      const cachedListing = getCachedListing(listing.slug);
      if (cachedListing) {
        setSelectedListing(cachedListing);
        setIsSelectedListingLoading(false);
      } else {
        setSelectedListing(null);
        setIsSelectedListingLoading(true);
        void fetchBySlug(listing.slug, listing.id);
      }

      window.history.pushState(
        null,
        "",
        `/map?listing=${encodeURIComponent(listing.slug)}`
      );
    },
    [fetchBySlug, getCachedListing, tableName]
  );

  const closeListing = useCallback(() => {
    requestTokenRef.current += 1;
    activeSlugRef.current = null;
    activeTableRef.current = null;

    setIsListingSelected(false);
    setSelectedListingId(null);
    setIsSelectedListingLoading(false);
    setDocumentTitle(null);

    window.history.pushState(null, "", "/map");
  }, [setDocumentTitle]);

  return {
    listingSlug,
    selectedListing,
    selectedListingId,
    isListingSelected,
    isSelectedListingLoading,
    selectListing,
    closeListing,
  };
}
