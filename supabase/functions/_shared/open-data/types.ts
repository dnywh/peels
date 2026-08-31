export type OpenDataSyncStatus = "active" | "removed_from_source" | "claimed";

export type OpenDataSourceType = "api" | "manual_file" | "remote_file";

export type OpenDataImportMode = "complete_snapshot" | "partial_update";

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

export type OpenDataSourceRow = {
  id: string;
  name: string;
  source_name: string;
  source_url: string;
  source_type: OpenDataSourceType;
  api_url: string | null;
  mapper_id: string;
  sync_cron: string | null;
  default_avatar: string | null;
  default_import_mode: OpenDataImportMode;
};

export type ListingOpenDataRefRow = {
  source_id: string;
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
