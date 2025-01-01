"use client";

import { useState, useRef } from "react";

import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Button from "@/components/Button";

// import { Menu, MenuButton, MenuItem, MenuItems } from "@/components/Menu";
// import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Menu from "@/components/Menu";

import { styled } from "@pigment-css/react";

const StyledImgContainer = styled("div")({
  position: "relative",
  borderRadius: "50%",
  border: "4px solid #e5e7eb",
  width: "100px",
  height: "100px",
  overflow: "hidden",
});

const StyledImg = styled("img")({
  objectFit: "cover",
});

function AvatarUploadView({ avatar, onChange, onDelete, getAvatarUrl }) {
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
      <Field>
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
          <StyledImg
            src={
              avatar
                ? getAvatarUrl(avatar)
                : "https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/listing_avatars/blank1.png"
            }
            alt="Your avatar"
            style={{ width: "100px" }}
          />

          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% black overlay
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "20px",
                zIndex: 1, // Ensure overlay is above the image
              }}
            >
              Loading...
            </div>
          )}
        </StyledImgContainer>

        {!avatar ? (
          // Scenario 1: No avatar - show single "Add" button
          <Button onClick={handleFileSelect}>Add</Button>
        ) : (
          // Scenario 2 & 3: Has avatar - show menu with options
          <Menu>
            <Menu.Button as={Button}>Edit</Menu.Button>

            <Menu.Items>
              <Menu.Item>
                <button onClick={handleFileSelect}>Replace</button>
              </Menu.Item>
              <Menu.Item>
                <button onClick={onDelete}>Delete</button>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </Field>
    </Fieldset>
  );
}

export default AvatarUploadView;
