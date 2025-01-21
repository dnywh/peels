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
const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes
const overSizedFileAlertSingular = `Your photo is too large. The maximum file size is ${MAX_MB}MB.`;
const overSizedFileAlertPlural = `One or more of your photos are too large. The maximum file size is ${MAX_MB}MB per photo.`;

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

    // Check total number of photos
    if (files.length + photos.length > MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos`);
      return;
    }

    // Check total file size
    const overSizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (overSizedFiles.length > 0) {
      if (overSizedFiles.length === 1) {
        alert(overSizedFileAlertSingular);
      } else {
        alert(overSizedFileAlertPlural);
      }
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
      // console.error("Upload error details:", error);

      // Handle different error structures from Supabase
      if (error?.statusCode === "413" || error?.error?.statusCode === "413") {
        alert(overSizedFileAlertPlural);
      } else if (error?.message?.includes("max_photos")) {
        alert(`You can only upload up to ${MAX_PHOTOS} photos`);
      } else {
        alert("There was an error uploading your photos. Please try again.");
      }
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
          size="small"
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
