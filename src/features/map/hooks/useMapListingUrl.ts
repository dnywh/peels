"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { createClient } from "@/utils/supabase/client";
import { isListing, type Listing, type SelectedListing } from "@/types/listing";
import type { User } from "@supabase/supabase-js";

type UseMapListingUrlArgs = {
  user: User | null | undefined;
  initialListingSlug?: string | null;
  initialListing?: Listing | null;
};

type UseMapListingUrlResult = {
  listingSlug: string | null;
  selectedListing: SelectedListing | null;
  // The id that should appear "selected" on the map. Combines the optimistic
  // id from the most recent tap with the resolved listing's id, so the pin
  // grows immediately on tap and stays grown through the fetch.
  selectedListingId: number | null;
  // True whenever there is a listing in the URL. Drives the drawer open state.
  isListingSelected: boolean;
  // Marker click handler. Sets the optimistic id synchronously, fetches the
  // full listing by id, then updates state + URL in one pass. The URL effect
  // skips the normal fetch because the slug is already resolved.
  selectListingById: (id: number) => Promise<void>;
  // Drawer close handler.
  closeListing: () => void;
};

// Owns the URL <-> selected-listing relationship for the map page.
//
// Goals:
// - Seed from SSR (`initialListing`) so a deep link doesn't re-fetch.
// - Fix the "grow -> shrink -> grow" pin flicker by:
//   (a) setting an optimistic pin id synchronously on tap, and
//   (b) only fetching the listing once per selection (removes the original
//       double fetch where handleMarkerClick + loadListingBySlug both ran).
// - Leave `selectedListing` set while the drawer animates closed, so the
//   last listing stays on-screen instead of flashing empty.
export function useMapListingUrl({
  user,
  initialListingSlug,
  initialListing,
}: UseMapListingUrlArgs): UseMapListingUrlResult {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const listingSlug = searchParams.get("listing");

  const [selectedListing, setSelectedListing] =
    useState<SelectedListing | null>(initialListing ?? null);
  const [optimisticListingId, setOptimisticListingId] = useState<number | null>(
    initialListing?.id ?? null
  );

  // The last slug we've resolved locally. Used to skip the fetch in the URL
  // sync effect when we were the ones that set the URL.
  const resolvedSlugRef = useRef<string | null>(
    initialListing?.slug ?? initialListingSlug ?? null
  );

  // Which Supabase view was used when we resolved `resolvedSlugRef`. When auth
  // loads or the session ends, `tableName` flips — we must refetch so we do not
  // keep showing columns from the wrong view.
  const resolvedTableRef = useRef<string | null>(
    initialListingSlug &&
      initialListing?.slug &&
      initialListing.slug === initialListingSlug
      ? user
        ? "listings_private_data"
        : "listings_public_data"
      : null
  );

  const tableName = user ? "listings_private_data" : "listings_public_data";

  // Monotonically increasing token for every in-flight listing fetch (by slug
  // or by id). Responses only get to update state when their token is still
  // the most recent one — avoids older requests overwriting newer selections
  // when slugs flip rapidly or the public/private view changes mid-flight.
  const requestTokenRef = useRef(0);

  // Id of the listing currently rendered in the drawer (or null when nothing
  // or an error is shown). Kept in a ref so `selectListingById` can revert
  // the optimistic pin id after a failed tap without going through stale
  // closure values.
  const resolvedListingIdRef = useRef<number | null>(
    initialListing?.id ?? null
  );
  useEffect(() => {
    resolvedListingIdRef.current = isListing(selectedListing)
      ? (selectedListing.id ?? null)
      : null;
  }, [selectedListing]);

  // If the public/private view flips (e.g. session finished loading) while the
  // same listing is open, refetch with the correct view.
  useEffect(() => {
    if (!listingSlug) return;
    if (resolvedTableRef.current === null) return;
    if (resolvedTableRef.current === tableName) return;
    resolvedTableRef.current = null;
  }, [listingSlug, tableName]);

  const fetchBySlug = useCallback(
    async (slug: string) => {
      const token = ++requestTokenRef.current;

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .eq("slug", slug)
          .single();

        if (token !== requestTokenRef.current) return;

        if (error) {
          setSelectedListing({
            error: true,
            message: t("Listings.edit.notFound"),
          });
          setOptimisticListingId(null);
          return;
        }

        const listing = data as Listing;
        setSelectedListing(listing);
        resolvedSlugRef.current = slug;
        resolvedTableRef.current = tableName;
        setOptimisticListingId(listing.id ?? null);
      } catch (err) {
        if (token !== requestTokenRef.current) return;
        console.warn("Failed to load listing by slug:", err);
        setSelectedListing({
          error: true,
          message: t("Listings.edit.notFound"),
        });
        setOptimisticListingId(null);
      }
    },
    [supabase, t, tableName]
  );

  // Keep state aligned with the URL. Only fetch when the slug has actually
  // changed from what we resolved locally. We intentionally do *not* clear
  // `selectedListing` when the slug goes away — the drawer animates out and
  // should keep showing the last listing until it's fully closed — but we
  // do clear the pin-selection id so the pin snaps back immediately.
  useEffect(() => {
    if (!listingSlug) {
      resolvedSlugRef.current = null;
      resolvedTableRef.current = null;
      setOptimisticListingId(null);
      return;
    }

    // On first mount: if SSR gave us the listing for this slug, use that.
    if (
      listingSlug === initialListingSlug &&
      initialListing &&
      resolvedSlugRef.current !== listingSlug
    ) {
      setSelectedListing(initialListing);
      resolvedSlugRef.current = listingSlug;
      resolvedTableRef.current = tableName;
      setOptimisticListingId(initialListing.id ?? null);
      return;
    }

    if (
      resolvedSlugRef.current === listingSlug &&
      resolvedTableRef.current === tableName
    ) {
      return;
    }

    fetchBySlug(listingSlug);
  }, [fetchBySlug, initialListing, initialListingSlug, listingSlug, tableName]);

  const selectListingById = useCallback(
    async (id: number) => {
      // Capture the pin id of the drawer's current resolved listing before
      // the optimistic change, so we can restore it if the fetch fails.
      const previousResolvedId = resolvedListingIdRef.current;

      // Tap → pin grows immediately, even before the network round-trip.
      setOptimisticListingId(id);
      const token = ++requestTokenRef.current;

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .eq("id", id)
          .single();

        if (token !== requestTokenRef.current) return;

        if (error || !data) {
          // Tap-driven fetches happen before the URL is pushed, so surfacing
          // an error sentinel here would either be invisible (no listing in
          // URL → drawer stays closed) or desync the UI from the URL (still
          // pointing at the previous listing). Revert the optimistic pin to
          // whatever the drawer is currently showing and leave
          // `selectedListing` alone.
          console.warn("Failed to select listing by id:", error);
          setOptimisticListingId(previousResolvedId);
          return;
        }

        const listing = data as Listing;
        setSelectedListing(listing);
        const slug = listing.slug;

        if (slug) {
          // Claim this slug so the URL sync effect doesn't refetch.
          resolvedSlugRef.current = slug;
          resolvedTableRef.current = tableName;
          router.push(`/map?listing=${slug}`, { scroll: false });
        }
      } catch (err) {
        if (token !== requestTokenRef.current) return;
        console.warn("Failed to select listing by id:", err);
        setOptimisticListingId(previousResolvedId);
      }
    },
    [router, supabase, tableName]
  );

  const closeListing = useCallback(() => {
    // Invalidate any in-flight fetches so their late responses don't reopen
    // the drawer.
    requestTokenRef.current += 1;
    resolvedSlugRef.current = null;
    resolvedTableRef.current = null;
    setOptimisticListingId(null);
    router.push("/map", { scroll: false });
  }, [router]);

  // Pin selection is driven entirely by the optimistic id, which is set on
  // tap and cleared whenever the URL loses its listing slug (including on
  // browser back/forward). `selectedListing` may stick around during the
  // drawer close animation but the pin snaps back immediately, matching the
  // prior behaviour.
  const selectedListingId = optimisticListingId;

  return {
    listingSlug,
    selectedListing,
    selectedListingId,
    isListingSelected: Boolean(listingSlug),
    selectListingById,
    closeListing,
  };
}
