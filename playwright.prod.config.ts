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
        command: `npm run start -- --hostname ${playwrightHost} --port ${playwrightPort}`,
        reuseExistingServer: false,
      }
    : undefined,
});
