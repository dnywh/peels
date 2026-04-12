"use client";

import { useState, useRef } from "react";

import DropdownMenu from "@/components/DropdownMenu";
import Avatar from "@/components/Avatar";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Button from "@/components/Button";
import InputHint from "@/components/InputHint";

import { styled } from "@pigment-css/react";

const StyledField = styled(Field)({
  alignItems: "center",
  marginTop: "0.5rem", // Optical offset for theme.rotations.avatar
});

const StyledImgContainer = styled("div")({
  position: "relative",
});

const AvatarButton = styled(Button)({
  marginLeft: "0.35rem", // Optical offset for theme.rotations.avatar
  marginTop: "-1.25rem",
  zIndex: 1,
});

const LoadingSpinner = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "20px",

  position: "absolute",
  inset: 0,
  backgroundColor: theme.colors.background.overlay,
  color: theme.colors.text.overlay,
  // Match Avatar
  transform: `rotate(${theme.rotations.avatar})`,
  borderRadius: theme.corners.avatar,
}));

const AvatarComponent = Avatar as React.ComponentType<any>;

type AvatarUploadViewProps = {
  avatar?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  getAvatarUrl?: (filename: string) => string;
  bucket: string;
  inputHintShown?: boolean;
  listingType?: string;
};

function AvatarUploadView({
  avatar,
  onChange,
  onDelete,
  getAvatarUrl,
  bucket,
  inputHintShown = false,
  listingType,
}: AvatarUploadViewProps) {
  // Hidden file input that we'll trigger programmatically
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBusy = loading || isDeleting;

  const handleFileSelect = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    try {
      await onChange(event);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isBusy) return;

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Fieldset>
      <StyledField>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={false}
          onChange={handleUpload}
          disabled={isBusy}
          style={{ display: "none" }}
        />

        <StyledImgContainer>
          <AvatarComponent
            bucket={bucket}
            filename={avatar}
            alt="Your avatar"
            size="massive"
            listing={listingType ? { type: listingType } : undefined}
          />

          {loading && <LoadingSpinner>Uploading...</LoadingSpinner>}
        </StyledImgContainer>

        {!avatar ? (
          // Scenario 1: No avatar - show single "Add" button
          <AvatarButton
            variant="secondary"
            size="small"
            onClick={handleFileSelect}
            loading={loading}
            loadingText="Uploading..."
            disabled={isBusy}
          >
            Add
          </AvatarButton>
        ) : (
          // Scenario 2 & 3: Has avatar - show menu with options
          <DropdownMenu.Root>
            <DropdownMenu.Button
              as={AvatarButton}
              variant="secondary"
              size="small"
              loading={loading || isDeleting}
              loadingText={loading ? "Uploading..." : "Deleting..."}
              disabled={isBusy}
            >
              Edit
            </DropdownMenu.Button>

            <DropdownMenu.Items
              transition
              anchor={{ to: "bottom", gap: "4px" }}
            >
              <DropdownMenu.Item>
                <Button
                  onClick={handleFileSelect}
                  variant="secondary"
                  size="small"
                  disabled={isBusy}
                >
                  Replace
                </Button>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="small"
                  loading={isDeleting}
                  loadingText="Deleting..."
                  disabled={isBusy}
                >
                  Delete
                </Button>
              </DropdownMenu.Item>
            </DropdownMenu.Items>
          </DropdownMenu.Root>
        )}
        {inputHintShown && (
          <InputHint variant="centered">
            Consider uploading a photo so members know who they’re messaging.
          </InputHint>
        )}
      </StyledField>
    </Fieldset>
  );
}

export default AvatarUploadView;
