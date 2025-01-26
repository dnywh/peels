"use client";

import { useState } from "react";
import { uploadListingPhoto, deleteListingPhoto } from "@/utils/mediaUtils";
import { styled } from "@pigment-css/react";
import Button from "@/components/Button";
import RemoteImage from "@/components/RemoteImage";
import Compressor from "compressorjs";
import Dropzone from "react-dropzone";

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

const DropOverlay = styled("div")({
  // position: "absolute",
  // top: 0,
  // left: 0,
  // right: 0,
  // bottom: 0,
  padding: "1rem",
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  border: "1px dashed #000",

  "& div": {
    padding: "2rem",
    background: "white",
    borderRadius: "0.5rem",
    textAlign: "center",
  },
});

const MAX_PHOTOS = 5;
const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes
const MAX_DIMENSION = 2048; // Reasonable max dimension for listing photos
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
  const [isDragging, setIsDragging] = useState(false);

  const compressFile = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8, // Good balance between quality and compression
        maxWidth: MAX_DIMENSION, // Reasonable max dimension for property photos
        maxHeight: MAX_DIMENSION,
        convertSize: 1000000, // Convert PNGs to JPEGs if they're over ~1MB
        success: (result) => resolve(result),
        error: (err) => reject(err),
      });
    });
  };

  const handleDrop = async (acceptedFiles) => {
    console.log("Dropped files:", acceptedFiles);

    // Convert FileList to Array and process as if they came from input
    const files = Array.from(acceptedFiles);

    // Reuse existing photo handling logic
    if (files.length + photos.length > MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos`);
      return;
    }

    // Rest of the handlePhotoAdd logic
    const overSizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (overSizedFiles.length > 0) {
      alert(
        overSizedFiles.length === 1
          ? overSizedFileAlertSingular
          : overSizedFileAlertPlural
      );
      return;
    }

    setIsUploading(true);
    try {
      const compressedFiles = await Promise.all(
        files.map((file) => compressFile(file))
      );
      console.log(
        "Original vs Compressed sizes:",
        files.map((f, i) => ({
          original: Math.round(f.size / 1024) + "KB",
          compressed: Math.round(compressedFiles[i].size / 1024) + "KB",
        }))
      );

      const uploadPromises = compressedFiles.map((file) =>
        uploadListingPhoto(file, !isNewListing ? listingSlug : undefined)
      );
      const newFilenames = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...newFilenames];
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
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
    <Dropzone
      onDrop={handleDrop}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      noClick
      noKeyboard
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div {...getRootProps()}>
          {isDragActive && (
            <DropOverlay>
              <p>Drop your photos here</p>
            </DropOverlay>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleDrop}
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
                  <RemoteImage
                    bucket="listing_photos"
                    filename={filename}
                    alt={`Photo ${index + 1}`}
                    width={300}
                    height={300}
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
      )}
    </Dropzone>
  );
}

export default ListingPhotosManager;
