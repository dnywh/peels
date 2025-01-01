"use client";

import { useRef } from "react";

import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Button from "@/components/Button";

// import { Menu, MenuButton, MenuItem, MenuItems } from "@/components/Menu";
// import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Menu from "@/components/Menu";

import { styled } from "@pigment-css/react";

const StyledImg = styled("img")({
  borderRadius: "50%",
  border: "4px solid #e5e7eb",
  width: "100px",
  height: "100px",
  objectFit: "cover",
});

function AvatarUploader({ avatar, onChange, onDelete, getAvatarUrl }) {
  // Hidden file input that we'll trigger programmatically
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Fieldset>
      <Field>
        <Label htmlFor="avatar">Avatar</Label>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={false}
          onChange={onChange}
          style={{ display: "none" }}
        />

        <div>
          <StyledImg
            src={
              avatar
                ? getAvatarUrl(avatar)
                : "https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/listing_avatars/blank1.png"
            }
            alt="Avatar"
            style={{ width: "100px" }}
          />

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
        </div>
      </Field>
    </Fieldset>
  );
}

export default AvatarUploader;
