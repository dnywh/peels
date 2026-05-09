"use client";

import dynamic from "next/dynamic";

import HomepageDemoPlaceholder from "@/components/HomepageDemoPlaceholder";
import { useDeferredHomepageDemo } from "@/hooks/useDeferredHomepageDemo";

const PeelsChatDemo = dynamic(() => import("@/components/PeelsChatDemo"), {
  ssr: false,
  loading: () => <HomepageDemoPlaceholder variant="chat" />,
});

export default function DeferredPeelsChatDemo() {
  const { isReady, rootRef } = useDeferredHomepageDemo();

  return (
    <div ref={rootRef} data-testid="homepage-chat-demo-shell">
      {isReady ? <PeelsChatDemo /> : <HomepageDemoPlaceholder variant="chat" />}
    </div>
  );
}
