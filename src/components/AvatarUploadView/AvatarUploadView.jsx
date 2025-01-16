"use client";

import { useState, useRef } from "react";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Avatar from "@/components/Avatar";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Button from "@/components/Button";

import { styled } from "@pigment-css/react";

const StyledMenuItems = styled(MenuItems)(({ theme }) => ({
  // className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
  width: "auto",
  origin: "top center",
  // rounded: "xl",
  background: theme.colors.background.top,
  padding: "0.5rem",
  borderRadius: theme.corners.base,
  // text: "sm/6",
  // textColor: "white",
  transition: "opacity 100ms ease-out, scale 100ms ease-out",

  display: "flex",
  flexDirection: "column",

  boxShadow: `0px 0px 3px 1px rgba(0, 0, 0, 0.06)`,
  // gap: "1px",

  "&[data-focus]": {
    // outline: "2px solid var(--color-primary)",
    // outlineOffset: "2px",
  },

  "&[data-closed]": {
    scale: "0.95",
    opacity: "0",
  },
}));

const StyledMenuItem = styled(MenuItem)({
  // padding: "0.25rem 0.5rem",
  // background: "white",
  // borderRadius: "0.25rem",
  // border: "1px solid grey",
  // background: "red",
  // "&[data-focus]": {
  //   background: "lightgrey",
  //   outline: "none",
  //   border: "none",
  // },
});

const StyledField = styled(Field)({
  alignItems: "center",
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
          <Avatar bucket={bucket} filename={avatar} alt="Your avatar" />

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
          <Menu>
            <MenuButton as={AvatarButton} variant="secondary" size="small">
              Edit
            </MenuButton>

            <StyledMenuItems transition anchor={{ to: "bottom", gap: "4px" }}>
              <StyledMenuItem>
                <Button
                  onClick={handleFileSelect}
                  variant="secondary"
                  size="dropdown"
                >
                  Replace
                </Button>
              </StyledMenuItem>
              <StyledMenuItem>
                <Button onClick={onDelete} variant="danger" size="dropdown">
                  Delete
                </Button>
              </StyledMenuItem>
            </StyledMenuItems>
          </Menu>
        )}
      </StyledField>
    </Fieldset>
  );
}

export default AvatarUploadView;
