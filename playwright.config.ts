import { defineConfig } from "@playwright/test";
import {
  playwrightHost,
  playwrightPort,
  sharedPlaywrightConfig,
  sharedWebServer,
  shouldStartWebServer,
} from "./playwright.shared";

export default defineConfig({
  ...sharedPlaywrightConfig,
  webServer: shouldStartWebServer
    ? {
        ...sharedWebServer,
        command: `PEELS_E2E=1 npm run dev -- --hostname ${playwrightHost} --port ${playwrightPort}`,
      }
    : undefined,
});
