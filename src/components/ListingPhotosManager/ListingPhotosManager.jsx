"use client";

import { useState } from "react";
import { uploadListingPhoto, deleteListingPhoto } from "@/utils/mediaUtils";
import { styled } from "@pigment-css/react";
import Button from "@/components/Button";
import StorageImage from "@/components/StorageImage";

const PhotoGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "1rem",
  marginTop: "1rem",
});

const PhotoItem = styled("div")({
  position: "relative",
  aspectRatio: "1",

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "0.5rem",
  },

  "& button": {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
  },
});

const MAX_PHOTOS = 5;

function ListingPhotosManager({
  initialPhotos = [],
  listingSlug,
  onPhotosChange,
  isNewListing = false,
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoAdd = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length + photos.length > MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos`);
      return;
    }

    setIsUploading(true);
    try {
      if (isNewListing) {
        // For new listings, just upload to storage and track filenames
        const uploadPromises = files.map(
          (file) => uploadListingPhoto(file) // No listingSlug for new listings
        );
        const newFilenames = await Promise.all(uploadPromises);
        const newPhotos = [...photos, ...newFilenames];
        setPhotos(newPhotos);
        onPhotosChange?.(newPhotos);
      } else {
        // For existing listings, upload and update the database
        const uploadPromises = files.map((file) =>
          uploadListingPhoto(file, listingSlug)
        );
        const newFilenames = await Promise.all(uploadPromises);
        const newPhotos = [...photos, ...newFilenames];
        setPhotos(newPhotos);
        onPhotosChange?.(newPhotos);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async (photoToDelete) => {
    try {
      await deleteListingPhoto(photoToDelete, listingSlug);
      const newPhotos = photos.filter((photo) => photo !== photoToDelete);
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoAdd}
        disabled={isUploading || photos.length >= MAX_PHOTOS}
        style={{ display: "none" }}
        id="photo-upload"
      />
      <label htmlFor="photo-upload">
        <Button
          as="span"
          variant="secondary"
          disabled={isUploading || photos.length >= MAX_PHOTOS}
        >
          {isUploading ? "Uploading..." : "Add photos"}
        </Button>
      </label>

      {photos.length > 0 && (
        <PhotoGrid>
          {photos.map((filename, index) => (
            <PhotoItem key={index}>
              <StorageImage
                bucket="listing_photos"
                filename={filename}
                alt={`Photo ${index + 1}`}
                size={300}
              />
              <Button
                variant="danger"
                size="small"
                onClick={() => handlePhotoDelete(filename)}
              >
                Delete
              </Button>
            </PhotoItem>
          ))}
        </PhotoGrid>
      )}
    </div>
  );
}

export default ListingPhotosManager;
