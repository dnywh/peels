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
  color: "white",
  fontSize: "20px",

  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.colors.background.overlay,
  color: theme.colors.text.overlay,
  // Match Avatar
  transform: `rotate(${theme.rotations.avatar})`,
  borderRadius: theme.corners.avatar,
}));

function AvatarUploadView({
  avatar,
  onChange,
  onDelete,
  getAvatarUrl,
  bucket,
  inputHintShown = false,
  listingType,
}) {
  // Hidden file input that we'll trigger programmatically
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    setLoading(true);
    await onChange(event);
    setLoading(false);
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
          style={{ display: "none" }}
        />

        <StyledImgContainer>
          <Avatar
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
                >
                  Replace
                </Button>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Button onClick={onDelete} variant="danger" size="small">
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
