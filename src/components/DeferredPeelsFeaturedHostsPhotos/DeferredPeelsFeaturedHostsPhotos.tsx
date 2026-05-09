"use client";

import dynamic from "next/dynamic";

import HomepageDemoPlaceholder from "@/components/HomepageDemoPlaceholder";
import { useDeferredHomepageDemo } from "@/hooks/useDeferredHomepageDemo";

const PeelsFeaturedHostsPhotos = dynamic(
  () => import("@/components/PeelsFeaturedHostsPhotos"),
  {
    ssr: false,
    loading: () => <HomepageDemoPlaceholder variant="photos" />,
  }
);

export default function DeferredPeelsFeaturedHostsPhotos() {
  const { isReady, rootRef } = useDeferredHomepageDemo();

  return (
    <div ref={rootRef} data-testid="homepage-featured-hosts-shell">
      {isReady ? (
        <PeelsFeaturedHostsPhotos />
      ) : (
        <HomepageDemoPlaceholder variant="photos" />
      )}
    </div>
  );
}
