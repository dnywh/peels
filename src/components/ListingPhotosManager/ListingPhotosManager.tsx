"use client";
import { theme } from "@/styles/theme.yak";

import { useRef, useState } from "react";
import { uploadListingPhoto, deleteListingPhoto } from "@/utils/mediaUtils";
import { normaliseImageFileForUpload } from "@/utils/media/client";
import Button from "@/components/Button";
import RemoteImage from "@/components/RemoteImage";
import Dropzone from "react-dropzone";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { styled } from "next-yak";
import { useTranslations } from "next-intl";

const DropzoneContents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PhotoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-wrap: nowrap;
`;

const PhotoItem = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  max-width: 300px;
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
  & img {
    width: 100%;
    height: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: 0.5rem;
  }
  & button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
`;

const DropOverlay = styled.aside`
  background: ${theme.colors.background.between};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 2.5px dashed ${theme.colors.border.special};
  padding: 5rem 1rem;
  max-width: 300px;
  height: 100%;
  aspect-ratio: 4/3;
  & p {
    text-align: center;
    white-space: nowrap;
    color: ${theme.colors.text.ui.tertiary};
    font-weight: 600;
  }
`;

const MAX_PHOTOS = 5;
const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024; // 10MB in bytes

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
  const t = useTranslations();
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

  const handleDrop = async (acceptedFiles: File[]) => {
    if (isMutatingPhotos) return;

    console.log("Dropped files:", acceptedFiles);

    // Convert FileList to Array and process as if they came from input
    const files = Array.from(acceptedFiles);

    // Reuse existing photo handling logic
    if (files.length + photosRef.current.length > MAX_PHOTOS) {
      alert(t("Listings.photos.tooMany", { max: MAX_PHOTOS }));
      return;
    }

    // Rest of the handlePhotoAdd logic
    const overSizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (overSizedFiles.length > 0) {
      alert(
        overSizedFiles.length === 1
          ? t("Listings.photos.tooLargeOne", { max: MAX_MB })
          : t("Listings.photos.tooLargeMany", { max: MAX_MB })
      );
      return;
    }

    setIsUploading(true);
    try {
      const normalisedFiles = await Promise.all(
        files.map((file) => normaliseImageFileForUpload(file))
      );

      const newFilenames: string[] = [];

      for (const file of normalisedFiles) {
        newFilenames.push(
          await uploadListingPhotoAction(
            file,
            !isNewListing ? listingSlug : undefined
          )
        );
      }

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
        alert(
          files.length === 1
            ? t("Listings.photos.tooLargeOne", { max: MAX_MB })
            : t("Listings.photos.tooLargeMany", { max: MAX_MB })
        );
      } else if (uploadError?.message?.includes("max_photos")) {
        alert(t("Listings.photos.tooMany", { max: MAX_PHOTOS }));
      } else {
        alert(t("Errors.photoUploadFailed"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async (photoToDelete: string) => {
    if (isMutatingPhotos) return;

    const deletedPhotoIndex = photosRef.current.indexOf(photoToDelete);
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
      updatePhotos((currentPhotos) => {
        if (currentPhotos.includes(photoToDelete)) {
          return currentPhotos;
        }

        const restoreIndex =
          deletedPhotoIndex === -1
            ? currentPhotos.length
            : Math.min(deletedPhotoIndex, currentPhotos.length);

        return [
          ...currentPhotos.slice(0, restoreIndex),
          photoToDelete,
          ...currentPhotos.slice(restoreIndex),
        ];
      });
      alert(t("Errors.failedDeletePhoto"));
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
                                alt={t("Listings.photos.alt", {
                                  number: index + 1,
                                })}
                                width={400}
                                height={300}
                              />
                              <Button
                                variant="danger"
                                size="small"
                                loading={deletingPhoto === filename}
                                loadingText={t("Status.deleting")}
                                disabled={isMutatingPhotos}
                                onClick={() => handlePhotoDelete(filename)}
                              >
                                {t("Actions.delete")}
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
                <p>{t("Listings.photos.dropHere")}</p>
              </DropOverlay>
            )}

            <input
              {...getInputProps()}
              type="file"
              accept="image/*,.heic,.heif"
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
                loadingText={t("Status.uploading")}
                disabled={isMutatingPhotos || photos.length >= MAX_PHOTOS}
              >
                {photos.length > 0
                  ? t("Actions.addMorePhotos")
                  : t("Actions.addPhotos")}
              </Button>
            </label>
          </DropzoneContents>
        )}
      </Dropzone>
    </>
  );
}

export default ListingPhotosManager;
