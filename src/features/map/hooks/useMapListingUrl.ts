"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const MAX_CACHED_LISTINGS = 24;

function buildCacheKey(slug: string, tableName: string) {
  return `${tableName}:${slug}`;
}

function readListingSlugFromLocation() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("listing");
}

export function useMapListingUrl({
  user,
  initialListingSlug,
  initialListing,
}: UseMapListingUrlArgs): UseMapListingUrlResult {
  const t = useTranslations();
  const supabase = useMemo(() => createClient(), []);

  const tableName = user ? "listings_private_data" : "listings_public_data";
  const [listingSlug, setListingSlug] = useState<string | null>(
    initialListingSlug ?? null
  );

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

  const setCachedListing = useCallback(
    (slug: string, listing: Listing) => {
      const cacheKey = buildCacheKey(slug, tableName);
      const cache = cacheRef.current;

      if (cache.has(cacheKey)) {
        cache.delete(cacheKey);
      }

      cache.set(cacheKey, { listing });

      if (cache.size > MAX_CACHED_LISTINGS) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
    },
    [tableName]
  );

  useEffect(() => {
    if (!initialListing?.slug) return;
    setCachedListing(initialListing.slug, initialListing);
  }, [initialListing, setCachedListing]);

  useEffect(() => {
    const syncListingSlug = () => {
      setListingSlug(readListingSlugFromLocation());
    };

    syncListingSlug();
    window.addEventListener("popstate", syncListingSlug);

    return () => {
      window.removeEventListener("popstate", syncListingSlug);
    };
  }, []);

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
        setCachedListing(slug, listing);
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
    [setCachedListing, supabase, t, tableName]
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

      setListingSlug(listing.slug);
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

    setListingSlug(null);
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
