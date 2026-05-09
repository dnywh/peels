"use client";

import dynamic from "next/dynamic";

import HomepageDemoPlaceholder from "@/components/HomepageDemoPlaceholder";
import { useDeferredHomepageDemo } from "@/hooks/useDeferredHomepageDemo";

const PeelsMapDemo = dynamic(() => import("@/components/PeelsMapDemo"), {
  ssr: false,
  loading: () => <HomepageDemoPlaceholder variant="map" />,
});

export default function DeferredPeelsMapDemo() {
  const { isReady, rootRef } = useDeferredHomepageDemo();

  return (
    <div ref={rootRef} data-testid="homepage-map-demo-shell">
      {isReady ? <PeelsMapDemo /> : <HomepageDemoPlaceholder variant="map" />}
    </div>
  );
}
