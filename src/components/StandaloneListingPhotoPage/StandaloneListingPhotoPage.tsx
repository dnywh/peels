"use client";

import { styled } from "next-yak";
import { useRouter } from "next/navigation";

import IconButton from "@/components/IconButton";
import {
  sharedMediaFrameBorderWidth,
  sharedMediaFrameRadius,
} from "@/styles/mediaFrame";

const ViewerPage = styled.main`
  background: #000;
  color: #fff;
  min-height: 100dvh;
  position: relative;
`;

const ViewerToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  left: 0;
  padding: max(0.75rem, env(safe-area-inset-top))
    max(0.75rem, env(safe-area-inset-right)) 0
    max(0.75rem, env(safe-area-inset-left));
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
  min-height: 100dvh;
  padding: 0 max(0.5rem, env(safe-area-inset-right)) 0
    max(0.5rem, env(safe-area-inset-left));

  @media (min-width: 768px) {
    padding: 0 max(1rem, env(safe-area-inset-right)) 0
      max(1rem, env(safe-area-inset-left));
  }
`;

const ViewerImage = styled.img`
  border-radius: ${sharedMediaFrameRadius};
  border: ${sharedMediaFrameBorderWidth} solid rgba(255, 255, 255, 0.16);
  display: block;
  margin: 0 auto;
  max-height: calc(100dvh - 4.75rem);
  max-width: calc(100vw - 1rem);
  object-fit: contain;
  background: rgba(255, 255, 255, 0.02);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 24px 80px rgba(0, 0, 0, 0.45);

  @media (min-width: 768px) {
    max-height: calc(100dvh - 6.5rem);
    max-width: calc(100vw - 2rem);
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
