"use client";
import { theme } from "@/styles/theme.yak";

import { useState, useRef } from "react";

import DropdownMenu from "@/components/DropdownMenu";
import Avatar from "@/components/Avatar";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Button from "@/components/Button";
import InputHint from "@/components/InputHint";

import { styled } from "next-yak";
import { useTranslations } from "next-intl";

const StyledField = styled(Field)`
  align-items: center;
  margin-top: 0.5rem;
`;

const AvatarControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledImgContainer = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const AvatarButtonOverlay = styled.div`
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
  z-index: 1;
`;

const AvatarButton = styled(Button)`
  z-index: 1;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  position: absolute;
  inset: 0;
  background-color: ${theme.colors.background.overlay};
  color: ${theme.colors.text.overlay};
  transform: rotate(${theme.rotations.avatar});
  border-radius: ${theme.corners.avatar.large};
`;

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
  const t = useTranslations();
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
    <Fieldset data-testid={`avatar-upload-${bucket}`}>
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

        <AvatarControls>
          <StyledImgContainer>
            <AvatarComponent
              bucket={bucket}
              filename={avatar}
              alt={t("Upload.avatarAlt")}
              size="massive"
              listing={listingType ? { type: listingType } : undefined}
            />

            {loading && (
              <LoadingSpinner>{t("Status.uploading")}</LoadingSpinner>
            )}

            <AvatarButtonOverlay>
              {!avatar ? (
                // Scenario 1: No avatar - show single "Add" button
                <AvatarButton
                  variant="secondary"
                  size="small"
                  onClick={handleFileSelect}
                  loading={loading}
                  loadingText={t("Status.uploading")}
                  disabled={isBusy}
                >
                  {t("Actions.add")}
                </AvatarButton>
              ) : (
                // Scenario 2 & 3: Has avatar - show menu with options
                <DropdownMenu.Root>
                  <DropdownMenu.Button
                    as={AvatarButton}
                    variant="secondary"
                    size="small"
                    loading={loading || isDeleting}
                    loadingText={
                      loading ? t("Status.uploading") : t("Status.deleting")
                    }
                    disabled={isBusy}
                  >
                    {t("Actions.edit")}
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
                        width="full"
                        disabled={isBusy}
                      >
                        {t("Actions.replace")}
                      </Button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Button
                        onClick={handleDelete}
                        variant="danger"
                        size="small"
                        width="full"
                        loading={isDeleting}
                        loadingText={t("Status.deleting")}
                        disabled={isBusy}
                      >
                        {t("Actions.delete")}
                      </Button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Items>
                </DropdownMenu.Root>
              )}
            </AvatarButtonOverlay>
          </StyledImgContainer>
        </AvatarControls>
        {inputHintShown && (
          <InputHint variant="centered">{t("Upload.avatarHint")}</InputHint>
        )}
      </StyledField>
    </Fieldset>
  );
}

export default AvatarUploadView;
