export type OpenDataSyncStatus = "active" | "removed_from_source" | "claimed";

export type MappedOpenDataListing = {
  externalId: string;
  sourceVersion: string | null;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  areaName: string;
  countryCode: string;
  type: "community" | "business" | "residential";
  acceptedItems: string[];
  rejectedItems: string[];
  links: string[];
  isStub: boolean;
  visibility: boolean;
};

export type OpenDataFeedRow = {
  id: string;
  name: string;
  source_name: string;
  source_url: string;
  api_url: string;
  mapper_id: string;
  sync_cron: string | null;
  default_avatar: string | null;
};

export type ListingOpenDataRefRow = {
  feed_id: string;
  external_id: string;
  listing_id: number;
  source_version: string | null;
  content_hash: string;
  last_seen_at: string;
  sync_status: OpenDataSyncStatus;
};

export type SyncStats = {
  fetched: number;
  inserted: number;
  updated: number;
  unchanged: number;
  removed: number;
  skippedClaimed: number;
  errors: number;
};
