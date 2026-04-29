"use client";

import { styled } from "next-yak";
import { useRouter } from "next/navigation";

import IconButton from "@/components/IconButton";
import { theme } from "@/styles/theme.yak";

const ViewerPage = styled.main`
  background: #000;
  color: #fff;
  min-height: 100dvh;
  padding: max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  position: relative;
`;

const ViewerToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  left: 0;
  padding: 0.5rem;
  position: absolute;
  right: 0;
  top: 0;

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const CloseButton = styled(IconButton)`
  backdrop-filter: blur(16px);
  background: rgba(17, 17, 17, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  &:visited {
    color: rgba(255, 255, 255, 0.92);
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    background: rgba(28, 28, 28, 0.9);
    border-color: rgba(255, 255, 255, 0.24);
    color: #fff;
  }

  &:focus,
  &[data-focus] {
    outline: 3px solid rgba(255, 255, 255, 0.94);
    outline-offset: 2px;
  }
`;

const ViewerBody = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: calc(100dvh - 2rem);

  @media (min-width: 768px) {
    min-height: calc(100dvh - 3rem);
  }
`;

const ViewerImage = styled.img`
  border-radius: 0.5rem;
  display: block;
  margin: 0 auto;
  max-height: calc(100dvh - 7rem);
  max-width: 100%;
  object-fit: contain;
  outline: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 0 2px ${theme.colors.border.elevated},
    0 24px 80px rgba(0, 0, 0, 0.45);

  @media (min-width: 768px) {
    max-height: calc(100dvh - 9rem);
  }
`;

export default function StandaloneListingPhotoPage({
  alt,
  backHref,
  closeLabel,
  src,
}: {
  alt: string;
  backHref: string;
  closeLabel: string;
  src: string;
}) {
  const router = useRouter();

  return (
    <ViewerPage data-testid="listing-photo-tab-viewer">
      <ViewerToolbar>
        <CloseButton
          aria-label={closeLabel}
          data-testid="listing-photo-tab-viewer-close"
          icon="close"
          onClick={() => {
            window.close();
            window.setTimeout(() => {
              router.replace(backHref);
            }, 150);
          }}
          title={closeLabel}
          variant="subtle"
        />
      </ViewerToolbar>

      <ViewerBody>
        <ViewerImage
          alt={alt}
          data-testid="listing-photo-tab-viewer-image"
          src={src}
        />
      </ViewerBody>
    </ViewerPage>
  );
}
