export function buildListingPhotoHref(listingSlug: string, photo: string) {
  const encodedPhotoPath = photo
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/listings/${encodeURIComponent(listingSlug)}/photos/${encodedPhotoPath}`;
}

export function parseListingPhotoPath(photoPath: string[] | undefined) {
  if (!photoPath || photoPath.length === 0) return null;

  return photoPath.map((segment) => decodeURIComponent(segment)).join("/");
}
