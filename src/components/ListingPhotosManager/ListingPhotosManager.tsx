"use client";

import { useRef, useState } from "react";
import { uploadListingPhoto, deleteListingPhoto } from "@/utils/mediaUtils";
import Button from "@/components/Button";
import RemoteImage from "@/components/RemoteImage";
import Compressor from "compressorjs";
import Dropzone from "react-dropzone";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { styled } from "@pigment-css/react";

const DropzoneContents = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem", // Match Fieldset gap
});

const PhotoList = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  // marginTop: "1rem",
  flexWrap: "nowrap",
});

const PhotoItem = styled("div")({
  position: "relative",
  aspectRatio: "4/3",
  maxWidth: "300px",

  // Add subtle hover state
  "&:hover": {
    cursor: "grab",
  },

  "&:active": {
    cursor: "grabbing",
  },

  "& img": {
    width: "100%",
    height: "100%",
    aspectRatio: "4/3",
    objectFit: "cover",
    borderRadius: "0.5rem",
  },

  "& button": {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
  },
});

const DropOverlay = styled("aside")(({ theme }) => ({
  background: theme.colors.background.between,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  border: `2.5px dashed ${theme.colors.border.special}`,
  padding: "5rem 1rem",
  maxWidth: "300px", // Match PhotoItem maxWidth
  height: "100%", // Match PhotoItem height
  aspectRatio: "4/3", // Match PhotoItem aspectRatio

  "& p": {
    textAlign: "center",
    whiteSpace: "nowrap",
    color: theme.colors.text.ui.tertiary,
    fontWeight: "600",
  },
}));

const MAX_PHOTOS = 5;
const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes
const MAX_DIMENSION = 2048; // Reasonable max dimension for listing photos
const overSizedFileAlertSingular = `Your photo is too large. The maximum file size is ${MAX_MB}MB.`;
const overSizedFileAlertPlural = `One or more of your photos are too large. The maximum file size is ${MAX_MB}MB per photo.`;

const RemoteImageComponent = RemoteImage as React.ComponentType<any>;
const uploadListingPhotoAction = uploadListingPhoto as (
  file: File,
  listingSlug?: string
) => Promise<string>;
const deleteListingPhotoAction = deleteListingPhoto as (
  filePath: string,
  listingSlug?: string
) => Promise<string[] | null>;

type ListingPhotosManagerProps = {
  initialPhotos?: string[];
  listingSlug?: string;
  onPhotosChange?: (photos: string[]) => void;
  isNewListing?: boolean;
};

function ListingPhotosManager({
  initialPhotos = [],
  listingSlug,
  onPhotosChange,
  isNewListing = false,
}: ListingPhotosManagerProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const photosRef = useRef(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const isMutatingPhotos = isUploading || deletingPhoto !== null;

  const updatePhotos = (
    getNextPhotos: (currentPhotos: string[]) => string[]
  ) => {
    const nextPhotos = getNextPhotos(photosRef.current);
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
    onPhotosChange?.(nextPhotos);
  };

  const compressFile = (file: File) => {
    return new Promise<File>((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8, // Good balance between quality and compression
        maxWidth: MAX_DIMENSION, // Reasonable max dimension for property photos
        maxHeight: MAX_DIMENSION,
        convertSize: 1000000, // Convert PNGs to JPEGs if they're over ~1MB
        success: (result) => resolve(result as File),
        error: (err) => reject(err),
      });
    });
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    if (isMutatingPhotos) return;

    console.log("Dropped files:", acceptedFiles);

    // Convert FileList to Array and process as if they came from input
    const files = Array.from(acceptedFiles);

    // Reuse existing photo handling logic
    if (files.length + photosRef.current.length > MAX_PHOTOS) {
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
        uploadListingPhotoAction(file, !isNewListing ? listingSlug : undefined)
      );
      const newFilenames = (await Promise.all(uploadPromises)) as string[];
      updatePhotos((currentPhotos) => [...currentPhotos, ...newFilenames]);
    } catch (error) {
      // console.error("Upload error details:", error);

      // Handle different error structures from Supabase
      const uploadError = error as {
        statusCode?: string;
        error?: { statusCode?: string };
        message?: string;
      };

      if (
        uploadError?.statusCode === "413" ||
        uploadError?.error?.statusCode === "413"
      ) {
        alert(overSizedFileAlertPlural);
      } else if (uploadError?.message?.includes("max_photos")) {
        alert(`You can only upload up to ${MAX_PHOTOS} photos`);
      } else {
        alert("There was an error uploading your photos. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async (photoToDelete: string) => {
    if (isMutatingPhotos) return;

    setDeletingPhoto(photoToDelete);
    try {
      // Immediately remove from react-beautiful-dnd's context
      updatePhotos((currentPhotos) =>
        currentPhotos.filter((photo) => photo !== photoToDelete)
      );

      // Then attempt the delete operation
      await deleteListingPhotoAction(photoToDelete, listingSlug);
    } catch (error) {
      console.error("Error deleting photo:", error);

      // Restore only the failed deletion, preserving other state changes.
      updatePhotos((currentPhotos) =>
        currentPhotos.includes(photoToDelete)
          ? currentPhotos
          : [...currentPhotos, photoToDelete]
      );
      alert("Failed to delete photo. Please try again.");
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (isMutatingPhotos) return;
    if (!result.destination) return;

    const items = Array.from(photosRef.current);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    console.log("Photos reordered:", items);
    updatePhotos(() => items);
  };

  return (
    <>
      <Dropzone onDrop={handleDrop} noClick noKeyboard>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <DropzoneContents {...getRootProps()}>
            {photos.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable
                  droppableId="photos"
                  direction="vertical"
                  // Things that react-beautiful-dnd gets mad about me NOT defining...
                  isDropDisabled={isMutatingPhotos}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided) => (
                    <PhotoList
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {photos.map((filename, index) => (
                        <Draggable
                          key={filename}
                          draggableId={filename}
                          index={index}
                          isDragDisabled={isMutatingPhotos}
                        >
                          {(provided, snapshot) => (
                            <PhotoItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <RemoteImageComponent
                                bucket="listing_photos"
                                filename={filename}
                                alt={`Photo ${index + 1}`}
                                width={400}
                                height={300}
                              />
                              <Button
                                variant="danger"
                                size="small"
                                loading={deletingPhoto === filename}
                                loadingText="Deleting..."
                                disabled={isMutatingPhotos}
                                onClick={() => handlePhotoDelete(filename)}
                              >
                                Delete
                              </Button>
                            </PhotoItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </PhotoList>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {isDragActive && (
              <DropOverlay>
                <p>Drop photos here</p>
              </DropOverlay>
            )}

            <input
              {...getInputProps()}
              type="file"
              accept="image/*"
              multiple
              disabled={isMutatingPhotos || photos.length >= MAX_PHOTOS}
              style={{ display: "none" }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                id="photo-upload-button"
                name="photo-upload-button"
                as="span"
                variant="secondary"
                size="small"
                loading={isUploading}
                loadingText="Uploading..."
                disabled={isMutatingPhotos || photos.length >= MAX_PHOTOS}
              >
                {photos.length > 0 ? "Add more photos" : "Add photos"}
              </Button>
            </label>
          </DropzoneContents>
        )}
      </Dropzone>
    </>
  );
}

export default ListingPhotosManager;
