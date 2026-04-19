"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { createClient } from "@/utils/supabase/client";
import type { SelectedListing } from "@/utils/mapUtils";

type UseMapListingUrlArgs = {
  user: { id: string } | null | undefined;
  initialListingSlug?: string | null;
  initialListing?: SelectedListing | null;
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
    initialListing && typeof initialListing.id === "number"
      ? (initialListing.id as number)
      : null
  );

  // The last slug we've resolved locally. Used to skip the fetch in the URL
  // sync effect when we were the ones that set the URL.
  const resolvedSlugRef = useRef<string | null>(
    initialListing?.slug ?? initialListingSlug ?? null
  );

  const tableName = user ? "listings_private_data" : "listings_public_data";

  const fetchBySlug = useCallback(
    async (slug: string) => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .eq("slug", slug)
          .single();

        if (error) {
          setSelectedListing({
            error: true,
            message: t("Listings.edit.notFound"),
          });
          setOptimisticListingId(null);
          return;
        }

        setSelectedListing(data as SelectedListing);
        resolvedSlugRef.current = slug;
        const nextId = (data as { id?: number })?.id;
        setOptimisticListingId(typeof nextId === "number" ? nextId : null);
      } catch (err) {
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
      const nextId = initialListing.id;
      setOptimisticListingId(typeof nextId === "number" ? nextId : null);
      return;
    }

    if (resolvedSlugRef.current === listingSlug) {
      return;
    }

    fetchBySlug(listingSlug);
  }, [fetchBySlug, initialListing, initialListingSlug, listingSlug]);

  const selectListingById = useCallback(
    async (id: number) => {
      // Tap → pin grows immediately, even before the network round-trip.
      setOptimisticListingId(id);

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .eq("id", id)
          .single();

        if (error || !data) {
          setSelectedListing({
            error: true,
            message: t("Listings.edit.notFound"),
          });
          setOptimisticListingId(null);
          return;
        }

        const listing = data as SelectedListing;
        setSelectedListing(listing);
        const slug = listing.slug;

        if (slug) {
          // Claim this slug so the URL sync effect doesn't refetch.
          resolvedSlugRef.current = slug;
          router.push(`/map?listing=${slug}`, { scroll: false });
        }
      } catch (err) {
        console.warn("Failed to select listing by id:", err);
        setSelectedListing({
          error: true,
          message: t("Listings.edit.notFound"),
        });
        setOptimisticListingId(null);
      }
    },
    [router, supabase, t, tableName]
  );

  const closeListing = useCallback(() => {
    resolvedSlugRef.current = null;
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
